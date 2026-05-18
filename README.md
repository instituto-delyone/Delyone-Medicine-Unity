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
