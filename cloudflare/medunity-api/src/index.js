const encoder = new TextEncoder();

const JWT_TTL_SECONDS = 30 * 60;
const PBKDF2_ITERATIONS = 120000;
const ALLOWED_ORIGINS = new Set([
  "https://medunity.delyone.com",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Bootstrap-Secret",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function json(data, status = 200, request) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...corsHeaders(request),
  };

  return new Response(JSON.stringify(data), { status, headers });
}

function empty(status, request) {
  return new Response(null, {
    status,
    headers: corsHeaders(request),
  });
}

function base64url(bytes) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/g, "");
}

function base64urlText(text) {
  return base64url(encoder.encode(text));
}

function fromBase64url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function constantTimeEqual(a, b) {
  const aa = encoder.encode(a);
  const bb = encoder.encode(b);
  if (aa.byteLength !== bb.byteLength) {
    return false;
  }
  return crypto.subtle.timingSafeEqual(aa, bb);
}

async function hmacSha256(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  return crypto.subtle.sign("HMAC", key, encoder.encode(value));
}

async function signJwt(payload, secret) {
  const header = base64urlText(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64urlText(JSON.stringify(payload));
  const signingInput = header + "." + body;
  const signature = await hmacSha256(secret, signingInput);
  return signingInput + "." + base64url(signature);
}

async function verifyJwt(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("invalid_token");
  }

  const [header, payloadPart, signaturePart] = parts;
  const headerData = JSON.parse(new TextDecoder().decode(fromBase64url(header)));
  if (headerData.alg !== "HS256" || headerData.typ !== "JWT") {
    throw new Error("invalid_token");
  }

  const expected = await hmacSha256(secret, header + "." + payloadPart);
  const actual = fromBase64url(signaturePart);

  if (
    expected.byteLength !== actual.byteLength ||
    !crypto.subtle.timingSafeEqual(expected, actual)
  ) {
    throw new Error("invalid_token");
  }

  const payload = JSON.parse(
    new TextDecoder().decode(fromBase64url(payloadPart)),
  );

  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("expired_token");
  }

  return payload;
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function derivePasswordHash(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    256,
  );

  return new Uint8Array(bits);
}

async function createPasswordRecord(password) {
  const salt = randomBytes(16);
  const hash = await derivePasswordHash(password, salt);

  return [
    "pbkdf2",
    "sha256",
    String(PBKDF2_ITERATIONS),
    base64url(salt),
    base64url(hash),
  ].join("$");
}

async function verifyPassword(password, record) {
  const parts = record.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") {
    return false;
  }

  const iterations = Number(parts[2]);
  if (!Number.isInteger(iterations) || iterations < 10000) {
    return false;
  }

  const salt = fromBase64url(parts[3]);
  const expected = fromBase64url(parts[4]);
  const actual = await derivePasswordHashWithIterations(password, salt, iterations);

  if (actual.byteLength !== expected.byteLength) {
    return false;
  }

  return crypto.subtle.timingSafeEqual(actual, expected);
}

async function derivePasswordHashWithIterations(password, salt, iterations) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    256,
  );

  return new Uint8Array(bits);
}

function extractBearer(request) {
  const value = request.headers.get("Authorization") || "";
  if (!value.startsWith("Bearer ")) {
    return null;
  }
  return value.slice(7).trim() || null;
}

async function getAuthenticatedUser(request, env) {
  if (!env.JWT_SECRET) {
    throw new Error("server_configuration");
  }

  const token = extractBearer(request);
  if (!token) {
    throw new Error("missing_token");
  }

  const payload = await verifyJwt(token, env.JWT_SECRET);
  const userId = Number(payload.sub);

  if (!Number.isInteger(userId)) {
    throw new Error("invalid_token");
  }

  const row = await env.DB
    .prepare(
      "SELECT id, nome_usuario, perfil, ativo FROM usuarios WHERE id = ? LIMIT 1",
    )
    .bind(userId)
    .first();

  if (!row || Number(row.ativo) !== 1) {
    throw new Error("user_inactive");
  }

  return {
    id: Number(row.id),
    nome_usuario: row.nome_usuario,
    perfil: row.perfil,
  };
}

