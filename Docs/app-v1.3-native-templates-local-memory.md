# Delyone Med Unity v1.3 - Native Templates + Local Memory

## Atualização

Esta versão adiciona documentos PDF nativos dentro do próprio app e histórico local dos últimos 10 formulários.

## Onde os PDFs precisam ficar

Como o Netlify está publicando o diretório `App`, os PDFs usados pelo app precisam ficar dentro de:

`App/Templates/PDF/`

## Templates nativos incluídos

- 001 - AIH Goiânia
- 002 - APAC Goiânia
- 003 - Receituário SUS

## Observação técnica

Para preenchimento automático ideal, os campos internos do PDF devem ser nomeados como `DMU_001`, `DMU_002`, `DMU_008_1` etc. A versão também tenta nomes descritivos existentes no PDF.

## Memória local

O histórico usa `localStorage`, salvando apenas no navegador/aparelho. Não é banco institucional e não deve receber dados reais sensíveis nesta fase.
