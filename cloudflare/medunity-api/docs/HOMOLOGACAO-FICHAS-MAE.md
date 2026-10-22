# Homologação — fichas-mãe temporárias

Usar dados fictícios e D1 isolada. Não implantar nem configurar segredo em produção.

## Preparação
1. Gerar secret aleatório de 32 bytes e codificar em Base64URL sem padding.
2. Configurar `FICHA_MAE_ENCRYPTION_KEY` somente no Worker de homologação.
3. Aplicar `0006_fichas_mae_temporarias.sql` apenas à D1 de homologação.
4. Testar com duas contas independentes.

## Casos obrigatórios
- Sem token, token adulterado/expirado ou usuário inativo: 401.
- Criar três fichas: sucesso; quarta: 409.
- Quatro POSTs paralelos: no máximo três slots.
- Conta A não lista nem exclui ficha de B.
- Verificar que o D1 armazena ciphertext/IV e não contém os valores fictícios em claro.
- Chave ausente/malformada: 503 sem conteúdo sensível.
- Campo não permitido, estrutura inválida: 400; payload acima de 24 KiB: 413.
- JWT expirado: ficha não criada; ficha expirada não aparece e é removida ao acessar a API.
- POST autenticado em `/fichas-mae/session-end` exclui as fichas da conta; verificar integração no logout do frontend.
- GET de ID individual/descriptografia: 404.
- Conferir logs sem tokens, chaves, payload ou conteúdo clínico.

## Pendências antes da homologação completa
O código está na branch principal, mas não deve ser considerado pronto para uso clínico ou produção. Ainda é necessário instalar o secret no ambiente isolado, aplicar a migração na D1 de teste e executar testes automatizados reais. O JWT atual dura 30 minutos e não tem revogação server-side; a exclusão no logout depende de o frontend chamar o endpoint de encerramento. A limpeza física global e a política de backups ainda precisam de solução. A descriptografia para preencher receita fica bloqueada até validar o manual/Worker SNCR.
