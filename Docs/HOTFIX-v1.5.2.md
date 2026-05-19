# MedUnity v1.5.2 Hotfix

## Correções

- O app passa a preencher somente campos com equivalência explícita no `field-map-aih-goiania.json`.
- A numeração escrita no corpo visual do PDF não é usada como fonte de mapeamento.
- O campo PDF `20 PRINCIPAIS SINAIS E SINTOMAS CLÍNICOS` recebe a soma de `020 + 020.1 + 020.2`.
- O campo PDF `21 CONDIÇÕES QUE JUSTIFICAM A INTERNAÇÃO` recebe `030`.
- Inclui o PDF AIH atualizado em `App/Templates/PDF/001-aih-goiania.pdf`.

## Aplicação

Substituir/adicionar:

```text
App/Js/app.js
App/Data/field-map-aih-goiania.json
App/Templates/PDF/001-aih-goiania.pdf
Docs/HOTFIX-v1.5.2.md
```

Depois fazer deploy sem cache.
