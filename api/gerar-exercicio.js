// Importa a biblioteca do Google
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Este é o "handler" da função serverless
// Todo request para /api/gerar-exercicio vai executar isso
export default async function handler(req, res) {
  // 1. VERIFICAÇÃO DE SEGURANÇA
  // Só permite que o método POST (envio de dados) seja usado
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // 2. PEGANDO A API KEY (DE FORMA SEGURA)
    // A chave virá das "Environment Variables" da Vercel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. PEGANDO O DADO DO FRONTEND
    // Pega o texto do exercício que seu HTML enviou
    const { exercicioErrado } = req.body;

    if (!exercicioErrado) {
      return res.status(400).json({ error: 'Nenhum exercício fornecido' });
    }

    // 4. O PROMPT (SEU COMANDO PARA O GEMINI)
    // Aqui você dá as instruções para a IA
    const prompt = `
      Um aluno errou o seguinte exercício de programação (ou outro tópico):
      "${exercicioErrado}"

      Por favor, gere 3 novos exercícios práticos, com dificuldade similar,
      para ajudar o aluno a praticar e entender o conceito que ele errou.
      Os exercícios devem ser claros e diretos.
    `;

    // 5. CHAMANDO A API DO GEMINI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. ENVIANDO A RESPOSTA DE VOLTA PARA O HTML
    // O 'text' contém os novos exercícios gerados
    res.status(200).json({ novosExercicios: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Falha ao gerar exercícios' });
  }
}
