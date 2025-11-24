import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { playerStatus, npcId, message } = await req.json();

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ reply: "..." }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let systemPrompt = "";

        if (npcId === 'office_guy') {
            systemPrompt = `You are an overworked, stressed office worker in a chaotic city.
            You use corporate jargon like "ASAP", "Job", "Deadline", "Synergy".
            You are always in a rush.
            Current context: The player is a "${playerStatus}".
            If the player is a "Wolf" (wearing a suit), you are subservient, polite, and try to network or ask for a promotion. You respect them.
            If the player is a "Rat" (casual/poor), you are dismissive, rude, and ignore them or tell them to get out of your way.
            Keep your response short (max 2 sentences).
            Reply directly to the player's presence or message.`;
        } else if (['boris', 'vlad', 'dimitri'].includes(npcId)) {
            systemPrompt = `You are a member of a tough Russian street gang in a cyberpunk city.
            You speak with a heavy accent (write it out phonetically sometimes, like "Vhat", "Zis", "Comrade").
            You are aggressive and suspicious.
            Current context: The player is a "${playerStatus}".
            If the player is a "Wolf" (wearing a suit), you respect their power but challenge them. You might offer "dirty work" or ask if they want to do business.
            If the player is a "Rat" (casual/poor), you bully them, threaten them, or tell them to get lost before they get hurt.
            Keep your response short (max 2 sentences).
            Reply directly to the player's presence or message.`;
        } else {
            // Fallback generic NPC
            systemPrompt = `You are a random citizen in a cyberpunk city.
            Current context: The player is a "${playerStatus}".
            Keep your response short (max 1 sentence).`;
        }

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `System Instruction: ${systemPrompt}` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I will act according to this persona." }],
                },
            ],
        });

        const result = await chat.sendMessage(message || "(Player approaches silently)");
        const response = result.response;
        const text = response.text();

        // Clean up text if needed (remove quotes etc)
        const cleanText = text.replace(/^["']|["']$/g, '').trim();

        return NextResponse.json({ reply: cleanText });

    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json({ reply: "..." }, { status: 500 });
    }
}
