import { pbkdf2 } from "node:crypto";

const encoder = new TextEncoder();
const FRONTEND_ORIGIN = "https://medunity.delyone.com";
const DEFAULT_CALLBACK = "https://medunity-api.dr-delyone.workers.dev/auth/govbr/callback";
const DEFAULT_RETURN = `${FRONTEND_ORIGIN}/`;
const STATE_TTL_SECONDS = 10 * 60;
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function base64url(bytes) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function randomToken(bytes = 32) {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function sha256Base64url(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return base64url(digest);
}

function parseJwt(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("invalid_jwt");
  return {
    header: JSON.parse(new TextDecoder().decode(fromBase64url(parts[0]))),
    payload: JSON.parse(new TextDecoder().decode(fromBase64url(parts[1]))),
    signingInput: `${parts[0]}.${parts[1]}`,
    signature: fromBase64url(parts[2]),
  };
}

async function verifyJwtWithJwk(token, jwk, expected) {
  const parsed = parseJwt(token);
  if (parsed.header.alg !== "RS256" || parsed.header.kid !== jwk.kid) {
    throw new Error("invalid_jwt_header");
  }

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    parsed.signature,
    encoder.encode(parsed.signingInput),
  );

  if (!valid) throw new Error("invalid_jwt_signature");

  const now = Math.floor(Date.now() / 1000);
  if (!parsed.payload.exp || Number(parsed.payload.exp) <= now) {
    throw new Error("expired_jwt");
  }

  if (expected.issuer && parsed.payload.iss !== expected.issuer) {
    throw new Error("invalid_jwt_issuer");
  }

  const aud = Array.isArray(parsed.payload.aud)
    ? parsed.payload.aud
    : [parsed.payload.aud];
  if (expected.audience && !aud.includes(expected.audience)) {
    throw new Error("invalid_jwt_audience");
  }

  if (expected.nonce && parsed.payload.nonce !== expected.nonce) {
    throw new Error("invalid_jwt_nonce");
  }

  return parsed.payload;
}

