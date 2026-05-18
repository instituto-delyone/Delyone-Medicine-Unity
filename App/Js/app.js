const $ = (id) => document.getElementById(id);
let FIELD_MAP = null;

function setStatus(message, kind = "") {
  const el = $("status");
  el.textContent = message;
  el.className = "status " + kind;
}

async function waitForPDFLib() {
  if (window.PDFLib) return;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 150));
    if (window.PDFLib) return;
  }
  throw new Error("pdf-lib não carregou. Verifique a conexão e tente novamente.");
}

async function loadJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Não consegui carregar: " + url);
  return await res.json();
}

async function loadPDFBytes(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Não consegui carregar o PDF nativo: " + url);
  return await res.arrayBuffer();
}

function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function init() {
  try {
    FIELD_MAP = await loadJSON("./Data/field-map.json");
    $("mapView").textContent = JSON.stringify(FIELD_MAP, null, 2);
    setStatus("Mapa carregado. Pronto para testar ponta a ponta.", "ok");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Erro ao carregar mapa.");
  }
}

async function inspectNativePDF() {
  try {
    await waitForPDFLib();
    if (!FIELD_MAP) FIELD_MAP = await loadJSON("./Data/field-map.json");
    const bytes = await loadPDFBytes(FIELD_MAP.pdfFile);
    const pdfDoc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const lines = [];
    lines.push(`Páginas: ${pdfDoc.getPageCount()}`);
    lines.push(`Campos AcroForm detectados: ${fields.length}`);
    lines.push("");
    fields.forEach((field, index) => {
      const name = field.getName();
      const type = field.constructor?.name || "Field";
      lines.push(`${index + 1}. ${name} [${type}]`);
    });
    $("fieldList").textContent = lines.join("\n");
    setStatus("PDF inspecionado. Campos detectados com sucesso.", "ok");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Erro ao inspecionar PDF.");
  }
}

async function generatePDF() {
  try {
    await waitForPDFLib();
    if (!FIELD_MAP) FIELD_MAP = await loadJSON("./Data/field-map.json");
    const bytes = await loadPDFBytes(FIELD_MAP.pdfFile);
    const pdfDoc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const helvetica = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

    const errors = [];
    Object.entries(FIELD_MAP.fields).forEach(([semanticId, cfg]) => {
      const value = ($(cfg.inputId)?.value || "").trim();
      try {
        const field = form.getTextField(cfg.pdfFieldName);
        field.setText(value);
      } catch (e) {
        errors.push(`${semanticId} → ${cfg.pdfFieldName}`);
      }
    });

    try { form.updateFieldAppearances(helvetica); } catch (e) { console.warn("updateFieldAppearances falhou, continuando", e); }

    const out = await pdfDoc.save();
    downloadBytes(out, "001-aih-goiania-preenchida-teste.pdf");

    if (errors.length) {
      setStatus("PDF gerado, mas alguns campos do mapa não foram encontrados: " + errors.join("; "));
    } else {
      setStatus("PDF gerado com sucesso. Fórmula validada ponta a ponta.", "ok");
    }
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Erro ao gerar PDF.");
  }
}

$("inspectBtn").addEventListener("click", inspectNativePDF);
$("generateBtn").addEventListener("click", generatePDF);
init();
