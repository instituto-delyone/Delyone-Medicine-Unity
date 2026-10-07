# 00 — MASTER CHECKLIST | VALIDADOR GOV.BR

**Instituto Delyone de Medicina e Tecnologia LTDA**  
CNPJ: 66.686.266/0001-48  
Projeto relacionado: MedUnity / IDMT  
Status geral: **EM ESTRUTURAÇÃO — NÃO CONSTITUI DECLARAÇÃO DE CREDENCIAMENTO OU DE CONFORMIDADE DEFINITIVA**

---

## 1. Objetivo

Este documento é o mapa mestre para fechar os requisitos relacionados ao item **“Segurança da informação e privacidade de dados no processo de validação”** e, antes disso, verificar se o escopo pretendido pelo Instituto Delyone é compatível com o regime de **Validador de Acesso Digital**.

A regra deste checklist é separar rigorosamente:

- **IMPLEMENTADO** — existe e há evidência verificável;
- **EM IMPLANTAÇÃO** — existe trabalho ou implementação em andamento;
- **A VALIDAR** — a exigência pode ser aplicável, mas ainda depende de confirmação técnica, jurídica, operacional ou documental;
- **PENDENTE** — falta executar ou obter algo necessário;
- **NÃO APLICÁVEL** — conclusão documentada de que o requisito não incide sobre o escopo definido.

> Nenhum item deve ser marcado como IMPLEMENTADO apenas porque existe uma intenção, arquitetura proposta, código experimental ou documento-modelo.

---

# 2. GATE 0 — DEFINIR EXATAMENTE O ESCOPO

Antes de fechar DPC, PC e políticas, precisamos confirmar o que o IDMT pretende solicitar ao Governo Federal.

### 2.1 Papel pretendido

- [ ] **A VALIDAR** — IDMT será apenas tecnologia participante de um fluxo de identidade;
- [ ] **A VALIDAR** — IDMT pretende atuar formalmente como **Validador de Acesso Digital**;
- [ ] **A VALIDAR** — IDMT também pretende atuar em serviços relacionados a assinatura eletrônica avançada;
- [ ] **A VALIDAR** — existe outro papel regulatório específico a ser solicitado.

**Bloqueador:** não assumir que a existência de DPC/PC significa automaticamente que o Instituto será provedor de certificados ou assinaturas.

### 2.2 Modalidade de validação pretendida

A Portaria SGD/MGI nº 11.230/2025 prevê, para entidade privada, alternativas relacionadas à validação:

- [ ] validação biográfica/documental presencial;
- [ ] validação biométrica presencial;
- [ ] validação biométrica remota, quando atendidas as condições regulamentares;
- [ ] definir qual modalidade será efetivamente utilizada.

**Bloqueador:** a modalidade escolhida muda arquitetura, procedimentos, equipamentos, evidências e controles.

---

# 3. GATE 1 — ELEGIBILIDADE OPERACIONAL DA ENTIDADE PRIVADA

Fonte principal: **Portaria SGD/MGI nº 11.230, de 12 de dezembro de 2025**, especialmente Art. 8.

## 3.1 Atividade efetivamente voltada ao público

- [ ] Comprovar que o Instituto exerce atividades voltadas ao público;
- [ ] Documentar instalações;
- [ ] Documentar equipamentos;
- [ ] Documentar pessoal qualificado;
- [ ] Reunir evidências objetivas da operação.

**Status IDMT:** A VALIDAR  
**Evidência:** a definir  
**Ação:** montar pacote documental operacional.

## 3.2 Sede administrativa no Brasil

- [ ] Confirmar endereço/sede administrativa;
- [ ] Reunir CNPJ e documentação societária;
- [ ] Reunir comprovante compatível;
- [ ] Manter evidência de que a sede administrativa está no Brasil.

**Status IDMT:** A VALIDAR  
**Evidência disponível:** CNPJ e contrato social do Instituto  
**Ação:** organizar no Evidence Pack.

## 3.3 Cobertura geográfica

A regulamentação atual estabelece requisito de prestação de serviço em **pelo menos um Estado de cada região geográfica do Brasil**.

- [ ] Norte;
- [ ] Nordeste;
- [ ] Centro-Oeste;
- [ ] Sudeste;
- [ ] Sul.

**Status IDMT:** **BLOQUEADOR / A VALIDAR**

Não presumir cobertura nacional apenas porque o sistema é tecnicamente acessível pela internet.

**Ação:** demonstrar como o serviço será efetivamente prestado em cada região.

## 3.4 Critério de população economicamente ativa

A regulamentação atual também estabelece requisito de atendimento de **pelo menos 1% da população economicamente ativa das localidades onde o serviço é prestado**.

