# Data Dictionary & Glossário Canônico — MedUnity Delyone

Este documento mapeia os campos oficiais dos formulários do Sistema Único de Saúde (SUS) para as chaves canônicas do Registro Mestre (Ficha-Mãe).

---

## 1. Laudo de Solicitação de AIH (Internação Hospitalar)
**Arquivo:** `TEMPLATE_SUS_Laudo_Solicitacao_AIH_Internacao_Hospitalar.pdf`

| Campo SUS | Descrição no Formulário | Chave Canônica (Ficha-Mãe) |
| :--- | :--- | :--- |
| **5** | Nome do Paciente | `patient_name` |
| **6** | Nº do Prontuário | `record_number` |
| **7** | Cartão Nacional de Saúde (CNS) | `cns` |
| **8** | Data de Nascimento | `birth` |
| **9** | Sexo | `gender` |
| **11** | Nome da Mãe | `mother_name` |
| **12/14** | Telefone de Contato | `phone` |
| **13** | Nome do Responsável | `social_name` / `mother_name` |
| **15** | Endereço | `address` |
| **16** | Município de Residência | `municipality` |
| **20** | Principais Sinais e Sintomas Clínicos | `qpp` + `hda` + `vitals` |
| **21** | Condições que Justificam a Internação | `assessment` |
| **22** | Resultados de Provas Diagnósticas | `labs` + `imaging` |
| **23** | Diagnóstico Inicial | `hypothesis` |
| **24** | CID-10 Principal | `cid10` |
| **25** | CID-10 Secundário | `differential` |
| **33** | Nome do Profissional Solicitante | `doctor_name` |
| **35** | Registro do Conselho (CRM) | `crm` |

---

## 2. Laudo de Solicitação de APAC (Procedimentos Ambulatoriais)
**Arquivo:** `TEMPLATE_SUS_Laudo_Solicitacao_APAC_Procedimentos_Ambulatoriais.pdf`

| Campo SUS | Descrição no Formulário | Chave Canônica (Ficha-Mãe) |
| :--- | :--- | :--- |
| **3** | Nome do Paciente | `patient_name` |
| **4** | Nº do Prontuário | `record_number` |
| **5** | Cartão Nacional de Saúde (CNS) | `cns` |
| **6** | Data de Nascimento | `birth` |
| **7** | Sexo | `gender` |
| **8** | Nome da Mãe ou Responsável | `mother_name` |
| **9** | Telefone de Contato | `phone` |
| **10** | Endereço | `address` |
| **11** | Município de Residência | `municipality` |
| **33** | Descrição do Diagnóstico | `hypothesis` + `assessment` |
| **34** | CID-10 Principal | `cid10` |
| **35** | CID-10 Secundário | `differential` |
| **37** | Observações | `evolution` / `plan` |
| **38** | Nome do Profissional Solicitante | `doctor_name` |
| **42** | Registro do Conselho (CRM) | `crm` |
