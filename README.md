Deterministic Clinical Document Engine
# MedUnity Delyone

**Deterministic Clinical Document Engine**

MedUnity Delyone is a clinical document engine designed to reduce repetitive medical documentation through canonical fields, native PDF templates, AcroForms and deterministic semantic mapping.

## Core concept

**Fill once. Generate multiple documents. Reduce clinical redundancy.**

The system transforms structured clinical input into institutional medical documents using editable JSON dictionaries and PDF field maps.

## Philosophy

MedUnity does not use artificial intelligence in production.

Artificial intelligence was used as a cognitive acceleration and architectural exploration tool during development, helping identify technical bottlenecks and design a system that is simple to operate, auditable and scalable.

## Architecture

```text
App/
├── Css/
│   └── style.css
├── Js/
│   └── app.js
├── Data/
│   ├── canonical-fields.json
│   ├── templates-registry.json
│   └── field-map-aih-goiania.json
├── Templates/
│   └── PDF/
│       └── 001-aih-goiania.pdf
└── index.html

script
                    FICHA-MÃE
                        │
                        ▼
          REGISTRO CLÍNICO CANÔNICO
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
          Template   Template   Template
             │          │          │
             ▼          ▼          ▼
          Relatório   Formulário                                          Documento


Features

* Native AcroForm PDF engine
* External editable clinical dictionary
* JSON-based semantic field mapping
* Deterministic client-side document generation
* Local-first architecture
* Low computational cost
* Institutional template interoperability
* No AI dependency in production

Current status

v1.5 — Private operational release

Legal notice

The use of institutional medical documents is restricted to physicians contracted or formally authorized to work within the Brazilian Unified Health System (SUS), according to the institutional logos, seals and authorizations applicable to each document.

MedUnity is a deterministic documentation support tool. It does not replace medical judgment, professional responsibility, institutional authorization or administrative validation of the final document.

No real patient data should be inserted in public repositories, demonstrations or testing environments.

Author

Dr. Delyone de Paula Canedo Filho
Medical Doctor · Independent Researcher · Language Meta-engineer

security:
Decisões que vamos adotar
1. Uma conta administradora na primeira versão. Nada de cadastro público de usuários.
2. Estrutura preparada para múltiplos usuários. Cada conta terá identidade própria e um perfil de acesso, mesmo que inicialmente exista só uma.
3. Senha e chave criptográfica separadas. A senha não será a chave do banco, nem ficará armazenada em texto puro.
4. Chave de dados aleatória. A senha será usada para proteger essa chave, com uma função própria para derivação de chave.
5. Sessão com bloqueio e logout. O backend verificará a autenticação nas operações protegidas.
6. Sem acesso público nesta fase.

Como preparar para vários profissionais depois
Quando chegar a hora, cada profissional terá login próprio e permissões. A arquitetura poderá permitir que usuários autorizados desbloqueiem a chave de dados sem compartilhar senhas entre si. Também teremos que implementar auditoria de acessos e regras para quem pode visualizar, criar ou alterar registros.
Isso não significa que todos terão acesso automático a todos os pacientes: essa será uma decisão de permissões, não apenas de criptografia.
Atenção à recuperação de senha
Se a senha for esquecida, não podemos simplesmente “recuperar” a chave criptográfica sem um mecanismo previamente planejado. Precisaremos decidir entre uma chave de recuperação guardada com segurança ou outro procedimento controlado. Sem isso, uma falha de senha pode tornar os dados inacessíveis.
