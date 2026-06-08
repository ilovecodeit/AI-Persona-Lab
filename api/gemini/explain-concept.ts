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
    const { keyword } = req.body;
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ error: "Keyword is required." });
    }

    const ai = getGeminiClient();

    // Structuring standard multidimensional descriptions matching the frontend
    const task = ai.models.generateContent({
      model: GEMINI_CONFIG.MODEL_NAME,
      contents: `개념 '${keyword}'을 아동용(5세), SNS 인플루언서 패러디용, 학자용 전문 에세이 3가지 스타일로 깊이 있게 설명해 주세요.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING },
            childStyle: { type: Type.STRING, description: "5세 아동의 눈높이에 맞춰 친근한 구어체와 일상적인 사물의 흥미진진한 비유를 동원해 아주 쉽게 설명한 한국어 글." },
            snsStyle: { type: Type.STRING, description: "MZ 세대 인플루언서 블로그나 트위터 연재처럼 위트가 가득하고, 이모지(Emoji)와 트렌디한 해시태그를 폭풍 첨부하며 가독성 좋고 경쾌하게 설명한 한국어 글." },
            academicStyle: { type: Type.STRING, description: "교수급 전문 학술 저널 초록 에세이처럼 철학적 함의, 엄밀한 원리, 고도의 지식을 담아 진지하고 전문적으로 명교하게 요약한 지적인 한국어 설명." }
          },
          required: ["keyword", "childStyle", "snsStyle", "academicStyle"]
        },
        temperature: 0.7,
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
