# 📚 Dicionário de Campos e Termos — Templates SUS

Este documento atua como guia de referência e dicionário de dados para os templates oficiais do SUS armazenados na pasta `/docs/templates`.

---

## 🏷️ Glossário Geral de Siglas e Conceitos

* **AIH (Autorização de Internação Hospitalar):** Instrumento de registro e pagamento de internações no âmbito do SUS.
* **APAC (Autorização de Procedimentos Ambulatoriais):** Instrumento para autorização/registro de procedimentos ambulatoriais de alta e média complexidade (ex.: quimioterapia, hemodiálise, exames complexos).
* **CBOR / CBO:** Classificação Brasileira de Ocupações.
* **CID-10:** Classificação Estatística Internacional de Doenças e Problemas Relacionados com a Saúde (OMS).
* **CNAE:** Classificação Nacional de Atividades Econômicas (usado para identificar a atividade da empresa do paciente em acidentes de trabalho).
* **CNES:** Cadastro Nacional de Estabelecimentos de Saúde. Código único do posto, hospital ou clínica.
* **CNS:** Cartão Nacional de Saúde (número de identificação do usuário no SUS).
* **IBGE (Código de Município):** Código numérico oficial do IBGE para identificação de municípios brasileiros.
* **SIGTAP:** Tabela de Procedimentos, Medicamentos, Órteses/Próteses e Materiais Especiais do SUS.

---

## 📄 Mapeamento de Campos dos Documentos

### 1. Laudo de Procedimento Ambulatorial (APAC)
* **Campo 1 a 2:** Identificação do estabelecimento solicitante (Nome e CNES).
* **Campo 3 a 14:** Dados do paciente (Nome, Prontuário, CNS, Data de Nascimento, Sexo, Nome da Mãe, Telefone, Endereço, Município, Código IBGE, UF, CEP).
* **Campo 15 a 17:** Procedimento Principal (Código SIGTAP, Descrição e Quantidade).
* **Campo 18 a 32:** Procedimentos Secundários (Códigos SIGTAP, Descrições e Quantidades).
* **Campo 33 a 37:** Justificativa (Diagnóstico descritivo, CID-10 Principal, CID-10 Secundário, CID-10 Causas Associadas e Observações).
* **Campo 38 a 42:** Dados do Profissional Solicitante (Nome, Data, Tipo de Doc, N° Documento, Assinatura e Carimbo com Conselho).
* **Campo 43 a 50:** Autorização (Nome do Autorizador, Órgão Emissor, Documento, N° Documento, Data, Assinatura/Carimbo, N° da APAC e Validade).
* **Campo 51 a 52:** Identificação do Estabelecimento Executante (Nome Fantasia e CNES).

### 2. Laudo de Autorização de Internação Hospitalar (AIH)
* **Campo 1 a 4:** Identificação do Estabelecimento (Solicitante e Executante com seus respectivos CNES).
* **Campo 5 a 19:** Identificação do Paciente (Nome, Prontuário, CNS, Data de Nasc., Sexo, Raça/Cor, Nome da Mãe, Telefone, Responsável, Endereço completo).
* **Campo 20 a 26:** Justificativa de Internação (Sinais/Sintomas, Condições de justificativa, Resultados de exames, Diagnóstico Inicial, CIDs 10).
* **Campo 27 a 30:** Procedimento Solicitado (Descrição, Código, Clínica e Caráter de Internação: Eletiva ou Urgência).
* **Campo 31 a 35:** Dados do Profissional Solicitante/Assistente.
* **Campo 36 a 45:** Preenchimento Específico para Causas Externas / Acidentes (Trânsito, Trabalho Típico/Trajeto, Seguradora, CNPJ, Bilhete, Série, CNAE, CBOR, Vínculo Previdenciário).
* **Campo 46 a 52:** Dados de Autorização e N° da AIH.

