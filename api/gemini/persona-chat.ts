import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiClient, PERSONA_SYSTEM_PROMPTS } from "../_client.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { personaId, messages } = req.body;
    if (!personaId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid personaId or messages parameter." });
    }

    const systemPrompt = PERSONA_SYSTEM_PROMPTS[personaId];
    if (!systemPrompt) {
      return res.status(400).json({ error: "Unsupported persona selected." });
    }

    const ai = getGeminiClient();

    // Setup Chat history format conforming to Gemini Schema
    // We pass the conversation context while injecting the system prompt
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.9,
        topP: 0.95
      }
    });

    return res.status(200).json({
      content: response.text || "죄송합니다, 잠시 생각을 정리하는 중입니다.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Persona Chat API error:", error);
    return res.status(500).json({ error: error.message || "Gemini API 호출에 실패하였습니다." });
  }
}
