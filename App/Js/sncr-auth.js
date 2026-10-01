/* MedUnity — autenticação SNCR via Gov.br
 * Baseado na documentação oficial de integração API SNCR v1.0 (Anvisa, jul/2026).
 * O token fica somente em sessionStorage; não é enviado para a API do MedUnity.
 */
(() => {
  const API_URL = window.MEDUNITY_SNCR_API_URL || "https://sncr-api.apps.anvisa.gov.br";
  const TOKEN_KEY = "medunity_sncr_access_token";

  function status(message, type = "") {
    window.dispatchEvent(new CustomEvent("medunity:sncr-status", {
      detail: { message, type }
    }));
  }

  function callbackUrl() {
    return window.location.origin + window.location.pathname;
  }

  function login() {
    const url = API_URL + "/api/v1/auth/login?client_url=" + encodeURIComponent(callbackUrl());
    window.location.href = url;
  }

  async function processCallback() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return false;

    status("Concluindo autenticação Gov.br / SNCR…");

    const response = await fetch(
      API_URL + "/api/v1/auth/token?session_id=" + encodeURIComponent(sessionId)
    );

    if (!response.ok) {
      status("Não foi possível concluir a autenticação do SNCR.", "error");
      return false;
    }

    const data = await response.json();
    if (!data.access_token) {
      status("O SNCR não retornou um token de acesso.", "error");
      return false;
    }

    sessionStorage.setItem(TOKEN_KEY, data.access_token);
    window.history.replaceState({}, document.title, window.location.pathname);
    status("SNCR conectado via Gov.br.", "ok");
    return true;
  }

  async function request(path, options = {}) {
    let token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      login();
      throw new Error("SNCR não autenticado.");
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", "Bearer " + token);
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(API_URL + path, { ...options, headers });

    if (response.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      status("Sessão SNCR expirada. Faça a autenticação novamente.", "warn");
      login();
      throw new Error("Sessão SNCR expirada.");
    }

    return response;
  }

  async function emitirReceitaBranca(payload) {
    return request("/api/v1/receita-branca/", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async function init(options = {}) {
    const onStatus = options.onStatus;
    const listener = (event) => onStatus?.(event.detail.message, event.detail.type);
    window.addEventListener("medunity:sncr-status", listener);
    try {
      await processCallback();
      if (sessionStorage.getItem(TOKEN_KEY)) {
        status("SNCR conectado via Gov.br.", "ok");
      }
    } catch (error) {
      status("Falha na comunicação com o SNCR.", "error");
    }
  }

  window.MedUnitySNCR = {
    API_URL,
    TOKEN_KEY,
    login,
    init,
    request,
    emitirReceitaBranca,
    isAuthenticated: () => Boolean(sessionStorage.getItem(TOKEN_KEY))
  };
})();
