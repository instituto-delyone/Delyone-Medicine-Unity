# 📚 Dicionário de Campos e Termos — Templates SUS

Este documento mapeia os acrônimos, termos técnicos e campos padronizados utilizados nos templates de laudos do SUS (`/docs/templates`).

---

## 🏷️ Glossário Geral de Termos

| Sigla / Termo | Nome Extenso | Descrição |
| :--- | :--- | :--- |
| **APAC** | Autorização de Procedimentos Ambulatoriais | Documento que autoriza procedimentos de alta complexidade ou acompanhamento contínuo. |
| **AIH** | Autorização de Internação Hospitalar | Documento que autoriza e registra internações na rede hospitalar pública/conveniada. |
| **CNES** | Cadastro Nacional de Estabelecimentos de Saúde | Código único de identificação de cada unidade de saúde no Brasil. |
| **CNS** | Cartão Nacional de Saúde | Número de identificação do cidadão no SUS. |
| **CID-10** | Classificação Internacional de Doenças | Código padrão para diagnóstico de patologias. |

---

## 📄 Campos dos Formulários

### Laudo APAC (`sus-laudo-solicitacao-apac.pdf`)
- `cnes_solicitante` (Campo 2): Código CNES da unidade requerente.
- `cns_paciente` (Campo 5): Cartão SUS do paciente.
- `procedimento_principal` (Campo 15/16): Código e descrição na Tabela SIGTAP.

### Laudo AIH (`sus-laudo-solicitacao-aih.pdf`)
- `carater_internacao` (Campo 30): Indica se a internação é Eletiva (01) ou Urgência/Emergência (02).
- `cbor` (Campo 44): Classificação Brasileira de Ocupações da vítima/paciente (usado em causas externas).
