# MedUnity Template — Prescrição Médica UPA v1

Este pacote contém o template semântico inicial para a **Prescrição Médica / Evolução UPA** no padrão MedUnity.

A lógica do template é separar:

- o documento visual final;
- o significado clínico dos campos;
- o mapeamento interno dos campos para IDs canônicos persistentes.

O documento final não precisa exibir os IDs.  
Os IDs servem apenas para o motor MedUnity saber onde inserir cada informação.

## Arquivos

- `template-manifest.json` — metadados do template.
- `field-map-prescricao-upa-v1.json` — mapeamento dos campos do documento para IDs canônicos.
- `gabarito-prescricao-upa-v1.md` — versão humana do gabarito.
- `canonical-fields-minimal-prescricao.json` — campos canônicos mínimos usados por este template.

## Conceito

O dado clínico existe antes do documento.

O documento é apenas uma renderização institucional de uma camada semântica persistente.
