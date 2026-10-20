/**
 * MedUnity SNCR API adapter — Cloudflare Worker.
 * Manual basis: SNCR API Manual, 3rd ed. (Sep 2026), supplied in project.
 *
 * Required Worker secrets/vars:
 *   SNCR_ADMIN_TEST_KEY (secret, long random value; temporary admin-only test gate)
 *   SNCR_ENV ("homologacao" or "producao"; default homologacao)
 *   SNCR_CALLBACK_URL (exact HTTPS callback registered with SNCR)
 *   SNCR_FRONTEND_ORIGIN (exact allowed MedUnity origin)
 *   SNCR_STATE_HMAC_SECRET (secret, 32+ random bytes)
 *   SNCR_CLIENT_ID (if provided/required by SNCR's current Keycloak configuration)
 * Bind KV namespace SNCR_SESSIONS for short-lived login state and access tokens.
 *
 * Do not use production until the official callback is registered and end-to-end
 * verification is complete. Never log credentials, tokens, session_id, or patient data.
 */
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
const enc = new TextEncoder();
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)))
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const randomId = (n = 32) => b64url(crypto.getRandomValues(new Uint8Array(n)));
const apiBase = (env) => env.SNCR_ENV === "producao"
  ? "https://sncr-api.apps.anvisa.gov.br"
  : "https://sncr-api-hmg.apps.anvisa.gov.br";

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}
async function signedState(payload, secret) {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  return body + "." + await hmac(body, secret);
}
async function verifyState(state, secret) {
  if (!state || !state.includes(".")) return null;
  const [body, signature] = state.split(".");
  const expected = await hmac(body, secret);
  if (signature.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  try { return JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/"))); } catch { return null; }
}
function cors(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = origin === env.SNCR_FRONTEND_ORIGIN;
  return {
    "access-control-allow-origin": allowed ? origin : "null",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "Content-Type,Authorization,X-MedUnity-Admin-Key",
    "access-control-max-age": "600",
    "vary": "Origin"
  };
}
function withCors(response, request, env) {
  const h = new Headers(response.headers);
  Object.entries(cors(request, env)).forEach(([k,v]) => h.set(k,v));
  return new Response(response.body, {status:response.status,headers:h});
}
function fail(message, status = 400, code = "SNCR_REQUEST_ERROR") {
  return json({ error: { code, message } }, status);
}
async function requireAdmin(request, env) {
  const supplied = request.headers.get("X-MedUnity-Admin-Key") || "";
  const expected = env.SNCR_ADMIN_TEST_KEY || "";
  if (!expected || supplied.length !== expected.length) return false;
  let diff = 0;
  for (let i=0;i<supplied.length;i++) diff |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
async function sncrFetch(env, path, options = {}) {
  const sessionId = options.sessionId;
  const saved = sessionId ? await env.SNCR_SESSIONS.get("sncr:token:" + sessionId, "json") : null;
  if (!saved?.access_token) throw new Error("SNCR_SESSION_REQUIRED");
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", "Bearer " + saved.access_token);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  const response = await fetch(apiBase(env) + path, {
    method: options.method || "GET", headers, body: options.body ? JSON.stringify(options.body) : undefined,
    redirect: "manual", signal: AbortSignal.timeout(15000)
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: "Resposta não JSON recebida do SNCR." }; }
  if (response.status === 401) throw new Error("SNCR_SESSION_EXPIRED");
  return { status: response.status, data };
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return withCors(new Response(null, {status:204}), request, env);
    if (url.pathname === "/health" && request.method === "GET")
      return withCors(json({ service: "medunity-sncr-adapter", environment: env.SNCR_ENV || "homologacao", status: "configured-check-required" }), request, env);

    if (!await requireAdmin(request, env))
      return withCors(fail("Acesso restrito ao administrador de teste.", 403, "ADMIN_ONLY"), request, env);

    if (url.pathname === "/admin/session" && request.method === "GET")
      return withCors(json({ authenticated: true, scope: "sncr-test-admin", environment: env.SNCR_ENV || "homologacao" }), request, env);

    if (url.pathname === "/auth/login" && request.method === "POST") {
      if (!env.SNCR_CALLBACK_URL || !env.SNCR_STATE_HMAC_SECRET || !env.SNCR_SESSIONS)
        return withCors(fail("Configuração incompleta: callback, segredo HMAC e KV são obrigatórios.", 503, "SNCR_CONFIG_MISSING"), request, env);
      const nonce = randomId(24);
      const sessionKey = randomId(32);
      const state = await signedState({ nonce, sessionKey, createdAt: Date.now(), origin: request.headers.get("Origin") || "" }, env.SNCR_STATE_HMAC_SECRET);
      await env.SNCR_SESSIONS.put("sncr:state:" + sessionKey, JSON.stringify({ nonce, state, createdAt: Date.now() }), { expirationTtl: 300 });
      const login = new URL(apiBase(env) + "/api/v1/auth/login");
      login.searchParams.set("client_url", env.SNCR_CALLBACK_URL);
      login.searchParams.set("state", state);
      return withCors(json({ authorization_url: login.toString(), expires_in: 300 }), request, env);
    }

    if (url.pathname === "/auth/callback" && request.method === "POST") {
      if (!env.SNCR_STATE_HMAC_SECRET || !env.SNCR_SESSIONS)
        return withCors(fail("Configuração de callback incompleta.", 503, "SNCR_CONFIG_MISSING"), request, env);
      const body = await request.json().catch(() => ({}));
      const payload = await verifyState(String(body.state || ""), env.SNCR_STATE_HMAC_SECRET);
      const sessionId = String(body.session_id || "");
      if (!payload || !sessionId || Date.now() - payload.createdAt > 300000)
        return withCors(fail("Callback inválido ou expirado.", 400, "INVALID_CALLBACK"), request, env);
      const stateRecord = await env.SNCR_SESSIONS.get("sncr:state:" + payload.sessionKey, "json");
      if (!stateRecord || stateRecord.state !== body.state || stateRecord.nonce !== payload.nonce)
        return withCors(fail("State ausente, inválido ou já consumido.", 400, "STATE_INVALID"), request, env);
      await env.SNCR_SESSIONS.delete("sncr:state:" + payload.sessionKey);
      const tokenUrl = new URL(apiBase(env) + "/api/v1/auth/token");
      tokenUrl.searchParams.set("session_id", sessionId);
      const tokenResponse = await fetch(tokenUrl.toString(), { method: "GET", cache: "no-store", signal: AbortSignal.timeout(15000) });
      const tokenData = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok || !tokenData.access_token)
        return withCors(fail("SNCR não confirmou a autenticação. Confira callback e cadastro do prescritor.", 502, "SNCR_TOKEN_EXCHANGE_FAILED"), request, env);
      const internalSession = randomId(32);
      await env.SNCR_SESSIONS.put("sncr:token:" + internalSession, JSON.stringify({ access_token: tokenData.access_token, createdAt: Date.now() }), { expirationTtl: 1800 });
      return withCors(json({ session_id: internalSession, authenticated: true, expires_in: 1800 }), request, env);
    }

    if (url.pathname === "/numeracoes/notificacao-receita" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body || !body.session_id) return withCors(fail("Informe a sessão SNCR autenticada.", 401, "SNCR_SESSION_REQUIRED"), request, env);
      const allowed = ["NRA","NRB","NRB2","NRR","NRT"];
      if (!allowed.includes(body.receita)) return withCors(fail("Tipo de receita inválido para este endpoint.", 400, "INVALID_RECEITA"), request, env);
      if (!Number.isInteger(body.quantidade) || body.quantidade < 10 || body.quantidade > 50)
        return withCors(fail("A quantidade deve estar entre 10 e 50.", 400, "INVALID_QUANTITY"), request, env);
      const { session_id, ...payload } = body;
      try {
        const result = await sncrFetch(env, "/numeracoes/notificacao-receita", {method:"POST",body:payload,sessionId:session_id});
        return withCors(json(result.data, result.status), request, env);
      } catch(e) { return withCors(fail(e.message==="SNCR_SESSION_EXPIRED"?"Sessão SNCR expirada. Entre novamente.":"Não foi possível consultar o SNCR.", e.message==="SNCR_SESSION_EXPIRED"?401:502, e.message), request, env); }
    }

    if (url.pathname === "/numeracoes/receita-especial-retencao" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body || !body.session_id) return withCors(fail("Informe a sessão SNCR autenticada.", 401, "SNCR_SESSION_REQUIRED"), request, env);
      if (!["RCE","RET"].includes(body.tipo)) return withCors(fail("Tipo deve ser RCE ou RET.", 400, "INVALID_TIPO"));
      const { session_id, ...payload } = body;
      try {
        const result = await sncrFetch(env, "/numeracoes/receita-especial-retencao", {method:"POST",body:payload,sessionId:session_id});
        return withCors(json(result.data, result.status), request, env);
      } catch(e) { return withCors(fail(e.message==="SNCR_SESSION_EXPIRED"?"Sessão SNCR expirada. Entre novamente.":"Não foi possível consultar o SNCR.", e.message==="SNCR_SESSION_EXPIRED"?401:502, e.message), request, env); }
    }

    return withCors(fail("Rota não encontrada.", 404, "NOT_FOUND"), request, env);
  }
};
