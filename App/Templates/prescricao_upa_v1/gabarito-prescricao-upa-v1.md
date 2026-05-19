# Gabarito Interno — Prescrição Médica UPA v1

Este arquivo é apenas para desenvolvimento interno do MedUnity.  
O documento final entregue ao usuário ou publicado no site deve permanecer limpo, sem IDs visíveis.

## Identificação

- `[001]` Nome do paciente
- `[002]` Data de nascimento
- `[003]` Idade

## Atendimento

- `[012]` Data da prescrição / atendimento
- `[013]` Leito
- `[014]` Período
- `[015]` Unidade assistencial

## Semiologia

- `[020]` Anamnese / admissão
- `[020.3]` Antecedentes patológicos
- `[020.4]` Medicamentos de uso contínuo
- `[020.5]` Alergias
- `[020.7]` Hábitos

## Diagnóstico

- `[040]` Diagnóstico principal
- `[040.1]` CID-10
- `[040.2]` Diagnósticos secundários

## Evolução e exame

- `[060]` Evolução clínica
- `[030]` Exame físico
- `[050.4]` Exames complementares

## Conduta

- `[050]` Conduta

## Prescrição

- `[070]` Itens de prescrição
- `[070.1]` Dieta
- `[070.2]` Hidratação
- `[070.3]` Antibiótico
- `[070.4]` Analgesia
- `[070.5]` Antiemético
- `[070.6]` Controle glicêmico
- `[070.7]` Oxigenoterapia
- `[070.8]` Monitorização / SSVV
- `[070.9]` Comunicação de intercorrências

## Profissional

- `[090]` Médico responsável
- `[090.1]` CRM

## Regra de segurança

O motor só deve preencher campos com mapeamento explícito no JSON.
Não inferir preenchimento por posição visual ou numeração impressa no corpo do documento.
