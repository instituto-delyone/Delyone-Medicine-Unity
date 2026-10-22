# Fichas-mãe temporárias cifradas — fase de implementação

## Estado
Implementação inicial incorporada à branch principal para revisão técnica; ainda não está homologada nem autorizada para produção.

## Requisitos acordados
- Retenção pretendida até o fim da sessão MedUnity autenticada; Free: máximo de 3 fichas simultâneas por conta.
- Recurso operacional temporário, não prontuário institucional permanente.
- Cifra AES-256-GCM no Worker, chave aleatória de 32 bytes em secret, IV aleatório de 12 bytes por ficha.
- Ownership obrigatório por conta; conteúdo clínico nunca em logs, URLs, mensagens de erro ou telemetria.
- Sem recuperação de chave/ficha nesta fase.
- Sem endpoint de descriptografia até validar a sessão oficial e o estado da numeração conforme contrato vigente da API SNCR. Não confiar em flags do navegador.
- Tokens oficiais SNCR nunca no frontend nem em logs.

## Retenção — limitação importante
O JWT MedUnity atual expira em 30 minutos. A ficha é marcada para expirar até a validade do JWT que a criou; portanto, na implementação atual, o prazo máximo normal é de 30 minutos, não 12 horas. O JWT não tem revogação server-side. O endpoint `POST /fichas-mae/session-end` exclui as fichas da conta, mas o frontend ainda precisa chamá-lo antes de encerrar a sessão. A API remove fichas expiradas quando o usuário faz uma requisição; limpeza física global exige tarefa agendada e revisão da política de backups. Não prometer apagamento físico instantâneo antes disso.

## Limite Free e concorrência
Slots 1–3 e restrição UNIQUE (usuario_id, slot) visam impedir que requisições concorrentes ocupem o mesmo slot. A concorrência precisa ser validada em homologação. Resposta prevista: 409 quando todos estão ocupados. Planos pagos ficam fora desta fase até existir entitlement validado no servidor.

## Segurança e aceitação
1. Sem JWT válido: 401.
2. Conta A não lista/exclui ficha da conta B.
3. Quatro POSTs concorrentes deixam no máximo três fichas.
4. D1 contém ciphertext e IV, nunca o payload em claro.
5. Chave ausente/malformada: falha fechada.
6. Payload limitado a campos permitidos e 24 KiB.
7. Sem rota de leitura individual/descriptografia.
8. Logs e erros sem corpo, tokens ou dados clínicos.
9. Testes com dados fictícios e D1 isolada.
10. Nenhuma numeração oficial inventada nem repetição automática após timeout ambíguo.

## Limite arquitetural
Como o Worker possui a chave e executa a cifra, um administrador da infraestrutura ainda poderia alterar o código para revelar conteúdo. A arquitetura reduz acesso rotineiro, mas não oferece impossibilidade criptográfica de acesso administrativo.
