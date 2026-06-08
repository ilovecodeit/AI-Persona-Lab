import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiClient, runWithRetry, PERSONA_SYSTEM_PROMPTS, GEMINI_MODEL_NAME } from "../config";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS 및 Method 검증
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are supported." });
  }

  // 2. 요청 파라미터 유효성 검증
  const { personaId, messages } = req.body || {};
  if (!personaId || !messages || !Array.isArray(messages)) {
    console.error(`[Persona Chat] Invalid Request Body:`, req.body);
    return res.status(400).json({ error: "Invalid personaId or messages parameter inside request body." });
  }

  // 3. 페르소나 대응 프롬프트 체크
  const systemPrompt = PERSONA_SYSTEM_PROMPTS[personaId];
  if (!systemPrompt) {
    console.error(`[Persona Chat] Unsupported personaId requested: ${personaId}`);
    return res.status(400).json({ error: `The chosen persona '${personaId}' is not supported.` });
  }

  try {
    const ai = getGeminiClient();

    // 4. Gemini 입출력 구조화 포맷팅
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // 5. 안정 재시도 및 타임아웃 통합 래퍼 실행
    console.log(`[Persona Chat API] Starting content generation for persona '${personaId}' with model [${GEMINI_MODEL_NAME}]`);
    
    const response = await runWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.9,
          topP: 0.95
        }
      })
    );

    console.log(`[Persona Chat API] Successfully generated respond text.`);
    
    // 6. 정상 응답 전달
    return res.status(200).json({
      content: response.text || "죄송합니다, 잠시 생각을 정리하는 중입니다.",
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    // 7. 상세한 실패 진단 및 에러 원인 응답 생성
    const statusCode = error?.status || error?.statusCode || 500;
    const errorMessage = error?.message || "Internal error during Gemini request generation.";
    const errorDetails = error?.response?.data || error?.details || null;

    console.error("[Persona Chat API Failure Details] ---");
    console.error(`HTTP Status Code: ${statusCode}`);
    console.error(`Error Message: ${errorMessage}`);
    if (errorDetails) {
      console.error(`Details:`, JSON.stringify(errorDetails));
    }
    console.error("--------------------------------------");

    return res.status(statusCode).json({
      error: "Gemini API 호출에 실패하였습니다.",
      reason: errorMessage,
      details: errorDetails,
      statusCode
    });
  }
}