- [ ] Identificar localidades efetivamente atendidas;
- [ ] Identificar a população economicamente ativa correspondente;
- [ ] Definir metodologia de cálculo;
- [ ] Demonstrar capacidade/alcance;
- [ ] Guardar evidências.

**Status IDMT:** **BLOQUEADOR / A VALIDAR**

> Este é um dos primeiros pontos a verificar antes de investir em uma implementação regulatória completa.

---

# 4. GATE 2 — PROCEDIMENTO DE VALIDAÇÃO

## 4.1 Se for validação biográfica/documental

A Portaria SGD/MGI nº 11.230/2025 exige procedimentos documentados para:

- [ ] garantir autenticidade do documento de identificação;
- [ ] verificar informações junto ao emissor, quando aplicável;
- [ ] verificar que a identidade pertence ao requerente;
- [ ] documentar o fluxo operacional;
- [ ] definir responsáveis;
- [ ] definir registros/evidências;
- [ ] definir tratamento de exceções e fraude.

**Status:** A VALIDAR

## 4.2 Se for validação biométrica

Documentar:

- [ ] procedimentos utilizados;
- [ ] principais funções;
- [ ] interfaces;
- [ ] biometria(s) coletada(s);
- [ ] equipamentos utilizados;
- [ ] especificações técnicas;
- [ ] sistemas próprios ou de terceiros;
- [ ] integração com fornecedores;
- [ ] controles de segurança;
- [ ] evidências de testes.

**Status:** A VALIDAR

---

# 5. GATE 3 — DPC

Arquivo principal: `01_DPC_IDMT.md`

## 5.1 Estrutura

- [ ] Identificação da entidade;
- [ ] escopo do serviço;
- [ ] papéis e responsabilidades;
- [ ] modalidade de validação;
- [ ] fluxo operacional;
- [ ] controles de identidade;
- [ ] segurança;
- [ ] auditoria;
- [ ] incidentes;
- [ ] continuidade;
- [ ] terceiros;
- [ ] evidências;
- [ ] revisão e versionamento.

**Status atual:** EM IMPLANTAÇÃO

## 5.2 Evidências

- [ ] Cada afirmação operacional da DPC possui evidência;
- [ ] Nenhum controle é declarado como implantado sem comprovação;
- [ ] Dependências externas estão identificadas;
- [ ] Versão da DPC está controlada.

---

# 6. GATE 4 — PC

Arquivo principal: `02_PC_IDMT.md`

A PC deverá ser mantida coerente com o escopo real do serviço.

- [ ] Definir se haverá emissão/uso de certificados;
- [ ] Definir tipos de assinatura envolvidos;
- [ ] Definir algoritmos e padrões aplicáveis;
- [ ] Definir ciclo de vida;
- [ ] Definir autenticação;
- [ ] Definir revogação/suspensão, quando aplicável;
- [ ] Definir responsabilidades;
- [ ] Publicar versão aplicável;
- [ ] Validar integração com gov.br, se aplicável.

**Status atual:** EM IMPLANTAÇÃO / A VALIDAR

> Não criar uma aparência de infraestrutura de autoridade certificadora se o escopo real do IDMT não exigir isso.

---

# 7. GATE 5 — POLÍTICA DE SEGURANÇA DA INFORMAÇÃO

Arquivo principal: `03_POLITICA_SEGURANCA_INFORMACAO.md`

## Controles mínimos a fechar

- [ ] Governança de segurança;
- [ ] Responsável por segurança;
- [ ] Controle de acesso;
- [ ] Privilégio mínimo;
- [ ] MFA;
- [ ] Gestão de credenciais;
- [ ] Gestão de segredos;
- [ ] Criptografia;
- [ ] Logs;
- [ ] Monitoramento;
- [ ] Vulnerabilidades;
- [ ] Atualizações;
- [ ] Incidentes;
- [ ] Continuidade;
- [ ] Backup;
- [ ] Recuperação de desastre;
- [ ] Gestão de terceiros;
- [ ] Gestão de mudanças;
- [ ] Treinamento/conscientização;
- [ ] Revisão periódica.

**Status atual:** EM IMPLANTAÇÃO

---

# 8. GATE 6 — PRIVACIDADE / LGPD

Arquivo principal: `04_POLITICA_PRIVACIDADE.md`

## 8.1 Papéis

- [ ] Mapear cada fluxo;
- [ ] Determinar controlador;
- [ ] Determinar operador;
- [ ] Identificar eventuais suboperadores;
- [ ] Formalizar responsabilidades contratuais.

**Status:** A VALIDAR POR FLUXO

## 8.2 Inventário de dados

