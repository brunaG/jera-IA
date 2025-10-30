// list-models-test.js (modificado para testar getGenerativeModel)
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

async function testModelAccess() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Erro: GEMINI_API_KEY não encontrada.");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    console.log("Tentando obter o modelo 'gemini-pro'...");

    // Tenta obter um modelo específico diretamente
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Usando um nome comum

    console.log("Modelo 'gemini-pro' obtido com sucesso!");

    // Tenta fazer uma chamada simples (contar tokens)
    console.log("Tentando contar tokens...");
    const result = await model.countTokens("Olá, mundo!");
    console.log("Contagem de tokens bem-sucedida:", result);
    console.log("----------------------------------------");
    console.log("✅ Acesso básico ao modelo 'gemini-pro' e contagem de tokens funcionaram!");
    console.log("   -> Isso sugere que a chave de API é válida e a biblioteca está minimamente funcional.");
    console.log("   -> O problema parece ser específico com a função listModels() na sua instalação/versão.");
    console.log("----------------------------------------");


  } catch (error) {
    console.error("----------------------------------------");
    console.error("❌ Erro ao tentar acessar/usar o modelo 'gemini-pro':", error);
    console.error("   -> Verifique se o nome 'gemini-pro' está correto ou se há um problema com a chave/API.");
    console.error("----------------------------------------");
  }
}

testModelAccess();
