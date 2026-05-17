const FIELD_IDS = ["001","002","003","004","005","006","007","008","008.1","008.2","009.1","009.2","009.3","009.4","009.5","010","011","012","013","014","015","016","016.1","016.2","017","018","019","020","021","022"];

const DOM_MAP = {
  "001":"f001","002":"f002","003":"f003","004":"f004","005":"f005","006":"f006","007":"f007",
  "008":"f008","008.1":"f0081","008.2":"f0082","009.1":"f0091","009.2":"f0092","009.3":"f0093","009.4":"f0094","009.5":"f0095",
  "010":"f010","011":"f011","012":"f012","013":"f013","014":"f014","015":"f015","016":"f016","016.1":"f0161","016.2":"f0162",
  "017":"f017","018":"f018","019":"f019","020":"f020","021":"f021","022":"f022"
};

const LABELS = {
  "001":"Nome do paciente","002":"Nome da mãe","003":"Data de nascimento","004":"Idade","005":"CNS/CPF","006":"Unidade de atendimento",
  "007":"Queixa principal / motivo do atendimento","008":"Atendimento clínico inicial","008.1":"Exame físico","008.2":"Conduta inicial",
  "009.1":"Exames complementares","009.2":"Imagem / link externo","009.3":"ECG","009.4":"USG","009.5":"Outros exames",
  "010":"Hipótese diagnóstica","011":"CID-10","012":"Reavaliação / conduta subsequente","013":"Medicações realizadas","014":"Plano de ação",
  "015":"Quadro clínico para transferência","016":"Justificativa da transferência","016.1":"Procedimento solicitado","016.2":"Código TUSS",
  "017":"Hospital de destino","018":"Tipo de leito","019":"Médico responsável","020":"CRM","021":"Data","022":"Hora"
};

const $ = (id) => document.getElementById(id);
const status = $("status");
const preview = $("preview");