- [ ] Dados cadastrais;
- [ ] Dados de identificação;
- [ ] Dados biométricos, se utilizados;
- [ ] Metadados;
- [ ] Logs;
- [ ] Dados técnicos;
- [ ] Dados de auditoria;
- [ ] Dados enviados/recebidos de terceiros.

## 8.3 Finalidade e base legal

Para cada tratamento:

- [ ] finalidade definida;
- [ ] base legal definida;
- [ ] necessidade demonstrada;
- [ ] minimização avaliada;
- [ ] compartilhamentos documentados.

## 8.4 Retenção e eliminação

- [ ] prazo de retenção;
- [ ] fundamento do prazo;
- [ ] descarte seguro;
- [ ] anonimização, quando aplicável;
- [ ] preservação para auditoria quando juridicamente necessária.

## 8.5 Direitos dos titulares

- [ ] canal de atendimento;
- [ ] identificação do solicitante;
- [ ] procedimento interno;
- [ ] prazos;
- [ ] registro da solicitação;
- [ ] resposta;
- [ ] evidência.

---

# 9. GATE 7 — MATRIZ DE CONTROLES DE SEGURANÇA

Arquivo principal: `05_MATRIZ_CONTROLES_SEGURANCA.md`

Cada controle deve possuir:

1. requisito;
2. controle;
3. responsável;
4. sistema/processo;
5. evidência;
6. status;
7. data da última validação;
8. ação corretiva, se houver.

### Controles prioritários

- [ ] IAM;
- [ ] autenticação forte;
- [ ] MFA;
- [ ] gestão de sessão;
- [ ] criptografia em trânsito;
- [ ] criptografia em repouso;
- [ ] gestão de chaves;
- [ ] gestão de segredos;
- [ ] logs;
- [ ] trilha de auditoria;
- [ ] detecção de incidentes;
- [ ] resposta a incidentes;
- [ ] backup;
- [ ] recuperação;
- [ ] testes;
- [ ] gestão de vulnerabilidades;
- [ ] segurança de terceiros;
- [ ] segurança de endpoints;
- [ ] controle de mudanças;
- [ ] testes de integração;
- [ ] testes do processo de validação de identidade.

---

# 10. GATE 8 — MATRIZ LGPD

Arquivo principal: `06_MATRIZ_LGPD.md`

- [ ] Inventário de tratamentos;
- [ ] finalidades;
- [ ] bases legais;
- [ ] papéis;
- [ ] dados pessoais;
- [ ] dados pessoais sensíveis;
- [ ] biometria, se aplicável;
- [ ] minimização;
- [ ] retenção;
- [ ] eliminação;
- [ ] direitos;
- [ ] compartilhamento;
- [ ] suboperadores;
- [ ] segurança;
- [ ] incidentes;
- [ ] evidências;
- [ ] transparência.

---

# 11. GATE 9 — EVIDENCE PACK

Diretório: `07_EVIDENCIAS/`

## 11.1 Jurídico

- [ ] CNPJ;
- [ ] contrato social;
- [ ] documentos de representação;
- [ ] comprovante de sede;
- [ ] demais documentos societários pertinentes.

## 11.2 Operacional

- [ ] organograma;
- [ ] responsáveis;
- [ ] qualificações;
- [ ] instalações;
- [ ] equipamentos;
- [ ] fornecedores;
- [ ] cobertura geográfica;
- [ ] capacidade de atendimento.

## 11.3 Técnico

- [ ] arquitetura;
- [ ] diagramas;
- [ ] controles de acesso;
- [ ] autenticação;
- [ ] logs;
- [ ] criptografia;
- [ ] backup;
- [ ] continuidade;
- [ ] testes;
- [ ] segurança de infraestrutura.

## 11.4 Governança

- [ ] DPC;
- [ ] PC;
- [ ] PSI;
- [ ] Política de Privacidade;
- [ ] matrizes;
- [ ] registros de revisão;
- [ ] atas/aprovações;
- [ ] treinamento.

## 11.5 Regra de segurança

**NUNCA colocar neste diretório:**

- senhas;
- tokens;
- chaves privadas;
- API keys;
- JWTs;
- credenciais;
- dados clínicos reais;
- dados pessoais reais desnecessários.

---

# 12. GATE 10 — APLICAÇÃO E PÓS-APLICAÇÃO

## 12.1 Solicitação

A Portaria SGD/MGI nº 11.230/2025 prevê solicitação pelo endereço:

`https://e.gov.br/validadordigital`

- [ ] Confirmar escopo;
- [ ] Confirmar documentação;
- [ ] Revisar DPC;
- [ ] Revisar PC;
- [ ] Revisar PSI;
- [ ] Revisar privacidade;
- [ ] Revisar evidências;
- [ ] Revisar requisitos de elegibilidade;
- [ ] Submeter.

## 12.2 Após submissão

