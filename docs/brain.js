// brain.js
// MedUnity — Módulo de Roteamento Inteligente
// CSI → AIH
//
// IMPORTANTE:
// Coloque uma NOVA chave aqui apenas para teste local.
// Não versione a chave real no GitHub.

const API_KEY = "COLE_AQUI_SUA_NOVA_CHAVE";

// Modelo usado pelo roteador.
// Pode ser alterado sem modificar o restante do sistema.
const GEMINI_MODEL = "gemini-3.5-flash";


// ============================================================
// CONFIGURAÇÃO DO ROTEAMENTO
// ============================================================

const AIH_ALLOWED_KEYS = [
  "5",
  "6",
  "7",
  "8",
  "9",
  "11",
  "12",
  "15",
  "16",
  "20",
  "21",
  "23",
  "24",
  "33"
];


// ============================================================
// PROMPT CANÔNICO
// ============================================================

const SYSTEM_PROMPT = `
Você é o módulo de roteamento documental do MedUnity.

Sua função NÃO é fazer diagnóstico médico.
Sua função é exclusivamente transformar dados estruturados da Ficha-Mãe
em um mapa documental para o formulário AIH.

================================================
CAMADA 1 — CLINICAL STRUCTURE INDEX (CSI)
================================================

01 - IDENTIFICAÇÃO

01.1 - Nome completo
01.2 - Nome social
01.3 - CPF
01.4 - CNS
01.5 - Data de nascimento
01.6 - Idade
01.7 - Sexo
01.8 - Nome da mãe
01.9 - Município
01.11 - Telefone
01.12 - Endereço

02 - CONTEXTO ASSISTENCIAL

02.1 - Prontuário
02.2 - Data de atendimento
02.3 - Setor / Unidade
02.4 - Número da AIH

03 - ANAMNESE

03.1 - Queixa principal
03.2 - História da doença atual
03.3 - Antecedentes pessoais
03.4 - Medicações em uso
03.5 - Alergias
03.6 - História familiar
03.7 - História social

04 - EXAME FÍSICO CLÍNICO

04.1 - Sinais vitais
04.2 - Exame físico

05 - EXAMES COMPLEMENTARES

05.1 - Exames laboratoriais
05.2 - Imagem / outros exames complementares
05.3 - Outros resultados / documentos

06 - AVALIAÇÃO CLÍNICA

06.1 - Hipótese diagnóstica
06.2 - CID-10
06.3 - Diagnósticos diferenciais
06.4 - Impressão / avaliação clínica

07 - PLANO TERAPÊUTICO / CONDUTA

07.1 - Plano terapêutico / conduta

08 - PROFISSIONAL RESPONSÁVEL

08.1 - Médico responsável
08.2 - CRM / UF


================================================
CAMADA 2 — MAPA AIH
================================================

O formulário AIH possui as seguintes correspondências:

"5"  ← 01.1
"6"  ← 02.1
"7"  ← 01.4
"8"  ← 01.5
"9"  ← 01.7
"11" ← 01.8
"12" ← 01.11
"15" ← 01.12
"16" ← 01.9

"20" ← composição de:
03.1
03.2
03.3
03.4
03.5
03.6
03.7
04.2

"21" ← composição de:
04.1
05.1
05.2
05.3
06.1
06.2
06.3
06.4

"23" ← 06.1
"24" ← 06.2
"33" ← 08.1

================================================
REGRAS DE COMPOSIÇÃO
================================================

Campo "20":

Concatenar os conteúdos disponíveis de 03.1 até 03.7
e depois 04.2.

Cada componente deve aparecer em uma nova linha.

Não invente informações.

Campo "21":

Concatenar os conteúdos disponíveis de 04.1,
05.1, 05.2, 05.3,
06.1, 06.2, 06.3 e 06.4.

Cada componente deve aparecer em uma nova linha.

Não invente informações.

================================================
REGRAS ABSOLUTAS
================================================

1. Não invente dados.
2. Não altere dados clínicos.
3. Não faça diagnóstico.
4. Não transforme ausência de informação em informação.
5. Se um campo estiver vazio, simplesmente não o inclua na composição.
6. Retorne SOMENTE um objeto JSON.
7. As únicas chaves permitidas são:

5, 6, 7, 8, 9, 11, 12, 15, 16, 20, 21, 23, 24, 33

8. Não retorne explicações.
9. Não use Markdown.
10. Não use bloco de código.
`;


// ============================================================
// FUNÇÃO AUXILIAR
// ============================================================

function limparTexto(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  return String(valor).trim();
}


function adicionarLinha(lista, valor) {
  const texto = limparTexto(valor);

  if (texto) {
    lista.push(texto);
  }
}


function montarComposicao(dados, campos) {
  const linhas = [];

  for (const campo of campos) {
    adicionarLinha(linhas, dados[campo]);
  }

  return linhas.join("\n");
}


// ============================================================
// FALLBACK NATIVO
// ============================================================

