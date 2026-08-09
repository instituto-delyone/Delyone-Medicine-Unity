// brain.js - Módulo de Roteamento Inteligente do MedUnity
const API_KEY = "AQ.Ab8RN6LlyKj8ivhh-G9A8WvsRTz73LJFNrDyEbsea0G0OMhIKw"; 

async function rotearCamposComIA(dadosDoFormulario) {
  if (!API_KEY || API_KEY === "SUA_CHAVE_AQUI") {
    console.warn("Chave de API não encontrada. Rodando modo nativo.");
    return dadosDoFormulario;
  }

  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}';

  const systemPrompt = `
    Você é o cérebro de roteamento do MedUnity.
    Sua tarefa funciona em DUAS ETAPAS. Leia os dados soltos do formulário e processe-os usando ESTRITAMENTE o Gabarito Oficial (CSI) abaixo.

    ================================================
    ETAPA 1: A "PEDRA DE ROSETA" (GABARITO CSI)
    Identifique os dados recebidos e classifique-os internamente com estes códigos exatos - os códigos referem-se aos campos de texto do site medunity:
    
    01 - IDENTIFICAÇÃO
    01.1 - Nome completo
    01.2 - Nome Social
    01.3 - CPF
    01.4 - CNS
    01.5 - Data de Nascimento
    01.6 - Idade
    01.7 - Sexo
    01.8 - Nome da mãe
    01.9 - Município
    01.11 - Telefone
    01.12 - Endereço
    
    02 - CONTEXTO ASSISTENCIAL
    02.1 - Prontuário (Nº)
    02.2 - Data de atendimento
    02.3 - Setor/Unidade
    02.4 - N° AIH
    
    03 - ANAMNESE
    03.1 - Queixa Principal
    03.2 - História da doença atual (HDA)
    03.3 - Antecedentes pessoais
    03.4 - Medicações em uso
    03.5 - Alergias
    03.6 - História familiar
    03.7 - História Social
    
    04 - EXAME FÍSICO CLÍNICO
    04.1 - Sinais Vitais
    04.2 - Exame físico
    
    05 - EXAMES COMPLEMENTARES
    05.1 - Exames laboratoriais
    05.2 - Imagem/outros complementares
    05.3 - Outros resultados/documentos
    
    06 - AVALIAÇÃO CLÍNICA
    06.1 - Hipótese diagnóstica
    06.2 - CID-10
    06.3 - DDX diferenciais
    06.4 - Impressão/avaliação clínica
    
    07 - PLANO TERAPÊUTICO / CONDUTA
    07.1 - Plano terapêutico/conduta
    
    08 - PROFISSIONAL RESPONSÁVEL
    08.1 - Médico responsável
    08.2 - CRM/UF
    ================================================

    ETAPA 2: ROTEAMENTO PARA TEMPLATE_SUS_Laudo_Solicitacao_AIH_Internacao_Hospitalar.pdf (SAÍDA FINAL)
    Agora que você classificou os dados, gere um objeto JSON roteando os códigos CSI para as chaves numéricas exclusivas da AIH, exatamente assim:
    (exemplo: o campo 5 do TEMPLATE_SUS_Laudo_Solicitacao_AIH_Internacao_Hospitalar chama nome do paciente e vai ser preenchido conforme o texto inserido em "nome completo" "01.1" no medunity) 
    - "5": 01.1
    - "6": 02.1
    - "7": 01.4
    - "8": 01.5
    - "9": 01.7
    - "11": 01.8
    - "12": 01.11
    - "15": 01.12
    - "16": 01.9
    
    - "20": CONCATENAR (03.1 até 03.7) + 04.2. Formate com quebras de linha entre cada item.
    - "21": CONCATENAR 04.1 + (05.1 até 05.3) + (06.1 até 06.4). Formate com quebras de linha.
    
    - "23": 06.1
    - "24": 06.2
    - "33": 08.1

    Retorne APENAS o JSON final mapeado com as chaves numéricas da AIH ("5", "6", "20", etc). Não retorne os códigos CSI nas chaves do JSON final, use-os apenas como sua regra mental de tradução.
  `;

  const body = {
    contents: [{
      parts: [
        { text: systemPrompt },
        { text: 'Dados brutos do formulário: ${JSON.stringify(dadosDoFormulario)}' }
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
      console.error("Erro na API, usando fallback nativo.");
      return dadosDoFormulario;
    }

    const result = await response.json();
    const textoLimpo = result.candidates[0].content.parts[0].text;
    
    const dadosMapeados = JSON.parse(textoLimpo);
    // Mescla para não perder campos nativos
    return { ...dadosDoFormulario, ...dadosMapeados };

  } catch (error) {
    console.error("Erro no processamento cerebral:", error);
    return dadosDoFormulario; 
  }
}
