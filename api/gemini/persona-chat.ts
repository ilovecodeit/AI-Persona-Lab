export const config = { maxDuration: 60 };

import { getGeminiClient, GEMINI_CONFIG, PERSONA_SYSTEM_PROMPTS, handleError } from "../_config";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
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

    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_CONFIG.MODEL_NAME,
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
    const parsedErr = handleError(error, "PersonaChatServerless");
    return res.status(parsedErr.statusCode).json(parsedErr.body);
  }
}
