# Fichas-mãe temporárias cifradas — fase de implementação

## Estado
Branch de implementação: `feat/temporary-encrypted-fichas-mae`.

Esta fase deve ser tratada como código em revisão, não como implantação de produção. Nenhuma chamada oficial SNCR, numeração real ou emissão de receita é habilitada por este documento.

## Requisitos acordados
- O recurso é operacional e temporário, não um prontuário institucional permanente.
- Plano Free: até três fichas por conta; limites devem ser validados no servidor.
- O conteúdo deve ser cifrado no ambiente Worker, com chave em secret de ambiente, nunca em HTML/JavaScript público.
- Cada ficha pertence a uma conta autenticada; não pode haver acesso cruzado entre usuários.
- O conteúdo não deve aparecer em logs, URLs, mensagens de erro ou telemetria.
- Não há mecanismo de recuperação de chave/ficha nesta fase.
- A recuperação/descriptografia para uso em receita só pode ocorrer depois de a integração validar a sessão oficial e confirmar o estado da numeração conforme o contrato vigente da API SNCR.
- Não confiar em flags do navegador como `sncr_authenticated=true`; a autorização deve ser atestada pelo backend/Worker após validação real do fluxo oficial.
- Não armazenar tokens oficiais SNCR no frontend nem registrar tokens em logs.

## Criptografia
Usar AES-256-GCM com chave aleatória de 32 bytes fornecida por secret do Worker, IV aleatório de 12 bytes por operação e autenticação de integridade. SHA-256 não é criptografia reversível e não deve ser usado para cifrar o conteúdo.

A chave deve ser gerada fora do código-fonte e configurada como secret no ambiente. Nunca adicionar uma chave real a GitHub, arquivos de configuração versionados, logs ou documentação.

## Retenção temporária
A duração exata deve ser configurada e exibida ao usuário antes de ativar em produção. A exclusão lógica não basta: definir estratégia de limpeza automática e considerar cópias, logs, caches e limites do provedor. Até essa política ser implementada e testada, não declarar que a exclusão física está garantida.

## Critérios mínimos de aceitação
1. Sem autenticação MedUnity válida, não é possível criar, listar, ler ou excluir fichas.
2. Uma conta não pode listar nem recuperar fichas de outra.
3. O limite de três fichas do Free é aplicado no servidor, incluindo requisições concorrentes.
4. Conteúdo persistido permanece cifrado; chave não aparece em repositório nem em resposta HTTP.
5. IV único por cifra; falhas de autenticação GCM rejeitam o conteúdo.
6. Expiração é aplicada no servidor e testada.
7. Logs não contêm conteúdo clínico, tokens, chaves ou corpos de requisição.
8. Falha, timeout ou ausência de confirmação oficial impede descriptografia/uso para preenchimento.
9. Nenhuma numeração oficial é inventada ou repetida automaticamente após resultado ambíguo.
10. Testes usam dados fictícios em homologação.

## Ordem de implementação
1. Confirmar o manual oficial e o estado real do Worker implantado.
2. Implementar o armazenamento cifrado e as rotas de gestão de fichas.
3. Implementar uma autorização de uso única e curta, criada apenas após validação real da sessão SNCR e da numeração.
4. Integrar a seleção mínima de campos e o formulário.
5. Testar em homologação; produção só após revisão técnica e aprovação explícita.

## Limite importante
Como a chave fica no Worker e o Worker realiza a descriptografia, a arquitetura reduz o acesso operacional rotineiro, mas não torna o administrador da infraestrutura tecnicamente incapaz de modificar o código para revelar conteúdo. O compromisso de não acessar indevidamente deve ser acompanhado por controles técnicos e organizacionais.