- [ ] Monitorar solicitações de complementação;
- [ ] Responder dentro do prazo aplicável;
- [ ] Registrar cada comunicação;
- [ ] Controlar versões dos documentos enviados;
- [ ] Registrar resultado da análise.

A regulamentação prevê possibilidade de solicitação de complementação documental e procedimento de recurso.

---

# 13. FONTES NORMATIVAS PRINCIPAIS

### Regime atual do Validador de Acesso Digital

**Portaria SGD/MGI nº 11.230, de 12 de dezembro de 2025**

Usar como fonte principal para os requisitos atuais do credenciamento.

### Assinaturas eletrônicas avançadas

**Portaria Conjunta ITI/CC/PR SGD/SEDGG/ME nº 1, de 8 de setembro de 2021**

Usar quando o escopo envolver os padrões criptográficos e requisitos de assinatura eletrônica avançada previstos nessa norma.

### LGPD

**Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais**

Aplicar conforme os fluxos efetivamente realizados pelo Instituto.

### Manual anterior

O documento/manual anteriormente utilizado pelo projeto contém o item 8 sobre segurança da informação e privacidade. Entretanto, seus requisitos procedimentais devem ser **reconciliados com o regime regulatório vigente**, pois a Portaria SGD/MGI nº 11.230/2025 revogou a Portaria SEDGG/ME nº 2.154/2021.

---

# 14. MATRIZ EXECUTIVA

| Gate | Tema | Status | Prioridade | Bloqueador |
|---|---|---|---|---|
| 0 | Definir papel regulatório | A VALIDAR | CRÍTICA | SIM |
| 0 | Definir modalidade de validação | A VALIDAR | CRÍTICA | SIM |
| 1 | Atividade pública | A VALIDAR | ALTA | SIM |
| 1 | Sede no Brasil | A VALIDAR | ALTA | SIM |
| 1 | Instalações/equipamentos/pessoal | A VALIDAR | ALTA | SIM |
| 1 | Cobertura em todas as regiões | A VALIDAR | CRÍTICA | SIM |
| 1 | Critério de 1% da PEA | A VALIDAR | CRÍTICA | SIM |
| 2 | Procedimento documental | A VALIDAR | ALTA | Depende do escopo |
| 2 | Procedimento biométrico | A VALIDAR | ALTA | Depende do escopo |
| 3 | DPC | EM IMPLANTAÇÃO | ALTA | SIM |
| 4 | PC | EM IMPLANTAÇÃO | ALTA | Depende do escopo |
| 5 | PSI | EM IMPLANTAÇÃO | ALTA | SIM |
| 6 | LGPD/Privacidade | EM IMPLANTAÇÃO | CRÍTICA | SIM |
| 7 | Controles de segurança | EM IMPLANTAÇÃO | CRÍTICA | SIM |
| 8 | Matriz LGPD | EM IMPLANTAÇÃO | ALTA | SIM |
| 9 | Evidence Pack | EM IMPLANTAÇÃO | ALTA | SIM |
| 10 | Protocolo oficial | PENDENTE | CRÍTICA | Sim |

---

# 15. ORDEM DE EXECUÇÃO RECOMENDADA

**Não começar pelo documento mais bonito. Começar pelos bloqueadores.**

### Fase A — Elegibilidade
1. Definir papel regulatório;
2. Definir modalidade de validação;
3. verificar cobertura regional;
4. verificar critério de 1% da PEA;
5. comprovar capacidade operacional.

### Fase B — Arquitetura documental
6. DPC;
7. PC, se aplicável;
8. PSI;
9. Política de Privacidade;
10. Matriz de Segurança;
11. Matriz LGPD.

### Fase C — Evidências
12. Jurídico;
13. Operacional;
14. Técnico;
15. Governança;
16. Segurança/LGPD.

### Fase D — Auditoria interna
17. cruzar cada afirmação com uma evidência;
18. eliminar declarações sem prova;
19. registrar gaps;
20. revisar versões;
21. aprovar pacote.

### Fase E — Processo oficial
22. submissão;
23. acompanhamento;
24. resposta a complementações;
25. recurso, se necessário.

---

# 16. REGRA CENTRAL DO PROJETO

> **O GitHub documenta o que o IDMT pretende fazer e o que consegue provar. Ele não substitui a implantação real dos controles.**

Este diretório deve funcionar como **sistema de rastreabilidade regulatória**:

`Requisito → Controle → Implementação → Evidência → Documento → Protocolo`

Se uma etapa não possui evidência, seu status não deve ser **IMPLEMENTADO**.

---

**Última revisão:** 2026-10-07  
**Responsável pelo projeto:** Instituto Delyone de Medicina e Tecnologia LTDA  
**Classificação:** Documento interno de estruturação regulatória
