# MedUnity Delyone v1.6 — PDF + DOCX

Esta versão mantém o motor PDF AcroForm da v1.5.1 e adiciona suporte inicial a DOCX por placeholders canônicos no formato `{{001}}`, `{{020}}`, `{{050}}` etc.

## Arquivos principais

- `App/Data/canonical-fields.json` — catálogo canônico fundido, compatível com PDF e DOCX.
- `App/Data/templates-registry.json` — registra AIH PDF e Prescrição UPA DOCX.
- `App/Data/field-map-aih-goiania.json` — mapa PDF AcroForm existente.
- `App/Data/field-map-prescricao-upa-v1.json` — mapa DOCX por placeholders.
- `App/Templates/DOCX/002-prescricao-upa-v1.docx` — template Word com placeholders canônicos.
- `App/Js/app.js` — motor v1.6 com geração PDF ou DOCX conforme o template selecionado.

## Regra central

O sistema só deve preencher campos explicitamente mapeados. O PDF usa nomes reais de AcroForm. O DOCX usa placeholders canônicos visíveis apenas no template técnico.