async function getGovbrJwk(baseUrl, kid) {
  const response = await fetch(`${baseUrl}/jwk`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("govbr_jwk_unavailable");
  const data = await response.json();
  const jwk = Array.isArray(data?.keys)
    ? data.keys.find((key) => key.kid === kid)
    : null;
  if (!jwk) throw new Error("govbr_jwk_not_found");
  return jwk;
}

async function verifyGovbrToken(token, env, expected) {
  const parsed = parseJwt(token);
  const baseUrl = env.GOVBR_BASE_URL || "https://sso.staging.acesso.gov.br";
  const jwk = await getGovbrJwk(baseUrl, parsed.header.kid);
  return verifyJwtWithJwk(token, jwk, expected);
}

function getConfig(env) {
  const baseUrl = env.GOVBR_BASE_URL || "https://sso.staging.acesso.gov.br";
  const clientId = env.GOVBR_CLIENT_ID;
  const clientSecret = env.GOVBR_CLIENT_SECRET;
  const redirectUri = env.GOVBR_REDIRECT_URI || DEFAULT_CALLBACK;
  const returnUrl = env.GOVBR_RETURN_URL || DEFAULT_RETURN;

  if (!clientId || !clientSecret) {
    throw new Error("govbr_credentials_not_configured");
  }

  if (!redirectUri.startsWith("https://")) {
    throw new Error("govbr_redirect_must_use_https");
  }

  if (!returnUrl.startsWith(FRONTEND_ORIGIN)) {
    throw new Error("govbr_return_url_not_allowed");
  }

  return { baseUrl, clientId, clientSecret, redirectUri, returnUrl };
}

function makeCodeVerifier() {
  // 64 random bytes => a BASE64URL value comfortably inside the 43-128 range required by GOV.BR.
  return randomToken(48);
}

async function makeCodeChallenge(verifier) {
  return sha256Base64url(verifier);
}

function cookieValue(request, name) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function createGovbrSession(env, userId) {
  const raw = randomToken(32);
  const hash = await sha256Base64url(raw);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;

  await env.DB
    .prepare(
      "INSERT INTO govbr_sessions (session_hash, usuario_id, expires_at) VALUES (?, ?, ?)",
    )
    .bind(hash, userId, expiresAt)
    .run();

  return { raw, expiresAt };
}

async function ensureLocalUser(env, profile) {
  const cpf = String(profile.sub || "").replace(/\D/g, "");
  if (!cpf) throw new Error("govbr_cpf_missing");

  const email = typeof profile.email === "string"
    ? profile.email.trim().toLowerCase()
    : "";
  const name = String(profile.name || profile.social_name || "Usuário GOV.BR").trim();

  let row = await env.DB
    .prepare("SELECT id, perfil, ativo FROM usuarios WHERE cpf = ? LIMIT 1")
    .bind(cpf)
    .first();

  if (!row && email) {
    row = await env.DB
      .prepare("SELECT id, perfil, ativo FROM usuarios WHERE email = ? LIMIT 1")
      .bind(email)
      .first();
  }

  if (row) {
    if (Number(row.ativo) !== 1) throw new Error("user_inactive");
    if (row.perfil === "admin") throw new Error("govbr_admin_link_blocked");

    await env.DB
      .prepare(
        "UPDATE usuarios SET nome_completo = COALESCE(NULLIF(?, ''), nome_completo), email = COALESCE(NULLIF(?, ''), email), cpf = COALESCE(NULLIF(?, ''), cpf) WHERE id = ?",
      )
      .bind(name, email, cpf, Number(row.id))
      .run();

    return Number(row.id);
  }

  const nomeUsuario = `govbr_${cpf}`;
  const unusablePassword = await createUnusablePasswordRecord();

  try {
    const result = await env.DB
      .prepare(
        `INSERT INTO usuarios
          (nome_usuario, senha_hash, perfil, ativo, nome_completo, cpf, email)
         VALUES (?, ?, 'usuario', 1, ?, ?, ?)`,
      )
      .bind(nomeUsuario, unusablePassword, name, cpf, email)
      .run();

    return Number(result.meta?.last_row_id);
  } catch (error) {
    if (String(error?.message || "").toLowerCase().includes("unique")) {
      const retry = await env.DB
        .prepare("SELECT id, perfil, ativo FROM usuarios WHERE nome_usuario = ? LIMIT 1")
        .bind(nomeUsuario)
        .first();
      if (retry && Number(retry.ativo) === 1 && retry.perfil !== "admin") {
        return Number(retry.id);
      }
    }
    throw error;
  }
}

async function createUnusablePasswordRecord() {
  const password = randomToken(48);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await new Promise((resolve, reject) => {
    pbkdf2(
      encoder.encode(password),
      salt,
      100000,
      32,
      "sha256",
      (error, key) => (error ? reject(error) : resolve(new Uint8Array(key))),
    );
  });
  return `pbkdf2$sha256$100000$${base64url(salt)}$${base64url(derived)}`;
}

async function handleGovbrStart(request, env) {
  const config = getConfig(env);
  if (!env.DB) throw new Error("database_not_configured");

  const state = randomToken(32);
  const stateHash = await sha256Base64url(state);
  const nonce = randomToken(32);
  const codeVerifier = makeCodeVerifier();
  const codeChallenge = await makeCodeChallenge(codeVerifier);
  const expiresAt = Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS;

  await env.DB
    .prepare(
      "INSERT INTO govbr_auth_states (state_hash, nonce, code_verifier, return_to, expires_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(stateHash, nonce, codeVerifier, config.returnUrl, expiresAt)
    .run();

  const authorize = new URL(`${config.baseUrl}/authorize`);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", config.clientId);
  authorize.searchParams.set(
    "scope",
    "openid email profile govbr_confiabilidades govbr_confiabilidades_idtoken",
  );
  authorize.searchParams.set("redirect_uri", config.redirectUri);
  authorize.searchParams.set("nonce", nonce);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("code_challenge", codeChallenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  return Response.redirect(authorize.toString(), 302);
}

async function exchangeCode(config, code, verifier) {
  const basic = btoa(`${config.clientId}:${config.clientSecret}`);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch(`${config.baseUrl}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
      Accept: "application/json",
    },
    body,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token || !data.id_token) {
    console.error("GOV.BR token exchange failed", response.status, data?.error);
    throw new Error("govbr_token_exchange_failed");
  }
  return data;
}

async function handleGovbrCallback(request, env) {
  const config = getConfig(env);
  if (!env.DB) throw new Error("database_not_configured");

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return Response.redirect(`${config.returnUrl}?govbr=error&reason=${encodeURIComponent(error)}`, 302);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) throw new Error("govbr_callback_missing_parameters");

  const stateHash = await sha256Base64url(state);
  const stateRow = await env.DB
    .prepare(
      "SELECT id, nonce, code_verifier, return_to, expires_at, usado_em FROM govbr_auth_states WHERE state_hash = ? LIMIT 1",
    )
    .bind(stateHash)
    .first();

  const now = Math.floor(Date.now() / 1000);
  if (!stateRow || Number(stateRow.expires_at) <= now || stateRow.usado_em) {
    throw new Error("govbr_invalid_state");
  }

  await env.DB
    .prepare("UPDATE govbr_auth_states SET usado_em = ? WHERE id = ? AND usado_em IS NULL")
    .bind(now, Number(stateRow.id))
    .run();

  const tokens = await exchangeCode(config, code, stateRow.code_verifier);
  const issuer = `${config.baseUrl}/`;

  const accessClaims = await verifyGovbrToken(tokens.access_token, env, {
    issuer,
    audience: config.clientId,
  });

  const idClaims = await verifyGovbrToken(tokens.id_token, env, {
    issuer,
    audience: config.clientId,
    nonce: stateRow.nonce,
  });

  const profileResponse = await fetch(`${config.baseUrl}/userinfo`, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      Accept: "application/json",
    },
  });
  if (!profileResponse.ok) throw new Error("govbr_userinfo_failed");
  const profile = await profileResponse.json();

  if (String(accessClaims.sub || "") !== String(idClaims.sub || "")) {
    throw new Error("govbr_subject_mismatch");
  }

  const mergedProfile = {
    ...idClaims,
    ...profile,
    sub: String(idClaims.sub || profile.sub || "").replace(/\D/g, ""),
    name: profile.name || idClaims.name,
    email: profile.email || idClaims.email,
    social_name: profile.social_name || idClaims.social_name,
  };

  const userId = await ensureLocalUser(env, mergedProfile);
  const session = await createGovbrSession(env, userId);

  const returnTo = String(stateRow.return_to || config.returnUrl);
  const destination = new URL(returnTo);
  destination.searchParams.set("govbr", "authenticated");

  const response = Response.redirect(destination.toString(), 302);
  response.headers.set(
    "Set-Cookie",
    `medunity_govbr_session=${encodeURIComponent(session.raw)}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  );
  return response;
}

async function handleGovbrMe(request, env) {
  if (!env.DB) throw new Error("database_not_configured");
  const raw = cookieValue(request, "medunity_govbr_session");
  if (!raw) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  const hash = await sha256Base64url(raw);
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB
    .prepare(
      `SELECT s.expires_at, u.id, u.nome_usuario, u.nome_completo, u.cpf, u.email, u.perfil, u.ativo
       FROM govbr_sessions s
       JOIN usuarios u ON u.id = s.usuario_id
       WHERE s.session_hash = ? AND s.revogado_em IS NULL AND s.expires_at > ? AND u.ativo = 1
       LIMIT 1`,
    )
    .bind(hash, now)
    .first();

  if (!row) return Response.json({ authenticated: false }, { status: 401 });

  return Response.json({
    authenticated: true,
    usuario: {
      id: Number(row.id),
      nome_usuario: row.nome_usuario,
      nome_completo: row.nome_completo || "",
      cpf: row.cpf || "",
      email: row.email || "",
      perfil: row.perfil,
    },
    expires_at: Number(row.expires_at),
  });
}

async function handleGovbrLogout(request, env) {
  const config = getConfig(env);
  const raw = cookieValue(request, "medunity_govbr_session");
  if (raw && env.DB) {
    const hash = await sha256Base64url(raw);
    await env.DB
      .prepare("UPDATE govbr_sessions SET revogado_em = ? WHERE session_hash = ? AND revogado_em IS NULL")
      .bind(Math.floor(Date.now() / 1000), hash)
      .run();
  }

  const destination = new URL(`${config.baseUrl}/logout`);
  destination.searchParams.set("post_logout_redirect_uri", config.returnUrl);

  const response = Response.redirect(destination.toString(), 302);
  response.headers.set(
    "Set-Cookie",
    "medunity_govbr_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
  );
  return response;
}

function govbrConfigResponse(env) {
  const callback = env.GOVBR_REDIRECT_URI || DEFAULT_CALLBACK;
  const returnUrl = env.GOVBR_RETURN_URL || DEFAULT_RETURN;
  return Response.json({
    status: "configured",
    homologacao: {
      callback_url: callback,
      homepage_url: returnUrl,
      logout_url: `${DEFAULT_CALLBACK.replace(/\/callback$/, "/logout")}`,
      authorize_url: `${env.GOVBR_BASE_URL || "https://sso.staging.acesso.gov.br"}/authorize`,
      token_url: `${env.GOVBR_BASE_URL || "https://sso.staging.acesso.gov.br"}/token`,
    },
  });
}

export async function handleGovbr(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/auth/govbr/config" && request.method === "GET") {
    return govbrConfigResponse(env);
  }

  if (url.pathname === "/auth/govbr" && request.method === "GET") {
    return handleGovbrStart(request, env);
  }

  if (url.pathname === "/auth/govbr/callback" && request.method === "GET") {
    return handleGovbrCallback(request, env);
  }

  if (url.pathname === "/auth/govbr/me" && request.method === "GET") {
    return handleGovbrMe(request, env);
  }

  if (url.pathname === "/auth/govbr/logout" && (request.method === "GET" || request.method === "POST")) {
    return handleGovbrLogout(request, env);
  }

  return null;
}
