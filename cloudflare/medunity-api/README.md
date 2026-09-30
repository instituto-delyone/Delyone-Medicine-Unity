# MedUnity API — Cloudflare Worker

API administrativa do MedUnity, separada do site estático.

## Rotas

- `GET /health` — saúde da API e conexão D1.
- `POST /setup/admin` — bootstrap único do primeiro administrador.
- `POST /login` — autenticação e emissão de JWT.
- `GET /me` — validação da sessão atual.

## Segurança

- Senhas são armazenadas como PBKDF2-SHA-256 com salt aleatório.
- O JWT é assinado com HMAC-SHA-256.
- `JWT_SECRET` e `BOOTSTRAP_SECRET` são Cloudflare Secrets; nunca devem entrar no Git.
- O bootstrap deixa de funcionar depois que já existe um administrador ativo.
- O backend consulta o estado ativo do usuário ao validar `/me`.
- CORS aceita o domínio público do MedUnity e origens locais de desenvolvimento.

## Cloudflare

O Worker usa D1 como banco SQL. A configuração do Wrangler permite provisionamento automático do D1 na primeira implantação. As migrações ficam em `migrations/`.

No Workers Builds, use:

- Root directory: `cloudflare/medunity-api`
- Build command: vazio
- Deploy command: `npx wrangler deploy`

Depois da primeira implantação, aplique a migração D1:

`npx wrangler d1 migrations apply medunity-auth --remote`

Se a implantação estiver sendo feita apenas pelo dashboard, a migração também pode ser aplicada pelo D1/SQL do Cloudflare.

## Secrets obrigatórios

- `JWT_SECRET`
- `BOOTSTRAP_SECRET`

Eles devem ser cadastrados em Worker > Settings > Variables & Secrets como **Secrets**.