function escapeHTML(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function formatDateBR(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}
function todayISO() { return new Date().toISOString().slice(0,10); }
function timeNow() {
  const d = new Date();
  return String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
}
function calculateAge(birthISO) {
  if (!birthISO) return "";
  const birth = new Date(birthISO + "T00:00:00");
  if (Number.isNaN(birth.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  if (age < 0 || age > 130) return "";
  return String(age);
}
function getData() {
  const data = {};
  FIELD_IDS.forEach((id) => {
    const el = $(DOM_MAP[id]);
    data[id] = el ? el.value.trim() : "";
  });
  return data;
}
function hasAnyData(data) { return Object.values(data).some(Boolean); }
function value(data, id) { return escapeHTML(data[id] || ""); }
function line(data, id, label = LABELS[id], includeEmpty = false) {
  const v = value(data, id);
  if (!v && !includeEmpty) return "";
  return `<p><strong>${escapeHTML(label)}:</strong> ${v || "____________________________"}</p>`;
}
function paragraph(data, id, label = LABELS[id], includeEmpty = false) {
  const v = value(data, id);
  if (!v && !includeEmpty) return "";
  return `<p><strong>${escapeHTML(label)}:</strong><br>${v || "____________________________"}</p>`;
}
function block(title, items) {
  const content = items.filter(Boolean).join("\\n");
  if (!content) return "";
  return `<h3>${escapeHTML(title)}</h3>\\n${content}`;
}
function meta(data) {
  const patient = value(data, "001") || "Paciente não informado";
  const unit = value(data, "006") || "Unidade não informada";
  const date = formatDateBR(data["021"]) || "Data não informada";
  const hour = value(data, "022") || "Hora não informada";
  return `<div class="doc-meta">Paciente: ${patient}<br>Unidade: ${unit}<br>Data/Hora: ${date} ${hour}</div>`;
}
function signature(data) {
  const doctor = value(data, "019") || "Médico responsável";
  const crm = value(data, "020") || "CRM";
  return `<div class="signature"><div class="signature-line"></div><div>${doctor}</div><div>${crm}</div></div>`;
}
function templateRelatorio(data, includeEmpty) {
  return `<h2>Relatório Médico</h2>${meta(data)}
  ${block("Identificação", [line(data,"001",undefined,includeEmpty), line(data,"002",undefined,includeEmpty), line(data,"003","Data de nascimento",includeEmpty).replace(value(data,"003"), formatDateBR(data["003"])), line(data,"004",undefined,includeEmpty), line(data,"005",undefined,includeEmpty)])}
  ${block("Atendimento", [paragraph(data,"007",undefined,includeEmpty), paragraph(data,"008",undefined,includeEmpty), paragraph(data,"008.1",undefined,includeEmpty), paragraph(data,"008.2",undefined,includeEmpty)])}
  ${block("Exames complementares", [paragraph(data,"009.1",undefined,includeEmpty), line(data,"009.2",undefined,includeEmpty), line(data,"009.3",undefined,includeEmpty), line(data,"009.4",undefined,includeEmpty), paragraph(data,"009.5",undefined,includeEmpty)])}
  ${block("Diagnóstico e conduta", [paragraph(data,"010",undefined,includeEmpty), line(data,"011",undefined,includeEmpty), paragraph(data,"012",undefined,includeEmpty), paragraph(data,"013",undefined,includeEmpty), paragraph(data,"014",undefined,includeEmpty)])}
  ${signature(data)}`;
}
function templateAtestado(data, includeEmpty) {
  const patient = value(data,"001") || (includeEmpty ? "____________________________" : "paciente não informado");
  const date = formatDateBR(data["021"]) || (includeEmpty ? "____/____/______" : "data não informada");
  const hour = value(data,"022") || (includeEmpty ? "____:____" : "hora não informada");
  const unit = value(data,"006") || (includeEmpty ? "____________________________" : "unidade não informada");
  return `<h2>Declaração de Atendimento</h2><p>Declaro, para os devidos fins, que ${patient} foi atendido(a) em ${unit}, na data de ${date}, às ${hour}.</p>${paragraph(data,"007","Motivo do atendimento",includeEmpty)}${paragraph(data,"010","Hipótese diagnóstica / observação clínica",includeEmpty)}${paragraph(data,"014","Orientações / plano de ação",includeEmpty)}${signature(data)}`;
}
function templateEncaminhamento(data, includeEmpty) {
  return `<h2>Encaminhamento Médico</h2>${meta(data)}<p>Encaminho o(a) paciente abaixo identificado(a) para avaliação e/ou seguimento conforme quadro clínico descrito.</p>
  ${block("Identificação", [line(data,"001",undefined,includeEmpty), line(data,"003","Data de nascimento",includeEmpty).replace(value(data,"003"), formatDateBR(data["003"])), line(data,"004",undefined,includeEmpty), line(data,"005",undefined,includeEmpty)])}
  ${block("Resumo clínico", [paragraph(data,"007",undefined,includeEmpty), paragraph(data,"008",undefined,includeEmpty), paragraph(data,"008.1",undefined,includeEmpty), paragraph(data,"009.1",undefined,includeEmpty), paragraph(data,"010",undefined,includeEmpty), paragraph(data,"014",undefined,includeEmpty)])}
  ${signature(data)}`;
}
function templateTransferencia(data, includeEmpty) {
  return `<h2>Solicitação de Transferência</h2>${meta(data)}
  ${block("Dados da transferência", [paragraph(data,"015",undefined,includeEmpty), paragraph(data,"016",undefined,includeEmpty), line(data,"016.1",undefined,includeEmpty), line(data,"016.2",undefined,includeEmpty), line(data,"017",undefined,includeEmpty), line(data,"018",undefined,includeEmpty)])}
  ${block("Dados clínicos de suporte", [paragraph(data,"007",undefined,includeEmpty), paragraph(data,"008.1",undefined,includeEmpty), paragraph(data,"009.1",undefined,includeEmpty), paragraph(data,"010",undefined,includeEmpty), paragraph(data,"013",undefined,includeEmpty), paragraph(data,"014",undefined,includeEmpty)])}
  ${signature(data)}`;
}
function renderDocument() {
  const data = getData();
  const includeEmpty = $("includeEmpty").checked;
  const type = $("templateSelect").value;
  if (!hasAnyData(data) && !includeEmpty) {
    preview.innerHTML = "";
    setStatus("Preencha pelo menos um campo ou marque “Mostrar lacunas”.", "warn");
    return;
  }
  const templates = { relatorio: templateRelatorio, atestado: templateAtestado, encaminhamento: templateEncaminhamento, transferencia: templateTransferencia };
  preview.innerHTML = templates[type](data, includeEmpty).trim();
  setStatus("Preview gerado. Revise antes de usar.", "ok");
}
function setStatus(message, kind = "") {
  status.textContent = message;
  status.className = "status " + kind;
}
async function copyPreview() {
  const text = preview.innerText.trim();
  if (!text) {
    setStatus("Nenhum documento gerado para copiar.", "warn");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Documento copiado para a área de transferência.", "ok");
  } catch (error) {
    setStatus("Não consegui copiar automaticamente. Selecione o texto manualmente.", "warn");
  }
}
function downloadHTML() {
  const html = preview.innerHTML.trim();
  if (!html) {
    setStatus("Nenhum documento gerado para baixar.", "warn");
    return;
  }
  const doc = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Delyone Med Unity Document</title><style>body{font-family:Arial,sans-serif;max-width:820px;margin:40px auto;line-height:1.55;color:#111}.doc-meta{color:#555;border-bottom:1px solid #ddd;padding-bottom:10px;margin-bottom:18px}.signature{text-align:center;margin-top:42px}.signature-line{width:420px;max-width:90%;border-top:1px solid #111;margin:48px auto 8px}h2{text-align:center;text-transform:uppercase}</style></head><body>${html}</body></html>`;
  const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "delyone-med-unity-document.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus("Arquivo HTML gerado para download.", "ok");
}
function clearForm() {
  const ok = confirm("Limpar todos os campos da ficha? Esta ação não pode ser desfeita.");
  if (!ok) return;
  Object.values(DOM_MAP).forEach((domId) => {
    const el = $(domId);
    if (el) el.value = "";
  });
  initAutoDateTime();
  preview.innerHTML = "";
  setStatus("Ficha limpa. Dados removidos da sessão.", "ok");
}
function initAutoDateTime() {
  if (!$("f021").value) $("f021").value = todayISO();
  if (!$("f022").value) $("f022").value = timeNow();
}
$("f003").addEventListener("change", () => { $("f004").value = calculateAge($("f003").value); });
$("generateBtn").addEventListener("click", renderDocument);
$("copyBtn").addEventListener("click", copyPreview);
$("downloadBtn").addEventListener("click", downloadHTML);
$("printBtn").addEventListener("click", () => window.print());
$("clearBtn").addEventListener("click", clearForm);
initAutoDateTime();
