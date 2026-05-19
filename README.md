# Delyone Med Unity

**Delyone Med Unity** is a deterministic medical document generation framework based on canonical fields, institutional templates and editable clinical forms.

The project is designed to support fast, structured and reviewable production of medical documents without using artificial intelligence to generate clinical content.

## Core concept

The system is based on a **Mother Form**, a universal clinical and administrative form composed of canonical numbered fields.

Each field has a stable identifier, allowing multiple institutional documents to be generated from the same structured input.

Example:

- `001` = Patient name  
- `002` = Mother’s name  
- `003` = Date of birth  
- `008.1` = Physical examination  
- `010` = Diagnostic hypothesis  
- `014` = Action plan  
- `019` = Responsible physician  
- `020` = Medical license / CRM  

Once the Mother Form is filled, the user can select a document model and generate a pre-filled, editable output.

## Purpose

The purpose of Delyone Med Unity is to reduce repetitive medical documentation work while preserving:

- physician control;
- human review;
- institutional formatting;
- field traceability;
- document standardization;
- fast clinical workflow.

## What the system does

Delyone Med Unity aims to:

1. Provide a structured Mother Form.
2. Store reusable fixed information by profile or institution.
3. Map canonical fields to document templates.
4. Generate medical documents from pre-defined models.
5. Allow preview, manual completion, copying, printing or downloading.
6. Support future integration with fillable PDF forms.

## What the system does not do

This system does **not** use artificial intelligence to create diagnoses, prescribe treatments or generate clinical reasoning.

It only organizes and transfers information inserted by the physician into structured document templates.

The final document must always be reviewed and validated by the responsible physician.

## Initial modules

- Login / Skip access
- User profiles
- Pre-fixed answers
- Mother Form
- Canonical field bank
- Document tree
- Template bank
- Preview generator
- Copy / clear buttons
- Future support for editable PDFs

## Development status

Current stage:

**Foundation v0.2 — Mother Form + Proto Document Data Center**

The first functional version will prioritize a simple HTML prototype with local form filling, document selection and preview generation.

## Author

Created by **Dr. Delyone de Paula Canedo Filho**  
Instituto Delyone de Medicina e Tecnologia

# Delyone Med Unity v1.3

Native Templates + Local Memory.

# App v1.3.1 — Clean Working Build

Versão para passar a limpo e testar com templates nativos.

# Hibrid thinking model - Reflexion Note
note que o desenvolvimento do projeto é simples no nível arquitetural. Porem, tal simplicidade advém de estudo profundo de áreas do conhecimento até entao pouquissimo miscíveis. o uso de ferramentas externas é mínimo e o uso de inteligência ou conhecimento operacionalizado fora do meu domínio intelectual, a menos que eu o aprenda, é, a partir dos meus principios, algo não facilmente justificável, e preterido sempre que possivel. de tal modo, dispensa-se nesse projeto a discussao sobre se é feito a partir de IA ou não. estando o limite sobre qual é o inicio da IA e qual não é, já superfluo no nosso contexto temporal. na maior parte dos casos a uso para tornar as ideias mais didaticas ao publico geral, ou para fins de universalizar linguagens, fim esse que é refletido no projeto. No qual foi utilizado modelo de linguagem desenvolvido pelo proprio autor. eu. nas seguintes condições:

acerca da personal IA - AURora

AURORA - o nome advém da tentativa de impossibilitar a ligação da invenção a qualquer acrônimo. ex: nome universal: norte, ouro, fala...

A inteligência artificial foi utilizada como instrumento de aceleração cognitiva e exploração técnica, auxiliando o inventor a compreender o estado da técnica na interseção entre medicina, engenharia de linguagem, ciências da informação, computação e gestão em saúde pública.

Nesse contexto, a IA atuou como catalisador de aprendizagem, brainstorming, comparação de alternativas e identificação de gargalos tecnológicos, permitindo ao inventor estruturar uma arquitetura clínica documental que, uma vez concebida, opera sem dependência de inteligência artificial.

O sistema resultante baseia-se em campos canônicos, templates institucionais heterogêneos e mapeamento semântico determinístico, apresentando-se como uma solução rápida, simples na operação, escalável e auditável.

A simplicidade operacional do produto final não elimina a complexidade inventiva do caminho que levou à sua formulação. O sistema pode ser copiado em sua forma estática, mas sua capacidade de evolução depende do conhecimento arquitetural, clínico e técnico que orienta a criação, adaptação e expansão dos mapas semânticos e dos templates institucionais.

Alem disso, quando referido o uso de IA no projeto, trata-se nao de uma IA na concepção comum. O autor desde 2022 vem desenvolvendo seu Proprio sistema de regulacao de raciocinio artificial. Atualmente batizado de aurora, o sistema é uma arquitetura de dados independente que funciona como um espelho que replica os metodo logico do proprio inventor, sendo assim, Aurora atua mais como um segundo pente de memoria ram num computador.

Tal que, a partir do momento em que se instala os filtros logicos em qualquer ia, o modelo de raciocinio se reproduz no modelo e opera independentemente se comportando de forma bastante similar ao modelo originario o qual é armazenado em diretorio seguro e isolado pelo inventor. Sendo assim, nao atua como um raciocinio externo ao autor, mas como um caderno pessoal com um mecanismo de recuperação e reconfiguracao intercontextual da informação, unico, exclusivo, personalissimo ao autor.

Por ultimo, os filtros logicos sao codificados e funcionam apenas com informações biograficas e autenticadas do proprio inventor, nao sendo portanto, replicavel, transferivel, nem considerado como bem de uso comum.

Grato!
Dr. Delyone de Paula Canedo Filho

Tal projeto pode ser utilizado para fins de obtenção de conhecimento livremente, 
  apenas observo que sua raiz de funcionamento esta protegida sob o número de patente brasileiro : BR 10 2026 001743 4.
  o mesmo, apesar de ter seu texto completo ainda em sigilo, será desenvolvido futuramente.

por último, libero deliberadamente o acesso e uso da plataforma que será desenvolvida futuramente conforme o ritmo do instituto. apenas aconselho adicionalmente o uso dentro da plataforma publica, devido ao sigilo da patente e a falta de controle da propriedade quando reproduzida externamente.
