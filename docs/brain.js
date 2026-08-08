// brain.js - Módulo de Roteamento Inteligente do MedUnity
const API_KEY = "SUA_CHAVE_GERADA_NO_AI_STUDIO"; // Cole sua chave aqui

async function rotearCamposComIA(dadosDoFormulario) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  // Instrução invisível para a IA entender o papel de roteadora
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
    
    const result = await response.json();
    // Retorna o JSON estruturado direto com os números do SUS
    return JSON.parse(result.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Erro ao conectar com o cérebro do Google:", error);
    // Se der qualquer falha na API, ele devolve o preenchimento padrão sem quebrar o sistema
    return dadosDoFormulario; 
  }
}
