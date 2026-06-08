export const config = { maxDuration: 60 };

import { Type } from "@google/genai";
import { getGeminiClient, withTimeout, handleApiError, GEMINI_CONFIG } from "../config";

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
    const { genre, subject, mood } = req.body;
    if (!genre || !subject || !mood) {
      return res.status(400).json({ error: "genre, subject, and mood are required variables." });
    }

    const ai = getGeminiClient();

    const prompt = `장르: ${genre}
핵심 소재/조건: ${subject}
작품 전체의 무드: ${mood}

위 조건들을 바탕으로 깊고 매력적인 시놉시스, 캐릭터 설정, 그리고 극의 시작을 알리는 명오프닝 장면에 대한 지시문과 대사 대본을 전문 스토리 작가처럼 작성해 주세요.`;

    // Connect to AI platform requesting structured response payload
    const task = ai.models.generateContent({
      model: GEMINI_CONFIG.MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "이 서사에 걸맞는 영감 넘치고 참신한 제목" },
            synopsis: { type: Type.STRING, description: "스토리의 깊이가 느껴지는 소설/영화 급 백그라운드와 위기의 순간을 다룬 흥미 깊은 시놉시스 (3-4문장)" },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "개성 넘치는 캐릭터의 이름" },
                  role: { type: Type.STRING, description: "이야기 속 극적인 역할 (예: 비밀을 숨긴 우주선 기술자)" },
                  description: { type: Type.STRING, description: "인물의 성향, 내면적 슬픔이나 원동력, 외모 묘사" }
                },
                required: ["name", "role", "description"]
              }
            },
            openingScene: { type: Type.STRING, description: "연출 지시선(대괄호 처리 [])과 대사를 긴밀하게 뿜어내어 현장의 숨막히는 분위기를 그대로 재현한 감각적인 오프닝 시나리오 대본 (한글)" },
            keyThemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "이 작품 저변에 흐르는 철학적 테마 키워드 2-3가지"
            }
          },
          required: ["title", "synopsis", "characters", "openingScene", "keyThemes"]
        },
        temperature: 0.8,
        // Low thinking level configuration
        thinkingConfig: {
          thinkingBudget: GEMINI_CONFIG.THINKING_BUDGET
        }
      }
    });

    // Enforce 50-second API internal timeout
    const response = await withTimeout(task, GEMINI_CONFIG.TIMEOUT_MS);
    
    // Parse the structured text from the response safely
    const parsedData = JSON.parse(response.text || "{}");
    return res.status(200).json(parsedData);

  } catch (error: any) {
    // Log the actual error code and details without swallowing them
    const diagnostic = handleApiError(error);
    return res.status(diagnostic.statusCode).json({
      error: diagnostic.message,
      details: diagnostic.details
    });
  }
}
