# MedUnity Delyone — v1.5

## Native AcroForm Engine + External Dictionary

A versão v1.5 reorganiza o MedUnity para manter o dicionário clínico fora do código JavaScript.

## Arquivos principais

```text
App/index.html
App/Css/style.css
App/Js/app.js
App/Data/canonical-fields.json
App/Data/templates-registry.json
App/Data/field-map-aih-goiania.json
App/Templates/PDF/001-aih-goiania.pdf
```

## Princípio técnico

O JavaScript é apenas o motor.

Os campos clínicos ficam em `canonical-fields.json`.

Os templates nativos ficam em `templates-registry.json`.

O mapeamento entre campo clínico e campo PDF fica em `field-map-aih-goiania.json`.

## Vantagem

Novos documentos podem ser adicionados editando JSON, sem reescrever o motor.

## Disclaimer

Ver `Docs/LEGAL_DISCLAIMER.md`.
