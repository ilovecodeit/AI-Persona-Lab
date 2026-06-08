export const config = { maxDuration: 60 };

import { getGeminiClient, withTimeout, handleApiError, PERSONA_SYSTEM_PROMPTS, GEMINI_CONFIG } from "../config";

export default async function handler(req: any, res: any) {
  // CORS header setup for flexibility
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Only POST supported." });
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

    // Map message history into standard Gemini dialogue roles
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // Generate output with specific model name and low thinking configuration
    const task = ai.models.generateContent({
      model: GEMINI_CONFIG.MODEL_NAME,
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.9,
        topP: 0.95,
        // Low thinking level configuration
        thinkingConfig: {
          thinkingBudget: GEMINI_CONFIG.THINKING_BUDGET
        }
      }
    });

    // Enforce 50-second API internal timeout
    const response = await withTimeout(task, GEMINI_CONFIG.TIMEOUT_MS);

    return res.status(200).json({
      content: response.text || "죄송합니다, 잠시 생각을 정리하는 중입니다.",
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    // Log the actual error code and details without swallowing them
    const diagnostic = handleApiError(error);
    return res.status(diagnostic.statusCode).json({
      error: diagnostic.message,
      details: diagnostic.details
    });
  }
}