function montarMapaAIHNativo(dados) {

  const mapa = {};

  if (dados.patient_name)
    mapa["5"] = dados.patient_name;

  if (dados.record_number)
    mapa["6"] = dados.record_number;

  if (dados.cns)
    mapa["7"] = dados.cns;

  if (dados.birth)
    mapa["8"] = dados.birth;

  if (dados.gender)
    mapa["9"] = dados.gender;

  if (dados.mother_name)
    mapa["11"] = dados.mother_name;

  if (dados.phone)
    mapa["12"] = dados.phone;

  if (dados.address)
    mapa["15"] = dados.address;

  if (dados.municipality)
    mapa["16"] = dados.municipality;


  const campo20 = montarComposicao(dados, [
    "qpp",
    "hda",
    "antecedents",
    "medications",
    "allergies",
    "family_history",
    "social_history",
    "physical_exam"
  ]);

  if (campo20)
    mapa["20"] = campo20;


  const campo21 = montarComposicao(dados, [
    "vitals",
    "labs",
    "imaging",
    "other_results",
    "hypothesis",
    "cid10",
    "differential",
    "assessment"
  ]);

  if (campo21)
    mapa["21"] = campo21;


  if (dados.hypothesis)
    mapa["23"] = dados.hypothesis;

  if (dados.cid10)
    mapa["24"] = dados.cid10;

  if (dados.doctor_name)
    mapa["33"] = dados.doctor_name;


  return mapa;
}


// ============================================================
// LIMPEZA / VALIDAÇÃO DO JSON DA IA
// ============================================================

function extrairJSON(texto) {

  if (!texto) {
    throw new Error("Gemini retornou resposta vazia.");
  }

  let limpo = String(texto).trim();

  // Remove possíveis blocos Markdown,
  // mesmo que o modelo tenha ignorado a instrução.
  limpo = limpo
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const inicio = limpo.indexOf("{");
  const fim = limpo.lastIndexOf("}");

  if (inicio === -1 || fim === -1 || fim <= inicio) {
    throw new Error("Resposta da IA não contém JSON válido.");
  }

  limpo = limpo.slice(inicio, fim + 1);

  return JSON.parse(limpo);
}


function validarMapaAIH(mapa) {

  if (!mapa || typeof mapa !== "object" || Array.isArray(mapa)) {
    throw new Error("Mapa AIH inválido.");
  }

  const resultado = {};

  for (const chave of AIH_ALLOWED_KEYS) {

    if (!Object.prototype.hasOwnProperty.call(mapa, chave)) {
      continue;
    }

    const valor = mapa[chave];

    if (
      typeof valor === "string" ||
      typeof valor === "number"
    ) {
      const texto = String(valor).trim();

      if (texto) {
        resultado[chave] = texto;
      }
    }
  }

  return resultado;
}


// ============================================================
// ROTEADOR PRINCIPAL
// ============================================================

async function rotearCamposComIA(dadosDoFormulario) {

  // Primeiro construímos o fallback.
  // Isso garante funcionamento mesmo sem IA.
  const fallback = montarMapaAIHNativo(dadosDoFormulario);


  if (!API_KEY || API_KEY === "SUA_CHAVE_AQUI") {

    console.warn(
      "MedUnity: chave Gemini não configurada. Usando roteamento nativo."
    );

    return fallback;
  }


  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;


  const body = {

    contents: [
      {
        parts: [
          {
            text: SYSTEM_PROMPT
          },
          {
            text:
              `DADOS DA FICHA-MÃE:\n${JSON.stringify(
                dadosDoFormulario,
                null,
                2
              )}`
          }
        ]
      }
    ],

    generationConfig: {
      responseMimeType: "application/json"
    }

  };


  try {

    console.log(
      "MedUnity: enviando Ficha-Mãe para roteamento Gemini..."
    );


    const response = await fetch(endpoint, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },

      body: JSON.stringify(body)

    });


    if (!response.ok) {

      const erroTexto = await response.text();

      console.error(
        "Gemini HTTP",
        response.status,
        erroTexto
      );

      console.warn(
        "MedUnity: IA indisponível. Usando roteamento nativo."
      );

      return fallback;
    }


    const result = await response.json();


    const texto =
      result
        ?.candidates?.[0]
        ?.content
        ?.parts?.[0]
        ?.text;


    if (!texto) {

      console.error(
        "Resposta Gemini sem conteúdo:",
        result
      );

      return fallback;
    }


    const mapaBruto = extrairJSON(texto);

    const mapaValidado = validarMapaAIH(mapaBruto);


    console.log(
      "MedUnity: mapa AIH produzido pela IA:",
      mapaValidado
    );


    // Se a IA não produziu nada utilizável,
    // preservamos o roteamento determinístico.
    if (!Object.keys(mapaValidado).length) {

      console.warn(
        "Gemini retornou mapa vazio. Usando fallback."
      );

      return fallback;
    }


    return mapaValidado;


  } catch (error) {

    console.error(
      "MedUnity: erro no cérebro de roteamento:",
      error
    );

    console.warn(
      "MedUnity: mantendo funcionamento determinístico."
    );

    return fallback;
  }
}


// ============================================================
// EXPOSIÇÃO GLOBAL
// ============================================================
//
// O HTML chama:
//
// typeof rotearCamposComIA === 'function'
//
// Portanto deixamos explicitamente disponível no escopo global.

window.rotearCamposComIA = rotearCamposComIA;
