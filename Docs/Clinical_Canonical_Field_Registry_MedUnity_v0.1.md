# Clinical Canonical Field Registry
## MedUnity Delyone — v0.1

## BLOCO 000 — Identificação do paciente

| ID | Campo Canônico | Aliases |
|---|---|---|
| 001 | Nome do paciente | patient name / nome |
| 002 | Data de nascimento | DOB |
| 003 | Sexo biológico | sex |
| 004 | CPF | taxpayer id |
| 005 | CNS | national health id |
| 006 | Nome da mãe | mother name |

---

## BLOCO 010 — Dados administrativos

| ID | Campo |
|---|---|
| 010 | Número do prontuário |
| 011 | Hospital |
| 012 | Data de admissão |
| 013 | Setor |
| 014 | Convênio |
| 015 | Município |

---

## BLOCO 020 — Semiologia / Anamnese

| ID | Campo |
|---|---|
| 020 | Anamnese |
| 020.1 | Queixa principal |
| 020.2 | História da doença atual |
| 020.3 | Antecedentes patológicos |
| 020.4 | Medicamentos em uso |
| 020.5 | Alergias |
| 020.6 | História familiar |
| 020.7 | História social |

---

## BLOCO 030 — Exame físico

| ID | Campo |
|---|---|
| 030 | Exame físico |
| 030.1 | Estado geral |
| 030.2 | PA |
| 030.3 | FC |
| 030.4 | FR |
| 030.5 | Saturação |
| 030.6 | Temperatura |
| 030.7 | Glasgow |

---

## BLOCO 040 — Diagnóstico

| ID | Campo |
|---|---|
| 040 | Diagnóstico principal |
| 040.1 | CID-10 |
| 040.2 | Diagnósticos secundários |
| 040.3 | Hipóteses diagnósticas |

---

## BLOCO 050 — Conduta

| ID | Campo |
|---|---|
| 050 | Conduta |
| 050.1 | Prescrição |
| 050.2 | Procedimentos |
| 050.3 | Encaminhamentos |
| 050.4 | Solicitação de exames |

---

## BLOCO 060 — Evolução longitudinal

| ID | Campo |
|---|---|
| 060 | Evolução clínica |
| 060.1 | Intercorrências |
| 060.2 | Resposta terapêutica |
| 060.3 | Alta |
| 060.4 | Óbito |

---

## Conceito estrutural

O MedUnity utiliza campos clínicos canônicos para permitir interoperabilidade documental entre formulários institucionais heterogêneos, incluindo AIH, APAC, receituários, relatórios, evoluções e documentos administrativos.

Cada campo recebe um identificador semântico persistente, permitindo:

- reutilização contextual de dados;
- redução de redundância documental;
- mapeamento determinístico;
- expansão modular;
- integração futura com sistemas externos;
- preenchimento automatizado de templates PDF;
- rastreabilidade e auditabilidade.

A arquitetura opera sem dependência obrigatória de inteligência artificial em produção, utilizando templates institucionais, AcroForms e mapeamento semântico determinístico.
