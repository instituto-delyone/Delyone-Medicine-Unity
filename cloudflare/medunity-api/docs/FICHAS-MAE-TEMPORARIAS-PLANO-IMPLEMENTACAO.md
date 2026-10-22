# Fichas-mãe temporárias cifradas — fase de implementação

## Estado
Branch `feat/temporary-encrypted-fichas-mae`. Código em revisão/homologação; não implantar em produção.

## Requisitos acordados
- Retenção até o fim da sessão MedUnity autenticada; Free: máximo de 3 fichas simultâneas por conta.
- Recurso operacional temporário, não prontuário institucional permanente.
- Cifra AES-256-GCM no Worker, chave aleatória de 32 bytes em secret, IV aleatório de 12 bytes por ficha.
- Ownership obrigatório por conta; conteúdo clínico nunca em logs, URLs, mensagens de erro ou telemetria.
- Sem recuperação de chave/ficha nesta fase.
- Sem endpoint de descriptografia até validar a sessão oficial e o estado da numeração conforme contrato vigente da API SNCR. Não confiar em flags do navegador.
- Tokens oficiais SNCR nunca no frontend nem em logs.

## Retenção
A ficha expira no fim da validade do JWT MedUnity que a criou (máximo técnico de 12h nesta implementação). Logout não revoga atualmente o JWT no servidor, portanto exclusão imediata no logout ainda exige integração de sessão revogável. A API elimina fichas expiradas quando o usuário faz uma requisição; limpeza física global exige tarefa agendada e revisão da política de backups. Não prometer apagamento físico instantâneo antes disso.

## Limite Free e concorrência
Slots 1–3 e restrição UNIQUE (usuario_id, slot) evitam que requisições concorrentes ocupem o mesmo slot. Resposta 409 quando todos estão ocupados. Planos pagos ficam fora desta fase até existir entitlement validado no servidor.

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
