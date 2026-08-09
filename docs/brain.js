// brain.js - Módulo de Roteamento Inteligente do MedUnity
const API_KEY = "AQ.Ab8RN6LlyKj8ivhh-G9A8WvsRTz73LJFNrDyEbsea0G0OMhIKw"; 

async function rotearCamposComIA(dadosDoFormulario) {
  if (!API_KEY || API_KEY === "SUA_CHAVE_AQUI") {
    return dadosDoFormulario;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

 const systemPrompt = `
    Você é o roteador semântico oficial do MedUnity.
    Seu objetivo é receber os dados preenchidos na interface (baseados no Gabarito MedUnity) e mapeá-los estritamente para os códigos numéricos (CSI) do Laudo AIH do SUS Nacional.

    APLIQUE EXATAMENTE O SEGUINTE MAPEAMENTO PARA A AIH:
    - "5": Extraia o equivalente a 01.1 (Nome do paciente)
    - "6": Extraia o equivalente a 02.1 (Nº Prontuário)
    - "7": Extraia o equivalente a 01.4 (CNS)
    - "8": Extraia o equivalente a 01.5 (Data de Nascimento)
    - "9": Extraia o equivalente a 01.7 (Sexo)
    - "11": Extraia o equivalente a 01.8 (Nome da mãe)
    - "12": Extraia o equivalente a 01.11 (Telefone de contato)
    - "15": Extraia o equivalente a 01.12 (Endereço)
    - "16": Extraia o equivalente a 01.9 (Município)
    
    REGRAS DE CONCATENAÇÃO EM BLOCO (MANTENHA OS TÍTULOS E QUEBRAS DE LINHA):
    - "20": CONCATENAR todos os dados de Anamnese (do 03.1 ao 03.7) + o Exame Físico (04.2). 
    - "21": CONCATENAR os Sinais Vitais (04.1) + Exames Complementares (05.1 ao 05.3) + Avaliação Clínica/Diagnóstica (06.1 ao 06.4).

    Retorne ESTRITAMENTE um objeto JSON válido. As chaves devem ser as aspas com os números do SUS listados acima, e os valores devem ser os textos exatos e concatenados da Ficha-Mãe. Não resuma os textos originais.
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