async function handleBootstrap(request, env) {
  if (!env.BOOTSTRAP_SECRET) {
    return json({ detail: "Bootstrap não configurado." }, 503, request);
  }

  const providedSecret = request.headers.get("X-Bootstrap-Secret") || "";
  if (!constantTimeEqual(providedSecret, env.BOOTSTRAP_SECRET)) {
    return json({ detail: "Não autorizado." }, 401, request);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.nome_usuario !== "string" || typeof body.senha !== "string") {
    return json({ detail: "Informe nome_usuario e senha." }, 400, request);
  }

  const username = body.nome_usuario.trim();
  const password = body.senha;

  if (username.length < 3 || password.length < 12) {
    return json(
      { detail: "Usuário inválido ou senha muito curta." },
      400,
      request,
    );
  }

  const existing = await env.DB
    .prepare("SELECT COUNT(*) AS total FROM usuarios WHERE perfil = 'admin' AND ativo = 1")
    .first();

  if (Number(existing?.total || 0) > 0) {
    return json(
      { detail: "Administrador já configurado." },
      409,
      request,
    );
  }

  const passwordHash = await createPasswordRecord(password);

  await env.DB
    .prepare(
      "INSERT INTO usuarios (nome_usuario, senha_hash, perfil, ativo) VALUES (?, ?, 'admin', 1)",
    )
    .bind(username, passwordHash)
    .run();

  return json(
    {
      status: "configurado",
      usuario: {
        nome_usuario: username,
        perfil: "admin",
      },
    },
    201,
    request,
  );
}

async function handleLogin(request, env) {
  if (!env.DB || !env.JWT_SECRET) {
    return json({ detail: "API não configurada." }, 503, request);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.nome_usuario !== "string" || typeof body.senha !== "string") {
    return json({ detail: "Informe nome_usuario e senha." }, 400, request);
  }

  const username = body.nome_usuario.trim();

  const row = await env.DB
    .prepare(
      "SELECT id, nome_usuario, senha_hash, perfil, ativo FROM usuarios WHERE nome_usuario = ? LIMIT 1",
    )
    .bind(username)
    .first();

  const valid = row && Number(row.ativo) === 1
    ? await verifyPassword(body.senha, row.senha_hash)
    : false;

  if (!valid) {
    return json({ detail: "Usuário ou senha inválidos." }, 401, request);
  }

  const now = Math.floor(Date.now() / 1000);
  const token = await signJwt(
    {
      sub: String(row.id),
      nome_usuario: row.nome_usuario,
      perfil: row.perfil,
      iat: now,
      exp: now + JWT_TTL_SECONDS,
    },
    env.JWT_SECRET,
  );

  return json(
    {
      status: "autenticado",
      access_token: token,
      token_type: "bearer",
      expires_in: JWT_TTL_SECONDS,
      usuario: {
        id: Number(row.id),
        nome_usuario: row.nome_usuario,
        perfil: row.perfil,
      },
    },
    200,
    request,
  );
}

async function handleMe(request, env) {
  try {
    const usuario = await getAuthenticatedUser(request, env);
    return json({ status: "autenticado", usuario }, 200, request);
  } catch (error) {
    if (error.message === "missing_token") {
      return json(
        { detail: "Autenticação necessária." },
        401,
        request,
      );
    }

    if (error.message === "expired_token") {
      return json({ detail: "Token expirado." }, 401, request);
    }

    if (error.message === "user_inactive") {
      return json({ detail: "Usuário inativo." }, 401, request);
    }

    return json({ detail: "Token inválido." }, 401, request);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return empty(204, request);
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/health" && request.method === "GET") {
        if (!env.DB) {
          return json(
            { status: "degraded", api: "online", database: "not_bound" },
            503,
            request,
          );
        }

        const result = await env.DB.prepare("SELECT 1 AS ok").first();
        return json(
          {
            status: "ok",
            api: "online",
            database: result?.ok === 1 ? "connected" : "error",
          },
          200,
          request,
        );
      }

      if (url.pathname === "/setup/admin" && request.method === "POST") {
        if (!env.DB) {
          return json({ detail: "Banco D1 não configurado." }, 503, request);
        }
        return handleBootstrap(request, env);
      }

      if (url.pathname === "/login" && request.method === "POST") {
        return handleLogin(request, env);
      }

      if (url.pathname === "/me" && request.method === "GET") {
        return handleMe(request, env);
      }

      return json({ detail: "Rota não encontrada." }, 404, request);
    } catch (error) {
      console.error("MedUnity API error", error);
      return json(
        { detail: "Erro interno da API." },
        500,
        request,
      );
    }
  },
};
