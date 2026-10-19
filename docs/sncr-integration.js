/* MedUnity — integração de autenticação SNCR
 * Implementa somente o fluxo oficial de redirecionamento e troca de session_id.
 * Não emite receituários nem declara identidade/permissões que a API não tenha retornado.
 */
(() => {
  "use strict";

  const API_URL = String(window.MEDUNITY_SNCR_API_URL || "https://sncr-api.apps.anvisa.gov.br").replace(/\/$/, "");
  const TOKEN_KEY = "medunity_sncr_access_token";
  const SESSION_KEY = "medunity_sncr_connected_at";

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function callbackUrl() {
    // A URL deve ser estável e corresponder ao domínio aceito/cadastrado pelo SNCR.
    return String(window.MEDUNITY_SNCR_CALLBACK_URL || (window.location.origin + window.location.pathname));
  }

  function isSupportedCallback(urlValue) {
    try {
      const url = new URL(urlValue);
      return url.protocol === "https:" && /\.br$/i.test(url.hostname);
    } catch {
      return false;
    }
  }

  function renderPanel() {
    if (document.getElementById("medunitySncrCard")) return;
    const main = document.querySelector("main");
    if (!main) return;

    const card = document.createElement("section");
    card.className = "card";
    card.id = "medunitySncrCard";
    card.innerHTML = `
      <div class="card-head">
        <div>
          <div class="kicker">Integração oficial</div>
          <h2 class="title">Prescrição eletrônica · SNCR</h2>
          <p class="desc">Autenticação do prescritor separada do login administrativo e da conta MedUnity.</p>
        </div>
        <span class="badge">SNCR / GOV.BR</span>
      </div>
      <div class="notice" id="medunitySncrNotice">
        A conexão SNCR não substitui o login do MedUnity nem, por si só, constitui assinatura digital.
      </div>
      <div class="actions">
        <button class="btn primary" id="medunitySncrLogin" type="button">Entrar como prescritor no SNCR</button>
        <button class="btn secondary" id="medunitySncrLogout" type="button" hidden>Encerrar sessão SNCR</button>
      </div>
      <div class="status" id="medunitySncrStatus" role="status" aria-live="polite">
        <span class="dot"></span>Verificando configuração…
      </div>
      <p class="desc" id="medunitySncrHelp"></p>
    `;

    // Keep the existing document engine and its UI intact; add the integration as a separate card.
    const grid = main.querySelector(".grid");
    if (grid) {
      const firstColumn = grid.querySelector(":scope > section");
      if (firstColumn) firstColumn.appendChild(card);
      else main.prepend(card);
    } else {
      main.prepend(card);
    }

    document.getElementById("medunitySncrLogin").addEventListener("click", startLogin);
    document.getElementById("medunitySncrLogout").addEventListener("click", logout);
    updateUI();
  }

  function setStatus(message, kind = "") {
    const el = document.getElementById("medunitySncrStatus");
    if (!el) return;
    el.className = "status" + (kind ? " " + kind : "");
    el.textContent = message;
  }

  function updateUI() {
    const login = document.getElementById("medunitySncrLogin");
    const logoutButton = document.getElementById("medunitySncrLogout");
    const help = document.getElementById("medunitySncrHelp");
    if (!login || !logoutButton || !help) return;

    const connected = Boolean(sessionStorage.getItem(TOKEN_KEY));
    login.hidden = connected;
    logoutButton.hidden = !connected;

    const callback = callbackUrl();
    if (connected) {
      setStatus("Token de acesso SNCR presente nesta aba. A identidade e as permissões ainda devem ser confirmadas nas operações oficiais.", "ok");
      help.textContent = "A sessão é temporária nesta aba. Nenhum token é enviado para a API administrativa do MedUnity.";
      return;
    }

    if (!isSupportedCallback(callback)) {
      login.disabled = true;
      setStatus("Configuração pendente: o callback precisa usar HTTPS e um domínio .br aceito pela documentação do SNCR.", "warn");
      help.textContent = "Callback detectado: " + callback + ". Quando o domínio .br oficial estiver definido, configure window.MEDUNITY_SNCR_CALLBACK_URL com a URL exata da página que receberá o retorno.";
      return;
    }

    login.disabled = false;
    setStatus("Pronto para iniciar a autenticação oficial do SNCR.", "");
    help.textContent = "O login ocorrerá no ambiente oficial da Anvisa/GOV.BR e retornará para esta página.";
  }

  function startLogin() {
    const callback = callbackUrl();
    if (!isSupportedCallback(callback)) {
      setStatus("Login não iniciado: configure primeiro um callback HTTPS em domínio .br aceito pelo SNCR.", "warn");
      return;
    }

    const url = API_URL + "/api/v1/auth/login?client_url=" + encodeURIComponent(callback);
    window.location.assign(url);
  }

  async function processCallback() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    // Remove the one-use session id from the address bar before making network requests.
    params.delete("session_id");
    const cleanQuery = params.toString();
    const cleanUrl = window.location.pathname + (cleanQuery ? "?" + cleanQuery : "") + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    setStatus("Concluindo autenticação SNCR…", "");
    const endpoint = API_URL + "/api/v1/auth/token?session_id=" + encodeURIComponent(sessionId);
    const response = await fetch(endpoint, { method: "GET", cache: "no-store" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.access_token) {
      setStatus("Não foi possível concluir a autenticação SNCR. Tente novamente; se persistir, verifique o retorno da API e o callback cadastrado.", "err");
      return;
    }

    sessionStorage.setItem(TOKEN_KEY, data.access_token);
    sessionStorage.setItem(SESSION_KEY, new Date().toISOString());
    updateUI();
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setStatus("Sessão SNCR encerrada nesta aba. Isso não cancela receitas já emitidas.", "");
    updateUI();
  }

  async function request(path, options = {}) {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("Autenticação SNCR necessária.");

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", "Bearer " + token);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    const response = await fetch(API_URL + path, { ...options, headers, cache: "no-store" });
    if (response.status === 401) {
      logout();
      throw new Error("Sessão SNCR expirada. Faça login novamente.");
    }
    return response;
  }

  window.MedUnitySNCR = {
    API_URL,
    login: startLogin,
    logout,
    request,
    isAuthenticated: () => Boolean(sessionStorage.getItem(TOKEN_KEY)),
    callbackUrl,
  };

  async function init() {
    renderPanel();
    try {
      await processCallback();
    } catch (error) {
      console.error("MedUnity SNCR authentication error", error);
      setStatus("Falha ao comunicar com o SNCR. Verifique conexão, callback e disponibilidade da API.", "err");
    }
    updateUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
