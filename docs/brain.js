// brain.js - Módulo de Roteamento Inteligente do MedUnity
const API_KEY = "SUA_CHAVE_AQUI"; // Certifique-se de ser a chave gerada no 'Get API Key' do AI Studio (inicia com AIzaSy...)

async function rotearCamposComIA(dadosDoFormulario) {
  if (!API_KEY || API_KEY.includes("SUA_CHAVE")) {
    console.warn("Chave de API do Gemini não configurada no brain.js. Usando modo nativo.");
    return dadosDoFormulario;
  }

  // Usando endpoint atualizado do Gemini Flash
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

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
    
    if (!response.ok) {
      console.error(`Erro na API do Gemini (Status ${response.status}). Prosseguindo em modo nativo.`);
      return dadosDoFormulario;
    }

    const result = await response.json();
    const rawText = result.candidates[0].content.parts[0].text;
    return JSON.parse(rawText);
  } catch (error) {
    console.error("Erro ao conectar com o cérebro do Google:", error);
    return dadosDoFormulario; 
  }
}

