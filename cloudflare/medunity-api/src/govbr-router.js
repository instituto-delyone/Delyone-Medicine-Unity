import legacyWorker from "./index.js";
import { handleGovbr } from "./govbr.js";

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

  return Response.json(
    { status: "error", detail },
    { status: known.has(error?.message) ? 503 : 400 },
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/auth/govbr")) {
      try {
        const response = await handleGovbr(request, env);
        if (response) return response;
      } catch (error) {
        console.error("GOV.BR integration error", error);
        return errorResponse(error);
      }
    }

    return legacyWorker.fetch(request, env, ctx);
  },
};
