// brain.js - Módulo de Roteamento Inteligente do MedUnity
const API_KEY = "AQ.Ab8RN6LlyKj8ivhh-G9A8WvsRTz73LJFNrDyEbsea0G0OMhIKw"; 

async function rotearCamposComIA(dadosDoFormulario) {
  if (!API_KEY || API_KEY === "SUA_CHAVE_AQUI") {
    return dadosDoFormulario;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const systemPrompt = `
    Você é o maestro de roteamento semântico do MedUnity.
    Receba os textos preenchidos nos campos da interface e associe cada trecho ao seu código numérico oficial do SUS (CSI):
    - "5": Nome do paciente
    - "7": CNS
    - "20": Sinais, sintomas, anamnese e HDA
    - "21": Condições que justificam a internação
    - "23": Hipótese diagnóstica
    - "24": CID-10

    Retorne ESTRITAMENTE um JSON com as chaves numéricas e o texto EXATO recebido. Não resuma, não mude termos médicos.
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
