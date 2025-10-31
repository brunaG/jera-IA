// api/gerar-mais-exercicios.js
// ** NOVO ARQUIVO DE API PARA GERAR MAIS EXERCÍCIOS SOB DEMANDA **

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Esquema JSON apenas para a lista de exercícios
const schemaExercicios = {
  type: "ARRAY",
  description: "Uma lista de 2 a 3 novos exercícios práticos.",
  items: {
    type: "OBJECT",
    properties: {
      pergunta: {
        type: "STRING",
        description: "O enunciado claro e direto do exercício."
      },
      tipo: {
        type: "STRING",
        description: "O tipo de exercício, por exemplo: 'multipla_escolha', 'complete_lacuna' ou 'dissertativo_curto'."
      },
      opcoes: {
        type: "ARRAY",
        description: "Uma lista de opções de resposta (apenas para tipo 'multipla_escolha').",
        items: { type: "STRING" },
        nullable: true
      },
      resposta_correta: {
        type: "STRING",
        description: "A resposta correta e completa para o exercício. Se for múltipla escolha, repita o texto da opção correta."
      }
    },
    required: ["pergunta", "tipo", "resposta_correta"]
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schemaExercicios, // Usa o esquema de array de exercícios
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Recebe os mesmos parâmetros para manter o contexto
    const { pontosFracos, problema } = req.body;

    if (!pontosFracos || pontosFracos.length === 0) {
      return res.status(200).json([]); // Retorna array vazio
    }

    const prompt = `
      Atue como um tutor especialista em Pensamento Computacional e Gestão Empresarial.
      Um aluno está pedindo MAIS exercícios sobre o problema: "${problema}".
      Seus pontos fracos são: ${pontosFracos.join(', ')}

      Por favor, gere 2 ou 3 NOVOS exercícios práticos (diferentes dos anteriores)
      que reforcem especificamente esses pilares fracos.

      Para cada exercício, forneça a pergunta, o tipo, as opções (se aplicável) e a resposta correta.

      Retorne estritamente no formato JSON solicitado (um array de exercícios).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const jsonResponse = JSON.parse(response.text());

    res.status(200).json(jsonResponse); // Envia o array de exercícios

  } catch (error) {
    console.error('Erro ao chamar o Gemini (gerar-mais-exercicios):', error);
    res.status(500).json({ error: 'Falha ao gerar mais exercícios. Verifique os logs do servidor.' });
  }
}
