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
