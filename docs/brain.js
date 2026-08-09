// brain.js - Módulo de Roteamento Inteligente do MedUnity
const API_KEY = "AQ.Ab8RN6LlyKj8ivhh-G9A8WvsRTz73LJFNrDyEbsea0G0OMhIKw"; 

async function rotearCamposComIA(dadosDoFormulario) {
  if (!API_KEY || API_KEY === "SUA_CHAVE_AQUI") {
    return dadosDoFormulario;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

 const systemPrompt = `
    Você é o maestro de roteamento semântico do MedUnity.
    Receba os textos preenchidos nos campos da interface e associe cada trecho ao seu código numérico oficial do SUS (CSI).

    REGRA DE ROTEAMENTO CONDICIONAL (Apenas para laudos AIH):
    Se os dados indicarem que o documento é uma AIH, estruture a chave "20" unindo APENAS a Queixa Principal (QPD) e a História da Doença Atual (HDA/Anamnese). 
    Você deve formatar o texto exatamente assim, colocando um abaixo do outro e mantendo os títulos:
    Queixa principal: [insira o texto aqui]
    
    Anamnese: [insira o texto aqui]

    * Importante: NÃO inclua o Exame Físico nesta chave. 
    * Se o documento NÃO for uma AIH, ignore a regra acima e mapeie os campos normalmente.

    MAPEAMENTO PADRÃO:
    - "5": Nome do paciente
    - "7": CNS
    - "21": Condições que justificam a internação
    - "23": Hipótese diagnóstica
    - "24": CID-10

    Retorne ESTRITAMENTE um JSON válido onde as chaves são os números. Não resuma nem altere as palavras médicas originais.
  `;

  const body = {
    contents: [{
      parts: [
        { text: systemPrompt },
        { text: `Dados preenchidos na tela: ${JSON.stringify(dadosDoFormulario)}` }
      ]
    }],
    generationConfig: { responseMimeType: "application/json" }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) return dadosDoFormulario;

    const result = await response.json();
    return JSON.parse(result.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Modo nativo ativo:", error);
    return dadosDoFormulario; 
  }
}
