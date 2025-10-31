// api/gerar-plano-estudo.js
// ** VERSÃO ATUALIZADA PARA RETORNAR JSON ESTRUTURADO COM RESPOSTAS **

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Definição do esquema JSON que queremos que a IA retorne
const schema = {
  type: "OBJECT",
  properties: {
    explicacao: {
      type: "STRING",
      description: "A explicação de 1-2 frases sobre por que os pilares são importantes para o problema."
    },
    exercicios: {
      type: "ARRAY",
      description: "Uma lista de 3 a 4 exercícios práticos.",
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
    }
  },
  required: ["explicacao", "exercicios"]
};


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // Configuração para forçar a saída em JSON
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
      // Configurações de segurança
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        // ... outras configurações de segurança ...
      ],
    });

    const { pontosFracos, problema } = req.body;

    if (!pontosFracos || pontosFracos.length === 0) {
      // Retorna no formato JSON esperado, mesmo para o caso de sucesso
      return res.status(200).json({
        explicacao: "Parabéns! Você demonstrou excelente domínio em todas as áreas. Continue assim!",
        exercicios: []
      });
    }

    const prompt = `
      Atue como um tutor especialista em Pensamento Computacional e Gestão Empresarial.
      Um aluno completou uma jornada de 12 exercícios sobre o problema: "${problema}".
      A análise final mostrou que os pontos onde ele mais errou foram os pilares:
      ${pontosFracos.join(', ')}

      Por favor, gere um "Plano de Estudo" personalizado para este aluno.
      O plano deve conter:
      1.  Uma breve explicação (1-2 frases) sobre por que esses pilares são importantes para o problema "${problema}".
      2.  3 a 4 novos exercícios práticos (múltipla escolha, complete a lacuna, ou dissertativo curto) que FORCEM o aluno a praticar especificamente esses pilares fracos.
      3.  Para cada exercício, forneça a pergunta, o tipo, as opções (se aplicável) e a resposta correta.

      Retorne estritamente no formato JSON solicitado.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // O Gemini agora retorna o texto como uma string JSON válida
    const jsonResponse = JSON.parse(response.text());

    res.status(200).json(jsonResponse); // Envia o objeto JSON diretamente

  } catch (error) {
    console.error('Erro ao chamar o Gemini (gerar-plano-estudo):', error);
    res.status(500).json({ error: 'Falha ao gerar o plano de estudo. Verifique os logs do servidor.' });
  }
}
