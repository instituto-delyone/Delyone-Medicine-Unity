# MedUnity — Reimplementação SNCR conforme Manual da API, 3ª edição (setembro/2026)

## Escopo e regra de precedência

Este documento substitui as suposições do protótipo antigo como referência de implementação. O manual da Anvisa fornecido para o projeto é a fonte normativa desta integração. O código legado só deve ser mantido quando compatível com o contrato descrito aqui.

## Estado encontrado no repositório

- `index.html` apresenta o cartão SNCR e carrega `App/Js/receituario-sncr.js`.
- `App/Js/receituario-sncr.js` é somente uma simulação de interface: abre a página genérica do Gov.br e valida uma faixa de quantidade localmente; não chama os endpoints de numeração.
- `docs/sncr-integration.js` contém uma segunda implementação de autenticação, mas não é carregada pelo `index.html`. Ela troca `session_id` por token diretamente no navegador e armazena o token em `sessionStorage`; não deve ser promovida a produção sem revisão contra o fluxo de backend descrito no manual.
- Não foi identificado neste repositório um backend SNCR ou uma configuração de serviço que possa guardar e operar a sessão de forma confiável. Portanto, a interface estática, sozinha, não completa a integração oficial.

## Contrato da API SNCR identificado no manual

Base URL indicada no manual:
- Homologação: `https://sncr-api-hmg.apps.anvisa.gov.br`
- Produção: `https://sncr-api.apps.anvisa.gov.br`

Swagger:
- Homologação: endereço Swagger de homologação indicado pelo manual.
- Produção: o manual informa que o Swagger não é disponibilizado por razões de segurança.

### Autenticação

1. Iniciar o fluxo por `GET /api/v1/auth/login`, com `client_url` obrigatório e `state` opcional.
2. O fluxo passa pelo provedor de identidade indicado pelo SNCR. O retorno deve validar assinatura/estado/nonce conforme o manual antes de prosseguir.
3. O SNCR redireciona para `client_url` com `session_id` de uso único.
4. Recuperar o token com `GET /api/v1/auth/token?session_id=...`.
5. O token de sessão é temporário (o manual indica janela de 30 segundos para o token de sessão de uso único) e a resposta inclui `access_token` do tipo Bearer.
6. Chamadas protegidas usam `Authorization: Bearer <access_token>`. Tratar expiração, 401 e erros sem registrar tokens, códigos de sessão ou dados clínicos em logs.
7. O manual exige HTTPS em produção, URL de callback previamente cadastrada/permitida, estado assinado e controles contra replay. Não presumir que um domínio está autorizado só por ser do Instituto.

**Regra de arquitetura:** o fluxo de autenticação e a troca de credenciais devem ser implementados numa camada de servidor confiável, seguindo a seção de autenticação do manual. Não colocar segredo de cliente nem credencial Gov.br no frontend. A sessão do SNCR não substitui autenticação própria do MedUnity nem, por si só, comprova assinatura digital.

### Endpoint A — Notificação de Receita

- Método: `POST`
- Caminho: `/numeracoes/notificacao-receita`
- Objetivo: disponibilizar numeração para notificação autorizada pela Vigilância Sanitária.
- Campos de requisição apresentados no manual:
  - `receita` (string, obrigatório): tipo de notificação aceito pelo SNCR.
  - `conselho` (string, obrigatório): conselho profissional.
  - `uf` (string, obrigatório): UF do conselho.
  - `documento` (string, obrigatório): número do documento profissional.
  - `quantidade` (integer, obrigatório): de 10 a 50.
- O serviço valida a identidade/autorização do prescritor, conselho/UF/documento, disponibilidade e limite de numeração. A aplicação não deve inventar nem reservar numeração local.
- A resposta de sucesso inclui os números disponibilizados, quantidade e mensagem; validar o schema real antes de renderizar ou persistir.

### Endpoint B — Receita de Controle Especial / Receita Sujeita à Retenção

- Método: `POST`
- Caminho: `/numeracoes/receita-especial-retencao`
- Objetivo: solicitar numeração de RCE ou RET.
- Campos de requisição apresentados no manual:
  - `conselho`, `tipo` (RCE ou RET), `documento`, `uf`, `cnpj`; obrigatórios.
- O manual informa limites específicos por requisição e por profissional/mês. Esses limites devem ser aplicados com base no manual e nas respostas da API, nunca apenas por validação visual.
- A resposta de sucesso inclui `inicio`, `fim`, `quantidade` e `mensagem`. O aplicativo deve validar a resposta e não fabricar faixas de numeração.

## Códigos e tratamento de erros

O manual descreve códigos HTTP como 200/201 para sucesso, 400 para parâmetros/regra de negócio, 401/403 para autenticação/autorização, 404 para recurso/prescritor não encontrado e 500 para erro interno. A UI deve apresentar mensagens compreensíveis sem ocultar o código e a mensagem técnica sanitizada necessários para suporte.

## Plano de implementação

1. Manter o cartão SNCR integrado à interface existente, mas separar UI, cliente HTTP e serviço de backend.
2. Implementar no backend o fluxo de autenticação/callback do manual, com estado/nonce, callback permitido, sessão curta e troca segura do token.
3. Criar operações de backend para os dois endpoints de numeração; autenticação, validação, logs sanitizados, timeouts e erros padronizados.
4. Validar schemas de request/response com o manual e exemplos oficiais antes de enviar pedidos reais.
5. Testar primeiro em homologação; não emitir, consumir ou solicitar numeração real em testes sem autorização e credenciais de homologação.
6. Só considerar integração operacional após teste de ponta a ponta confirmado com resposta real da API.

## Pendências que bloqueiam declarar integração operacional

- Backend confiável não encontrado no repositório atual.
- Callback oficial e domínio cadastrado precisam ser confirmados com a Anvisa/SNCR.
- Credenciais/ambiente de homologação e permissões do prescritor precisam ser confirmados.
- O schema integral de respostas deve ser conferido com os exemplos e documentação auxiliar oficiais antes da implementação final.

**Status:** especificação de migração alinhada ao manual; não representa integração de produção concluída.
