import legacyWorker from "./index.js";
import { handleGovbr } from "./govbr.js";

const FRONTEND_ORIGIN = "https://medunity.delyone.com";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(corsHeaders())) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function errorResponse(error) {
  const known = new Set([
    "govbr_credentials_not_configured",
    "database_not_configured",
    "govbr_redirect_must_use_https",
    "govbr_return_url_not_allowed",
  ]);

  const detail = known.has(error?.message)
    ? error.message
    : "Falha na integração GOV.BR.";

  return withCors(
    Response.json(
      { status: "error", detail },
      { status: known.has(error?.message) ? 503 : 400 },
    ),
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/auth/govbr")) {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      try {
        const response = await handleGovbr(request, env);
        if (response) return withCors(response);
      } catch (error) {
        console.error("GOV.BR integration error", error);
        return errorResponse(error);
      }
    }

    return legacyWorker.fetch(request, env, ctx);
  },
};
