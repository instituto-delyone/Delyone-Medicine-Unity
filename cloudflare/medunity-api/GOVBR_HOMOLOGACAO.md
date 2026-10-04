# MedUnity — Login GOV.BR (Homologação)

## Endpoints implementados

| Função | Endpoint |
|---|---|
| Iniciar autenticação | `GET /auth/govbr` |
| Retorno OAuth/PKCE | `GET /auth/govbr/callback` |
| Consultar sessão GOV.BR | `GET /auth/govbr/me` |
| Logout GOV.BR + MedUnity | `GET` ou `POST /auth/govbr/logout` |
| Diagnóstico sem segredo | `GET /auth/govbr/config` |

URL base atual do Worker:

`https://medunity-api.dr-delyone.workers.dev`

## URLs para o formulário do Portal da Sociedade

### URL(s) do retorno (Homologação)

`https://medunity-api.dr-delyone.workers.dev/auth/govbr/callback`

### URL única para página inicial do sistema (Homologação)

`https://medunity.delyone.com`

### URL de Logout (Homologação), quando o campo estiver disponível

`https://medunity-api.dr-delyone.workers.dev/auth/govbr/logout`

> A URL de callback deve ser cadastrada exatamente igual à usada em `GOVBR_REDIRECT_URI`. A documentação oficial do Login Único exige que a `redirect_uri` esteja previamente cadastrada e que o fluxo use `state`, `nonce` e PKCE/S256.

## Variáveis/Secrets do Worker

Depois que o GOV.BR aprovar a solicitação e disponibilizar as credenciais de homologação, configurar no Cloudflare:

- `GOVBR_BASE_URL=https://sso.staging.acesso.gov.br`
- `GOVBR_CLIENT_ID=<client_id recebido do GOV.BR>`
- `GOVBR_CLIENT_SECRET=<secret recebido do GOV.BR>`
- `GOVBR_REDIRECT_URI=https://medunity-api.dr-delyone.workers.dev/auth/govbr/callback`
- `GOVBR_RETURN_URL=https://medunity.delyone.com/`

**Nunca** colocar `GOVBR_CLIENT_SECRET` no GitHub, HTML, JavaScript do navegador ou documentação pública.

## Fluxo implementado

1. MedUnity chama `/auth/govbr`.
2. O Worker gera `state`, `nonce` e `code_verifier` e grava o estado temporário no D1.
3. O Worker redireciona para `sso.staging.acesso.gov.br/authorize` com PKCE S256.
4. GOV.BR retorna `code` + `state` para `/auth/govbr/callback`.
5. O Worker valida `state` e troca o `code` por `access_token` + `id_token`.
6. O Worker consulta `/jwk` e valida as assinaturas RS256 e os claims de issuer/audience; o `id_token` também é validado contra o `nonce` original.
7. O Worker usa o `access_token` no `/userinfo` para obter os dados básicos do usuário.
8. O usuário é associado/criado na tabela local `usuarios` como perfil `usuario` quando apropriado.
9. É criada uma sessão própria do MedUnity em `govbr_sessions`; o token do GOV.BR não é usado como sessão da aplicação.
10. O navegador retorna para `https://medunity.delyone.com/?govbr=authenticated`.
11. O logout revoga a sessão MedUnity e redireciona para o logout do GOV.BR.

## Banco de dados

A migration `0005_govbr_login.sql` cria:

- `govbr_auth_states`: estado temporário para `state`, `nonce` e PKCE.
- `govbr_sessions`: sessões próprias do MedUnity associadas ao usuário local.

Aplicar a migration no D1 antes do primeiro teste de login.

## Antes do primeiro teste

1. Aplicar a migration no D1 `medunity-auth`.
2. Configurar os quatro valores `GOVBR_*` acima.
3. Confirmar no Portal da Sociedade que a callback cadastrada é exatamente a mesma URL.
4. Abrir `https://medunity-api.dr-delyone.workers.dev/auth/govbr/config` e confirmar que o endpoint responde sem expor o segredo.
5. Testar `https://medunity-api.dr-delyone.workers.dev/auth/govbr` em navegador normal.
6. Após o fluxo de login, confirmar retorno ao MedUnity e consultar `/auth/govbr/me` com cookies.
7. Para a evidência de homologação, gravar o navegador com a barra de endereço visível, mostrando login, retorno ao MedUnity e logout.

## Produção

Quando houver credencial de produção, trocar apenas o ambiente/credenciais e seguir a configuração oficial. A documentação do GOV.BR também estabelece requisitos próprios para o domínio do sistema em produção; portanto, a URL pública de produção deve ser validada no processo antes da promoção.
