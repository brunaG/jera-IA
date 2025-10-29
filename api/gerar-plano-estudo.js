// api/gerar-plano-estudo.js

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ----- CORREÇÃO APLICADA AQUI -----
    // Use "gemini-1.5-flash" sem o "-latest"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // ----- FIM DA CORREÇÃO -----

    const { pontosFracos, problema } = req.body;

    if (!pontosFracos || pontosFracos.length === 0) {
      return res.status(200).json({
        planoDeEstudo: "Parabéns! Você demonstrou excelente domínio em todas as áreas. Continue assim!"
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
      2.  3 a 4 novos exercícios práticos (múltipla escolha ou complete a lacuna) que FORCEM o aluno a praticar especificamente esses pilares fracos.
      Formate a resposta de forma clara, usando quebras de linha (\n), asteriscos (*) para listas e negrito (**).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ planoDeEstudo: text });

  } catch (error) {
    // Manter o log detalhado no servidor é importante
    console.error('Erro ao chamar o Gemini:', error);
    // Enviar uma mensagem genérica para o frontend
    res.status(500).json({ error: 'Falha ao gerar o plano de estudo. Verifique os logs do servidor.' });
  }
}
