// api/gerar-plano-estudo.js

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

    if (!pontosFracos || pontosFracos.length === 0) {
      return res.status(200).json({
        explicacao: "Parabéns! Você demonstrou excelente domínio em todas as áreas. Continue praticando para manter suas habilidades afiadas!",
        exercicios: []
      });
    }

    // Define o esquema de resposta JSON que queremos da IA
    const schema = {
      type: "OBJECT",
      properties: {
        explicacao: {
          type: "STRING",
          description: "Uma breve explicação (2-3 frases) sobre por que esses pilares são importantes para o problema específico do aluno. Deve ser motivacional."
        },
        exercicios: {
          type: "ARRAY",
          description: "Uma lista de 3 novos exercícios práticos focados nos pontos fracos.",
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
        }
      },
      required: ["explicacao", "exercicios"]
    };

    const prompt = `
      Atue como um tutor especialista em Pensamento Computacional e Gestão Empresarial.
      Um aluno completou uma jornada de 12 exercícios sobre o problema: "${problema}".
      A análise final mostrou que os pontos onde ele mais errou foram os pilares: ${pontosFracos.join(', ')}.

      Gere um "Plano de Estudo" personalizado para este aluno focado nesses pontos fracos.
      O plano deve conter:
      1.  Uma breve explicação motivacional (2-3 frases) sobre por que esses pilares são importantes para o problema "${problema}".
      2.  Exatamente 3 novos exercícios práticos (múltipla escolha ou complete a lacuna) que FORCEM o aluno a praticar especificamente esses pilares fracos.

      Formate a resposta EXATAMENTE de acordo com o esquema JSON fornecido.
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

    // Converte a string JSON em um objeto JavaScript real
    const jsonObject = JSON.parse(jsonText);

    // Envia o objeto JSON de volta para o frontend
    res.status(200).json(jsonObject);

  } catch (error) {
    console.error('Erro ao chamar o Gemini:', error);
    res.status(500).json({
        explicacao: "Ocorreu um erro ao gerar seu plano de estudo. Tente novamente.",
        exercicios: []
    });
  }
}
