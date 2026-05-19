# MedUnity Delyone — v1.5

## Native AcroForm Engine + External Dictionary

This release separates the clinical dictionary from the JavaScript engine.

The app now loads:

```text
App/Data/canonical-fields.json
App/Data/templates-registry.json
App/Data/field-map-aih-goiania.json
```

The JavaScript acts only as a deterministic engine. Clinical concepts, institutional templates and PDF mappings are editable through JSON.

## Restricted use

The use of institutional medical documents is restricted to physicians contracted or formally authorized to work within the Brazilian Unified Health System (SUS), according to the institutional logos, seals and authorizations applicable to each document.

## Status

v1.5 is a private/protected release for controlled testing.
