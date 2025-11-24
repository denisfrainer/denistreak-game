const { GoogleGenerativeAI } = require("@google/generative-ai");

// Cole sua chave NOVA aqui
const API_KEY = "AIzaSyB1qDztkd6M0yRSlUAo1_LDfW6UXDCEte8";

async function checkMenu() {
    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
        // Esta função pergunta pro Google o que está disponível
        // Nota: Precisamos acessar o gerenciador de modelos do SDK
        // Se o SDK for antigo, isso pode falhar, mas vamos tentar o método direto:

        console.log("📡 Buscando lista de modelos disponíveis para sua chave...");

        // Truque: Vamos fazer um fetch manual na API de listagem para não depender do SDK
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ MODELOS DISPONÍVEIS (Copie um destes nomes):");
            console.log("------------------------------------------------");
            data.models.forEach(m => {
                // Filtra só os que geram conteúdo (chat)
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`👉 ${m.name.replace('models/', '')}`);
                }
            });
            console.log("------------------------------------------------");
        } else {
            console.error("❌ Erro ao listar:", data);
        }

    } catch (error) {
        console.error("Erro:", error);
    }
}

checkMenu();