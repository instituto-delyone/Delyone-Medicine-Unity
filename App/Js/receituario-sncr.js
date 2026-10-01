/* MedUnity — SNCR / Receituário Controlado
 * Camada de UI + adapter. Não contém credenciais nem tokens.
 * A comunicação autenticada com o SNCR deve ocorrer no backend.
 */
(() => {
  const GOVBR_URL = "https://www.gov.br/governodigital/pt-br/contas/conta-gov-br";

  const TYPES = [
    { code: "NRA", label: "Notificação de Receita A (amarela)", mode: "visa" },
    { code: "NRB", label: "Notificação de Receita B (azul)", mode: "visa" },
    { code: "NRB2", label: "Notificação de Receita B2", mode: "visa" },
    { code: "NRR", label: "Notificação de Receita Especial — retinoides", mode: "visa" },
    { code: "NRT", label: "Notificação de Receita — talidomida", mode: "visa" },
    { code: "RCE", label: "Receita de Controle Especial", mode: "sncr" },
    { code: "RET", label: "Receita Sujeita à Retenção", mode: "sncr" },
  ];

  const el = (id) => document.getElementById(id);

  function setStatus(message, ok = false) {
    const target = el("sncrStatus");
    if (!target) return;
    target.className = "status" + (ok ? " ok" : "");
    target.innerHTML = '<span class="dot"></span>' + message;
  }

  function renderTypes() {
    const target = el("sncrType");
    if (!target) return;
    target.innerHTML = '<option value="">Selecione o tipo</option>' +
      TYPES.map((item) => '<option value="' + item.code + '">' + item.label + '</option>').join("");
  }

  function openGovBr() {
    window.open(GOVBR_URL, "_blank", "noopener,noreferrer");
    setStatus("Gov.br aberto em nova aba. O login/autorização permanece fora do MedUnity.");
  }

  function prepareRequest() {
    const type = el("sncrType")?.value;
    const quantity = Number(el("sncrQuantity")?.value || 0);

    if (!type) {
      setStatus("Selecione o tipo de receituário.");
      return;
    }

    const item = TYPES.find((entry) => entry.code === type);
    if (!item) return;

    if (item.mode === "visa" && (quantity < 10 || quantity > 50)) {
      setStatus("Para notificações, a solicitação técnica deve respeitar a faixa definida pela API do SNCR.");
      return;
    }

    if (item.mode === "sncr") {
      setStatus("RCE/RET: o MedUnity deixará a numeração ser obtida pelo serviço integrado ao SNCR, sem inventar uma numeração local.");
      return;
    }

    setStatus("Notificação " + type + ": a numeração precisa estar previamente disponibilizada pela Vigilância Sanitária para o prescritor; depois o serviço integrado consulta/consome a numeração no SNCR.");
  }

  function init() {
    renderTypes();
    el("sncrGovBtn")?.addEventListener("click", openGovBr);
    el("sncrPrepareBtn")?.addEventListener("click", prepareRequest);
    setStatus("Módulo SNCR preparado. Nenhuma credencial é armazenada no navegador.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
