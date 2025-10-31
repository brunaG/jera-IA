// api/gerar-mais-exercicios.js

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // MODIFICADO: Usando o modelo recomendado e estável
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

    const { pontosFracos, problema } = req.body;

    // Se não houver pontos fracos, não há o que gerar.
    if (!pontosFracos || pontosFracos.length === 0) {
      return res.status(200).json([]); // Retorna um array vazio
    }

    // Define o esquema de resposta JSON que queremos da IA
    // Desta vez, queremos um ARRAY de exercícios
    const schema = {
      type: "ARRAY",
      description: "Uma lista de 2 novos exercícios práticos focados nos pontos fracos.",
      items: {
        type: "OBJECT",
        properties: {
          pergunta: {
            type: "STRING",
            description: "O enunciado claro e direto do exercício."
          },
          tipo: {
            type: "STRING",
            enum: ["multipla_escolha", "complete_a_lacuna"],
            description: "O tipo de exercício."
          },
          opcoes: {
            type: "ARRAY",
            description: "Uma lista de 3-4 opções de resposta. Obrigatório se o tipo for 'multipla_escolha'.",
            items: { type: "STRING" }
          },
          resposta_correta: {
            type: "STRING",
            description: "A resposta correta para o exercício. Se for múltipla escolha, deve ser o texto exato de uma das opções."
          }
        },
        required: ["pergunta", "tipo", "resposta_correta"]
      }
    };

    const prompt = `
      Atue como um tutor especialista em Pensamento Computacional e Gestão Empresarial.
      Um aluno que está estudando o problema "${problema}" pediu MAIS exercícios para praticar seus pontos fracos, que são: ${pontosFracos.join(', ')}.

      Gere exatamente 2 novos exercícios práticos (diferentes dos anteriores) focados nesses pilares.

      Formate a resposta EXATAMENTE de acordo com o esquema JSON fornecido (um array de exercícios).
    `;

    // Configuração para forçar a saída JSON
    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: schema,
    };

    // CORRIGIDO: O prompt e o generationConfig devem estar em um único objeto
    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: generationConfig
    };

    // Gera o conteúdo
    const result = await model.generateContent(requestPayload);
    const response = await result.response;

    // Extrai o texto (que deve ser uma string JSON)
    const jsonText = response.text();

    // Converte a string JSON em um objeto JavaScript real (um array)
    const jsonObject = JSON.parse(jsonText);

    // Envia o objeto JSON (array) de volta para o frontend
    res.status(200).json(jsonObject);

  } catch (error) {
    console.error('Erro ao chamar o Gemini (gerar-mais-exercicios):', error);
    // Retorna um array vazio em caso de erro
    res.status(500).json([]);
  }
}
