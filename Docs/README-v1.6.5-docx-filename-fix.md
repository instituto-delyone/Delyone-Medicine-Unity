# MedUnity v1.6.5 — DOCX filename fix

## Diagnóstico

O arquivo DOCX estava no caminho visual correto, mas no ZIP do GitHub apareceu com espaços antes do nome:

```txt
App/Templates/DOCX/    002-prescricao-upa-v1.docx
```

O app procura exatamente:

```txt
./Templates/DOCX/002-prescricao-upa-v1.docx
```

Se o nome tiver espaços antes de `002`, o navegador retorna erro de carregamento.

## Correção

Subir o arquivo com o nome exato:

```txt
App/Templates/DOCX/002-prescricao-upa-v1.docx
```

## Importante

Como o Netlify parece publicar a pasta `App` como raiz do site, o registry deve continuar usando:

```txt
./Templates/DOCX/002-prescricao-upa-v1.docx
```

Não trocar para `./App/Templates/...` neste modo de deploy.
