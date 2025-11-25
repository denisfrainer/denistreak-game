// Force rebuild
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { playerStatus, npcId, message, previousContext } = await req.json();

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({
                reply: "...",
                options: ["Continuar"]
            }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        let systemInstruction = `
            REGRA SUPREMA: RESPONDA APENAS EM PORTUGUÊS DO BRASIL. NUNCA USE INGLÊS (exceto gírias específicas).
            FORMATO DE RESPOSTA: JSON
            Você deve responder SEMPRE com um objeto JSON válido neste formato:
            {
                "reply": "Sua resposta aqui (máx 140 chars)",
                "options": ["Opção 1 (Agressiva)", "Opção 2 (Amigável/Trovar)", "Opção 3 (Negócios/Profissional)"]
            }
            As opções devem ser curtas (máx 30 chars).
            
            Contexto: Jogo Cyberpunk Brasileiro.
            
            Sua Persona:
        `;

        if (npcId.includes('office')) {
            systemInstruction += `
                Você é um "Faria Limer" estressado. Use termos em inglês (budget, call, mindset, networking) APENAS como gíria no meio de frases em português. 
                Você está sempre com pressa.
                Se o player for Lobo, seja puxa-saco. Se for Rato, seja arrogante.
            `;
        } else if (npcId.includes('russian')) {
            systemInstruction += `
                Você é um "Gringo Perigoso no Brasil" (gângster russo). Fale português com erros gramaticais propositais (simulando sotaque pesado), use gírias de submundo.
                Você é ameaçador mas pragmático.
            `;
        } else {
            systemInstruction += `Você é um habitante cínico desta cidade futurista.`;
        }

        if (playerStatus === 'Wolf') {
            systemInstruction += `
                O jogador à sua frente é um LOBO (Rico, Poderoso, Veste Terno). 
                REAGIR: Seja extremamente respeitoso, interesseiro, chame de "Doutor", "Chefe", "Sócio" ou "Parceiro". Tente vender algo ou pedir investimento.
            `;
        } else {
            systemInstruction += `
                O jogador à sua frente é um RATO (Pobre, Entregador, Veste Capuz). 
                REAGIR: Trate como "Estagiário", "Entregador", "Zé Ninguém", "Invisível". Seja dismissivo, arrogante. Mande ele sair da frente ou pergunte onde está a encomenda. Não perca tempo.
            `;
        }

        systemInstruction += `\nResponda em no máximo 2 frases curtas (estilo RPG).`;

        // Construct history based on previous context if available
        const history = [
            {
                role: "user",
                parts: [{ text: `System Instruction: ${systemInstruction}` }],
            },
            {
                role: "model",
                parts: [{
                    text: JSON.stringify({
                        reply: "Entendido. Vou atuar conforme a persona e responder em JSON.",
                        options: ["Ok", "Entendi", "Vamos lá"]
                    })
                }],
            },
        ];

        if (previousContext) {
            // Add previous interaction to history to maintain continuity
            // Assuming previousContext contains the last exchange
            // For simplicity, we can just append it as context in the new message or structure it in history
            // Let's append to history if it's a structured conversation
            history.push({
                role: "model",
                parts: [{ text: JSON.stringify({ reply: previousContext.npcReply, options: [] }) }]
            });
            history.push({
                role: "user",
                parts: [{ text: `O jogador respondeu: "${message}"` }]
            });
        }

        const chat = model.startChat({
            history: history,
        });

        const userMessage = previousContext
            ? `(Continuando a conversa) O jogador escolheu: "${message}"`
            : (message || "(O jogador se aproxima em silêncio)");

        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const text = response.text();

        // Clean up text if needed (remove quotes etc) - though JSON mode should handle it
        const cleanText = text.replace(/```json|```/g, '').trim();

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse JSON from AI", cleanText);
            parsedResponse = {
                reply: cleanText,
                options: ["Continuar..."]
            }
        }

        return NextResponse.json(parsedResponse);

    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json({
            reply: "...",
            options: ["Tentar novamente"]
        }, { status: 500 });
    }
}
