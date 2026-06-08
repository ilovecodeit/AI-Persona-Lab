import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Type } from "@google/genai";
import { getGeminiClient, runWithRetry, GEMINI_MODEL_NAME } from "../config";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. POST Method 검증
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are supported." });
  }

  // 2. 요청 인자 검증
  const { genre, subject, mood } = req.body || {};
  if (!genre || !subject || !mood) {
    console.error("[Creative Co-writer] Missing query parameter(s). Body:", req.body);
    return res.status(400).json({ error: "genre, subject, and mood parameters are all required." });
  }

  // 3. 프롬프트 세부 구성
  const prompt = `장르: ${genre}
핵심 소재/조건: ${subject}
작품 전체의 무드: ${mood}

위 조건들을 바탕으로 깊고 매력적인 시놉시스, 캐릭터 설정, 그리고 극의 시작을 알리는 명오프닝 장면에 대한 지시문과 대사 대본을 전문 스토리 작가처럼 작성해 주세요.`;

  try {
    const ai = getGeminiClient();

    console.log(`[Creative Co-writer API] Generating narrative block with model [${GEMINI_MODEL_NAME}] for theme '${subject}'`);

    // 4. 재시도 및 타임아웃 래퍼 실행
    const response = await runWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
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
          temperature: 0.8
        }
      })
    );

    // 5. 파싱 완료 및 송출
    const resultJson = JSON.parse(response.text || "{}");
    console.log(`[Creative Co-writer API] Story creation for '${resultJson.title}' successfully completed.`);

    return res.status(200).json(resultJson);

  } catch (error: any) {
    // 6. 에러 추적 및 원격 로그 작성
    const statusCode = error?.status || error?.statusCode || 500;
    const errorMessage = error?.message || "Internal network error during structured narrative creation.";
    const errorDetails = error?.response?.data || error?.details || null;

    console.error("[Creative Co-writer API Failure Details] ---");
    console.error(`HTTP Status Code: ${statusCode}`);
    console.error(`Error Message: ${errorMessage}`);
    if (errorDetails) {
      console.error(`Details:`, JSON.stringify(errorDetails));
    }
    console.error("--------------------------------------------");

    return res.status(statusCode).json({
      error: "공동 창작 스토리 빌딩 도중 오류가 발생했습니다.",
      reason: errorMessage,
      details: errorDetails,
      statusCode
    });
  }
}
