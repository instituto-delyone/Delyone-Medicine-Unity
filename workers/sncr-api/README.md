# MedUnity SNCR API Worker — configuração de teste

Este Worker é o adaptador de servidor da integração do MedUnity com a API SNCR, com a primeira barreira administrativa exigida pelo projeto.

## Antes de testar

1. Criar namespace KV no Cloudflare e substituir o placeholder de `id` no `wrangler.toml`.
2. Configurar as variáveis não secretas:
   - `SNCR_ENV=homologacao` para testes; produção só depois de validação formal.
   - `SNCR_FRONTEND_ORIGIN`: origem HTTPS exata do MedUnity (sem barra final).
   - `SNCR_CALLBACK_URL=https://medunity.delyone.com/`: URL HTTPS de retorno confirmada pelo responsável do projeto; deve permanecer exatamente igual à URL cadastrada/permitida no SNCR.
3. Cadastrar secrets no ambiente Cloudflare, nunca no Git:
   - `SNCR_ADMIN_TEST_KEY`: chave aleatória longa para a restrição temporária de administrador.
   - `SNCR_STATE_HMAC_SECRET`: segredo aleatório forte para assinar o state.
4. Implantar o Worker num ambiente de homologação e definir no frontend:
   `window.MEDUNITY_SNCR_WORKER_URL = "https://<worker-host>";`
   antes de carregar `App/Js/receituario-sncr.js`.
5. Confirmar com a Anvisa/SNCR o callback permitido, o fluxo de autenticação atual e o cadastro do prescritor antes de iniciar o teste real.

## Rotas implementadas

- `GET /health` — estado básico, sem credenciais.
- `GET /admin/session` — verifica a chave de administrador de teste.
- `POST /auth/login` — cria nonce/state assinado e devolve a URL de início do fluxo SNCR.
- `POST /auth/callback` — valida state, consome o estado de uso único e troca o `session_id` SNCR por token no servidor.
- `POST /numeracoes/notificacao-receita` — encaminha pedidos NRA/NRB/NRB2/NRR/NRT.
- `POST /numeracoes/receita-especial-retencao` — encaminha pedidos RCE/RET.

## Restrição administrativa

A chave administrativa é apenas uma barreira temporária para o teste, não um sistema completo de identidade institucional. O frontend mantém a chave em `sessionStorage` durante a aba; o servidor valida a chave antes de liberar rotas. Não reutilizar senha de conta pessoal. Rotacionar/remover a chave após a fase de teste e substituir o mecanismo por autenticação administrativa oficial do MedUnity.

## Fluxo de retorno revisado (homologação)\n\n- A página pública recebe `session_id` e `state` na URL de retorno, remove esses parâmetros do histórico visível antes de chamar o backend e só conclui a troca de sessão após a barreira administrativa de teste.\n- Se o provedor retornar erro ou parâmetros incompletos, a interface mostra uma mensagem e não tenta trocar token.\n- A URL do Worker no frontend está configurada somente na branch de trabalho; não considerar a integração publicada até revisão, deploy e testes de ponta a ponta.\n\n## Segurança e limitações atuais

- Não usar com dados de pacientes; as rotas tratam apenas de numeração e dados profissionais.
- O Worker mantém o token SNCR em KV com TTL e não o devolve ao navegador.
- O state é assinado por HMAC, com nonce e TTL curto; a sessão de callback é consumida uma única vez. O Worker rejeita state com separadores ambíguos, callback expirado e origem divergente da origem autorizada.
- Não registrar token, state, session_id, chave administrativa ou conteúdo clínico em logs.
- As chamadas à API usam timeout e tratam respostas HTTP. Validar integralmente os schemas de erro/sucesso e os códigos de negócio com o ambiente oficial de homologação.
- Este código não deve ser considerado pronto para produção até teste de ponta a ponta, revisão de segurança e confirmação do fluxo com a Anvisa.
