# Integração SNCR — plano de implantação MedUnity

Status: preparação técnica; **não considerar emissão eletrônica em produção habilitada** até concluir os testes oficiais.

## Decisões de arquitetura

- Trabalhar somente na branch `main`.
- Preservar o motor documental e a autenticação administrativa atuais.
- Manter a autenticação do prescritor no SNCR separada da sessão administrativa do MedUnity.
- Não confundir login com assinatura eletrônica.
- Não fabricar, reservar localmente ou reutilizar numerações. A numeração e a emissão devem seguir o fluxo oficial correspondente ao tipo de receituário.
- Não declarar identidade, registro profissional, permissões ou disponibilidade de numeração com base apenas na existência de um token.

## Estado observado no repositório

- `docs/sncr-integration.js` contém redirecionamento para a API SNCR, processamento do parâmetro `session_id`, troca por `access_token`, armazenamento em `sessionStorage` e tratamento de sessão expirada.
- `docs/index.html` carrega o módulo como cartão separado do motor documental.
- O módulo não implementa emissão de receituários. A existência do método genérico `request()` não prova que os endpoints, payloads ou fluxos de emissão estejam validados.
- O Worker `cloudflare/medunity-api` continua sendo a API administrativa. Nenhuma rota de emissão SNCR deve ser adicionada sem necessidade confirmada pela documentação oficial.
- O domínio principal do MedUnity atualmente configurado no GitHub Pages é `medunity.delyone.com`; o callback de autenticação exige HTTPS e hostname terminado em `.br`, conforme as instruções de integração consultadas. Por isso, o botão permanece desabilitado enquanto o callback suportado não estiver configurado.

## Próximas etapas

1. Renovar e confirmar a titularidade/estado ativo de `delyone.com.br`.
2. Configurar DNS e HTTPS para um endpoint de callback em domínio `.br`, sem alterar os registros que mantêm o site atual no ar.
3. Definir onde o callback será servido. Não apontar `MEDUNITY_SNCR_CALLBACK_URL` para uma URL que não tenha uma página/handler real para processar `session_id`.
4. Comparar `docs/sncr-integration.js` com a versão mais recente do Manual da API e com a aplicação oficial de exemplo da Anvisa.
5. Testar no ambiente de treinamento: redirecionamento, callback, troca do `session_id` (uso único), falha de autenticação, expiração/401 e retorno de identidade/permissões somente quando fornecidos pela API.
6. Implementar cada fluxo de receituário usando exclusivamente os endpoints, payloads, modelos e regras vigentes da Anvisa. Tratar separadamente receituário físico e eletrônico.
7. Testar erros de rede e reenvio para impedir duplicidade. Nunca repetir uma emissão cegamente após timeout sem verificar o resultado conforme os recursos oficiais disponíveis.
8. Só habilitar emissão eletrônica depois de confirmar testes de ponta a ponta e configuração de produção.

## Configuração de callback

A variável opcional `window.MEDUNITY_SNCR_CALLBACK_URL` pode definir a URL exata do callback. Ela deve ser configurada somente depois de a URL estar servida por HTTPS, no domínio aceito pelo SNCR, e de existir um handler real para receber o retorno.

Não usar `https://sncr.delyone.com.br/...` como valor final apenas por ser um endereço planejado: primeiro é necessário criar o DNS, disponibilizar o endpoint e validar o fluxo de retorno.

## Fontes oficiais

- Página de documentação para serviços de prescrição eletrônica: https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/controlados/sncr/documentos-do-sncr
- Instruções de Integração API SNCR v1.0: https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/controlados/sncr/documentos-do-sncr/instrucoes-de-integracao-api-sncr-v1-0.pdf

A documentação da Anvisa pode mudar. Verificar a versão publicada mais recente antes de implantar endpoints ou regras de numeração.
