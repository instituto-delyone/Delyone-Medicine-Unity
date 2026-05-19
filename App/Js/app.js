const APP_VERSION = "1.6.0";
const DRAFT_KEY = "medunity_v15_drafts";

let canonicalRegistry = null;
let templatesRegistry = null;
let activeFieldMap = null;
let compactMode = false;

const $ = (id) => document.getElementById(id);
const fieldDomId = (id) => "field_" + String(id).replaceAll(".", "_");

function normalizeName(value){
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function setStatus(message, kind=""){
  const el = $("status");
  el.textContent = message;
  el.className = "status " + kind;
}

async function loadJson(path){
  const res = await fetch(path, {cache:"no-store"});
  if(!res.ok) throw new Error(`Não consegui carregar ${path}`);
  return await res.json();
}

async function waitForPDFLib(){
  if(window.PDFLib) return true;
  for(let i=0;i<40;i++){
    await new Promise(r => setTimeout(r, 150));
    if(window.PDFLib) return true;
  }
  throw new Error("pdf-lib não carregou. Verifique a conexão.");
}

function getAllFields(){
  const blocks = canonicalRegistry?.blocks || [];
  return blocks.flatMap(block => (block.fields || []).map(field => ({...field, blockId:block.id, blockTitle:block.title})));
}

function renderTemplates(){
  const select = $("templateSelect");
  const templates = templatesRegistry?.templates || [];
  select.innerHTML = templates.map(t => `<option value="${t.id}">${t.number || ""} — ${t.name}</option>`).join("");
}

function renderForm(){
  const root = $("formRoot");
  const blocks = canonicalRegistry?.blocks || [];

  root.innerHTML = blocks.map(block => {
    const fields = (block.fields || []).map(field => renderField(field)).join("");
    return `
      <section class="form-section">
        <div class="section-title">${block.id} — ${escapeHtml(block.title || "")}</div>
        ${block.description ? `<div class="section-note">${escapeHtml(block.description)}</div>` : ""}
        <div class="fields">${fields}</div>
      </section>
    `;
  }).join("");

  const todayFields = ["100.4"];
  todayFields.forEach(id => {
    const el = $(fieldDomId(id));
    if(el && !el.value) el.value = new Date().toISOString().slice(0,10);
  });
}

function renderField(field){
  const id = fieldDomId(field.id);
  const code = `<span class="field-code">${escapeHtml(field.id)}</span>`;
  const label = `${code}${escapeHtml(field.label)}`;

  if(field.type === "textarea"){
    return `<div class="field full"><label for="${id}">${label}</label><textarea id="${id}" data-canonical-id="${field.id}"></textarea></div>`;
  }

  if(field.type === "select"){
    const options = (field.options || [""]).map(opt => `<option value="${escapeAttr(opt)}">${escapeHtml(opt || "—")}</option>`).join("");
    return `<div class="field"><label for="${id}">${label}</label><select id="${id}" data-canonical-id="${field.id}">${options}</select></div>`;
  }

  if(field.type === "checkbox"){
    return `<div class="field"><label>${label}</label><div class="checkbox-row"><input id="${id}" type="checkbox" data-canonical-id="${field.id}"><span>Marcar</span></div></div>`;
  }

  const inputType = field.type === "date" ? "date" : "text";
  return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${inputType}" data-canonical-id="${field.id}" /></div>`;
}

function escapeHtml(value){
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function escapeAttr(value){ return escapeHtml(value); }

function getFormData(){
  const data = {};
  for(const field of getAllFields()){
    const el = $(fieldDomId(field.id));
    if(!el) continue;
    if(field.type === "checkbox") data[field.id] = el.checked ? "Sim" : "";
    else data[field.id] = String(el.value || "").trim();
  }
  applyOverflow(data);
  return data;
}

function applyOverflow(data){
  const overflow = activeFieldMap?.overflow;
  if(!overflow) return;
  const source = data[overflow.sourceCanonicalId] || "";
  if(!source || !overflow.chunks?.length) return;

  let remaining = source;
  for(const chunk of overflow.chunks){
    const max = chunk.maxChars || 850;
    if(!remaining) {
      if(!data[chunk.canonicalId]) data[chunk.canonicalId] = "";
      continue;
    }
    if(data[chunk.canonicalId] && chunk.canonicalId !== overflow.sourceCanonicalId) continue;
    data[chunk.canonicalId] = remaining.slice(0, max).trim();
    remaining = remaining.slice(max).trim();
  }
}

function setFormData(data){
  for(const field of getAllFields()){
    const el = $(fieldDomId(field.id));
    if(!el) continue;
    if(field.type === "checkbox") el.checked = Boolean(data[field.id]);
    else el.value = data[field.id] || "";
  }
}

async function selectedTemplate(){
  const id = $("templateSelect").value;
  return (templatesRegistry?.templates || []).find(t => t.id === id);
}

async function loadActiveFieldMap(){
  const template = await selectedTemplate();
  if(!template) throw new Error("Nenhum template selecionado.");
  activeFieldMap = await loadJson(template.fieldMapFile);
  return activeFieldMap;
}

async function loadPdfBytes(url){
  const res = await fetch(url, {cache:"no-store"});
  if(!res.ok) throw new Error("Não consegui carregar o PDF: " + url);
  return await res.arrayBuffer();
}


async function waitForJSZip(){
  if(window.JSZip) return true;
  for(let i=0;i<40;i++){
    await new Promise(r => setTimeout(r, 150));
    if(window.JSZip) return true;
  }
  throw new Error("JSZip não carregou. Verifique a conexão.");
}

async function loadBinaryBytes(url, label="arquivo"){
  const res = await fetch(url, {cache:"no-store"});
  if(!res.ok) throw new Error("Não consegui carregar " + label + ": " + url);
  return await res.arrayBuffer();
}

function xmlEscape(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getDocxPlaceholders(entry){
  return [ ...(entry.docxPlaceholders || []), entry.docxPlaceholder ].filter(Boolean);
}

async function generateDocx(){
  try{
    setStatus("Gerando DOCX...", "warn");
    await waitForJSZip();
    await loadActiveFieldMap();

    const template = await selectedTemplate();
    const docxUrl = template.docxFile || activeFieldMap.docxFile;
    if(!docxUrl) throw new Error("Template DOCX não definido no registry ou field-map.");

    const bytes = await loadBinaryBytes(docxUrl, "DOCX");
    const zip = await JSZip.loadAsync(bytes);
    const docPath = "word/document.xml";
    let xml = await zip.file(docPath).async("string");
    const data = getFormData();

    let replaced = 0;
    for(const entry of activeFieldMap.fields || []){
      const value = buildMappedValue(entry, data);
      const placeholders = getDocxPlaceholders(entry);
      for(const ph of placeholders){
        const safe = xmlEscape(value || "");
        const before = xml;
        xml = xml.split(ph).join(safe);
        if(before !== xml) replaced++;
      }
    }

    xml = xml.replace(/\{\{[0-9]+(?:\.[0-9]+)?\}\}/g, "");
    zip.file(docPath, xml);

    const out = await zip.generateAsync({type:"blob", mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
    downloadBlob(out, `${template.number || "documento"}-${slugify(template.name)}-preenchido.docx`);
    saveDraft(false);
    setStatus(`DOCX gerado. Placeholders substituídos: ${replaced}.`, "ok");
  }catch(err){
    console.error(err);
    setStatus(err.message || "Erro ao gerar DOCX.", "err");
  }
}

function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function generateDocument(){
  const template = await selectedTemplate();
  await loadActiveFieldMap();
  const mode = activeFieldMap?.mode || template?.type || "pdf";
  if(String(mode).toLowerCase() === "docx") return generateDocx();
  return generatePdf();
}

function getCandidateNames(mapEntry){
  // v1.5.1: usa apenas candidatos explícitos do mapa.
  // Não usa fallback por ID/label/role, pois tokens como "2" podem casar com "2 CNES".
  return [
    ...(mapEntry.pdfFieldCandidates || []),
    mapEntry.pdfFieldName
  ].filter(Boolean);
}

function findPdfTextField(form, candidates){
  // v1.5.2: regra estrita.
  // O app só preenche quando encontra equivalência explícita entre o field-map e o nome REAL do AcroForm.
  // A numeração escrita no corpo visual do PDF não é usada para decidir preenchimento.
  const fields = form.getFields();
  const byName = new Map(fields.map(f => [f.getName(), f]));
  const normalized = fields.map(f => ({name:f.getName(), norm:normalizeName(f.getName())}));

  for(const c of candidates){
    if(byName.has(c)){
      try { return form.getTextField(c); } catch { return null; }
    }
  }

  for(const c of candidates){
    const nc = normalizeName(c);
    if(!nc) continue;
    const exact = normalized.find(x => x.norm === nc);
    if(exact){
      try { return form.getTextField(exact.name); } catch { return null; }
    }
  }

  return null;
}

function brDate(value){
  if(!value) return "";
  const parts = String(value).split("-");
  if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return value;
}

function formatValue(canonicalId, value){
  const field = getAllFields().find(f => f.id === canonicalId);
  if(field?.type === "date") return brDate(value);
  return value || "";
}

function fitPdfFieldValue(pdfField, value){
  const text = String(value || "");
  let max = undefined;
  try { max = pdfField.getMaxLength(); } catch {}
  if(typeof max === "number" && max > 0 && text.length > max){
    if(max <= 25) return null; // campo curto: não força texto narrativo
    return text.slice(0, max);
  }
  return text;
}

function buildMappedValue(entry, data){
  // v1.5.2: o valor enviado ao PDF pode ser composto por vários campos do site.
  // Ex.: campo PDF 20 recebe 020 + 020.1 + 020.2.
  const ids = Array.isArray(entry.valueFrom) && entry.valueFrom.length
    ? entry.valueFrom
    : [entry.canonicalId];

  return ids
    .map(id => formatValue(id, data[id]))
    .filter(value => String(value || '').trim().length > 0)
    .join(entry.joinWith || "\n\n");
}

async function generatePdf(){
  try{
    setStatus("Gerando PDF...", "warn");
    await waitForPDFLib();
    await loadActiveFieldMap();

    const template = await selectedTemplate();
    const bytes = await loadPdfBytes(template.pdfFile);
    const pdfDoc = await PDFLib.PDFDocument.load(bytes, {ignoreEncryption:true});
    const form = pdfDoc.getForm();
    const data = getFormData();

    let filled = 0;
    let missing = [];

    for(const entry of activeFieldMap.fields || []){
      const value = buildMappedValue(entry, data);
      if(!value) continue;

      const candidates = getCandidateNames(entry);
      const pdfField = findPdfTextField(form, candidates);
      if(pdfField){
        const safeValue = fitPdfFieldValue(pdfField, value);
        if(safeValue !== null){
          pdfField.setText(safeValue);
          filled++;
        } else {
          missing.push(`${entry.canonicalId} (${entry.label || entry.role}) [texto maior que campo curto]`);
        }
      } else {
        missing.push(`${entry.canonicalId} (${entry.label || entry.role})`);
      }
    }

    try { form.updateFieldAppearances(); } catch {}

    const out = await pdfDoc.save();
    downloadBytes(out, `${template.number || "documento"}-${slugify(template.name)}-preenchido.pdf`, "application/pdf");

    saveDraft(false);
    const msg = missing.length
      ? `PDF gerado. Campos preenchidos: ${filled}. Não localizados: ${missing.slice(0,4).join(", ")}${missing.length>4?"...":""}`
      : `PDF gerado com sucesso. Campos preenchidos: ${filled}.`;
    setStatus(msg, missing.length ? "warn" : "ok");
  }catch(err){
    console.error(err);
    setStatus(err.message || "Erro ao gerar PDF.", "err");
  }
}

function downloadBytes(bytes, filename, mime){
  const blob = new Blob([bytes], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function slugify(value){
  return String(value || "documento")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function inspectPdf(){
  try{
    setStatus("Inspecionando PDF...", "warn");
    await waitForPDFLib();
    const template = await selectedTemplate();
    const bytes = await loadPdfBytes(template.pdfFile);
    const pdfDoc = await PDFLib.PDFDocument.load(bytes, {ignoreEncryption:true});
    const lines = [];
    lines.push(`Template: ${template.name}`);
    lines.push(`Páginas: ${pdfDoc.getPageCount()}`);
    try{
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      lines.push(`Campos AcroForm detectados: ${fields.length}`);
      lines.push("");
      fields.forEach((field, idx) => {
        lines.push(`${idx+1}. ${field.getName()} [${field.constructor?.name || "Field"}]`);
      });
    }catch(e){
      lines.push("Não foi possível ler campos AcroForm.");
    }
    $("pdfFieldList").textContent = lines.join("\\n");
    setStatus("PDF inspecionado.", "ok");
  }catch(err){
    console.error(err);
    setStatus(err.message || "Erro ao inspecionar PDF.", "err");
  }
}



async function inspectDocx(){
  try{
    setStatus("Inspecionando DOCX...", "warn");
    await waitForJSZip();
    await loadActiveFieldMap();
    const template = await selectedTemplate();
    const docxUrl = template.docxFile || activeFieldMap.docxFile;
    const bytes = await loadBinaryBytes(docxUrl, "DOCX");
    const zip = await JSZip.loadAsync(bytes);
    const xml = await zip.file("word/document.xml").async("string");
    const found = Array.from(new Set((xml.match(/\{\{[0-9]+(?:\.[0-9]+)?\}\}/g) || []))).sort();
    const lines = [];
    lines.push(`Template: ${template.name}`);
    lines.push(`Modo: DOCX`);
    lines.push(`Placeholders detectados: ${found.length}`);
    lines.push("");
    found.forEach((ph, idx) => lines.push(`${idx+1}. ${ph}`));
    $("pdfFieldList").textContent = lines.join("\n");
    setStatus("DOCX inspecionado.", "ok");
  }catch(err){
    console.error(err);
    setStatus(err.message || "Erro ao inspecionar DOCX.", "err");
  }
}

async function inspectTemplate(){
  const template = await selectedTemplate();
  await loadActiveFieldMap();
  const mode = activeFieldMap?.mode || template?.type || "pdf";
  if(String(mode).toLowerCase() === "docx") return inspectDocx();
  return inspectPdf();
}

function saveDraft(show=true){
  const template = (templatesRegistry?.templates || []).find(t => t.id === $("templateSelect").value);
  const data = getFormData();
  const patient = data["001"] || "Sem nome";
  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    patient,
    template: template?.name || "",
    createdAt: new Date().toISOString(),
    data
  };

  const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
  drafts.unshift(item);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts.slice(0,10)));
  renderDrafts();
  if(show) setStatus("Rascunho salvo localmente.", "ok");
}

function renderDrafts(){
  const box = $("draftList");
  const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
  if(!drafts.length){
    box.innerHTML = `<small>Nenhum rascunho salvo ainda.</small>`;
    return;
  }
  box.innerHTML = drafts.map(d => `
    <div class="draft-item">
      <strong>${escapeHtml(d.patient)}</strong>
      <small>${escapeHtml(d.template)} · ${new Date(d.createdAt).toLocaleString("pt-BR")}</small>
      <div class="draft-actions">
        <button class="secondary" type="button" onclick="restoreDraft('${d.id}')">Restaurar</button>
        <button class="danger" type="button" onclick="deleteDraft('${d.id}')">Apagar</button>
      </div>
    </div>
  `).join("");
}

window.restoreDraft = function(id){
  const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
  const draft = drafts.find(d => d.id === id);
  if(!draft) return;
  setFormData(draft.data || {});
  setStatus("Rascunho restaurado.", "ok");
};

window.deleteDraft = function(id){
  const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]").filter(d => d.id !== id);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  renderDrafts();
};

function clearForm(){
  if(!confirm("Limpar a ficha atual?")) return;
  for(const field of getAllFields()){
    const el = $(fieldDomId(field.id));
    if(!el) continue;
    if(field.type === "checkbox") el.checked = false;
    else el.value = "";
  }
  const date = $(fieldDomId("100.4"));
  if(date) date.value = new Date().toISOString().slice(0,10);
  setStatus("Ficha limpa.", "ok");
}

async function boot(){
  try{
    canonicalRegistry = await loadJson("./Data/canonical-fields.json");
    templatesRegistry = await loadJson("./Data/templates-registry.json");
    renderTemplates();
    renderForm();
    renderDrafts();
    await loadActiveFieldMap();
    setStatus(`Motor v${APP_VERSION} carregado. Dicionário externo ativo.`, "ok");
  }catch(err){
    console.error(err);
    setStatus(err.message || "Erro ao carregar app.", "err");
  }
}

$("generateBtn").addEventListener("click", generateDocument);
$("inspectBtn").addEventListener("click", inspectTemplate);
$("saveDraftBtn").addEventListener("click", () => saveDraft(true));
$("clearBtn").addEventListener("click", clearForm);
$("templateSelect").addEventListener("change", async () => {
  try{
    await loadActiveFieldMap();
    setStatus("Mapa do template carregado.", "ok");
  }catch(err){
    setStatus(err.message || "Erro ao carregar mapa.", "err");
  }
});
$("compactToggle").addEventListener("click", () => {
  compactMode = !compactMode;
  document.body.classList.toggle("compact", compactMode);
  $("compactToggle").textContent = compactMode ? "Modo completo" : "Modo compacto";
});

boot();
