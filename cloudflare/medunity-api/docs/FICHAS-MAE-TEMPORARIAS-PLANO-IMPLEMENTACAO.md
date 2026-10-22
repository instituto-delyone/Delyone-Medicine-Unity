# Fichas-mãe temporárias cifradas — fase de implementação

## Estado
Branch de implementação: `feat/temporary-encrypted-fichas-mae`.
Código em revisão e homologação; não implantar em produção nesta fase.

## Requisitos acordados
- Retenção: até o fim da sessão MedUnity autenticada. O fim da sessão significa expiração/revogação do JWT MedUnity ou encerramento explícito da sessão, o que ocorrer primeiro.
- Plano Free: no máximo três fichas simultâneas por conta, imposto no servidor.
- O recurso é operacional e temporário, não um prontuário institucional permanente.
- O conteúdo é cifrado no Worker com AES-256-GCM; chave em secret de ambiente, nunca no HTML/JavaScript público.
- Cada ficha pertence a uma conta autenticada; não pode haver acesso cruzado entre usuários.
- Conteúdo clínico não deve aparecer em logs, URLs, mensagens de erro ou telemetria.
- Não há mecanismo de recuperação de chave/ficha nesta fase.
- A descriptografia para uso em receita fica bloqueada até que a integração valide a sessão oficial e confirme o estado da numeração conforme o contrato vigente da API SNCR.
- Não confiar em flags do navegador como `sncr_authenticated=true`; a autorização deve ser atestada pelo backend/Worker após validação real do fluxo oficial.
- Não armazenar tokens oficiais SNCR no frontend nem registrar tokens em logs.

## Criptografia
Usar AES-256-GCM com chave aleatória de 32 bytes fornecida por secret do Worker, IV aleatório de 12 bytes por operação e autenticação de integridade. SHA-256 não é criptografia reversível.

A chave deve ser gerada fora do código-fonte e configurada como secret no ambiente. Nunca adicionar chave real a GitHub, arquivos versionados, logs ou documentação. Rotação de chave requer plano explícito; como não há recuperação, trocar a chave sem recifrar as fichas torna o conteúdo inacessível.

## Retenção e encerramento de sessão
O servidor deve vincular cada ficha à sessão MedUnity que a criou e definir `expires_at` até o prazo de expiração do JWT no momento da criação, limitado pelo fim da sessão. Requisições autenticadas devem remover/ignorar fichas expiradas. Logout deve revogar/invalidar a sessão e excluir as fichas associadas. Expiração de JWT sem nova requisição não dispara execução no Worker; portanto, limpeza física automática e imediata depende de mecanismo de limpeza agendado ou política de expurgo do armazenamento. Até isso ser implementado e testado, não prometer apagamento físico instantâneo. A API deve rejeitar fichas expiradas mesmo que ainda existam fisicamente no D1.

## Concorrência e limite Free
A tabela usa slots 1–3 e restrição única por usuário/slot. A criação tenta alocar um slot livre; a restrição única impede que duas requisições concorrentes ocupem o mesmo slot. A aplicação deve responder 409 quando os três slots estão ocupados. Planos pagos ficam fora desta fase até existir fonte confiável de entitlement no servidor.

## Critérios mínimos de aceitação
1. Sem autenticação MedUnity válida, não é possível criar, listar ou excluir fichas.
2. Uma conta não pode listar nem operar fichas de outra.
3. O limite de três fichas do Free é aplicado no servidor, incluindo requisições concorrentes.
4. Conteúdo persistido permanece cifrado; chave não aparece em repositório nem em resposta HTTP.
5. IV aleatório de 12 bytes por cifra; falhas de autenticação GCM rejeitam o conteúdo.
6. Expiração é aplicada no servidor e testada.
7. Logs não contêm conteúdo clínico, tokens, chaves ou corpos de requisição.
8. Não existe endpoint de descriptografia acessível só com JWT MedUnity nesta fase.
9. Falha, timeout ou ausência de confirmação oficial impede uso para preenchimento de receita.
10. Nenhuma numeração oficial é inventada ou repetida automaticamente após resultado ambíguo.
11. Testes usam dados fictícios em homologação.

## Ordem de implementação
1. Implementar armazenamento cifrado e rotas de gestão de fichas.
2. Testar autenticação, ownership, limite, cifra e expiração.
3. Validar manual e Worker SNCR oficiais antes de implementar autorização de uso única e curta.
4. Integrar seleção mínima de campos e formulário após revisão.
5. Homologação; produção só após revisão técnica e aprovação explícita.

## Limite importante
Como a chave fica no Worker e o Worker realiza a descriptografia, a arquitetura reduz o acesso operacional rotineiro, mas não torna o administrador da infraestrutura tecnicamente incapaz de modificar o código para revelar conteúdo. O compromisso institucional de não acessar indevidamente deve ser acompanhado por controles técnicos e organizacionais.
