# MedUnity v1.6.2 - Clean DOCX Patch

Patch mínimo para corrigir o template DOCX da Prescrição UPA.

## O que este patch faz

- Substitui o template `002-prescricao-upa-v1.docx` por uma versão limpa, sem dados identificáveis de paciente.
- Mantém o caminho esperado pelo app:
  - `App/Templates/DOCX/002-prescricao-upa-v1.docx`
- Inclui também uma cópia pública opcional:
  - `public/templates/002-prescricao-upa-v1.docx`
- Reinclui o registry e o field-map da Prescrição UPA para garantir consistência.

## Ordem de aplicação

1. Apague a pasta errada, se existir:
   - `App/Templates/DOCX/002-prescricao-upa-v1/`
2. Suba o arquivo DOCX diretamente em:
   - `App/Templates/DOCX/002-prescricao-upa-v1.docx`
3. Suba a cópia pública em:
   - `public/templates/002-prescricao-upa-v1.docx`
4. Substitua, se necessário:
   - `App/Data/templates-registry.json`
   - `App/Data/field-map-prescricao-upa-v1.json`
5. Faça redeploy limpo no Netlify.

## Verificação de privacidade

A versão limpa não contém os termos: VINICIUS, RODRIGUES, IGOR, LOUREDO, PANCREATITE, 30/01 ou 17/05.

## Regra importante

O app espera um arquivo `.docx`, não uma pasta com esse nome.

Correto:
`App/Templates/DOCX/002-prescricao-upa-v1.docx`

Incorreto:
`App/Templates/DOCX/002-prescricao-upa-v1/`
