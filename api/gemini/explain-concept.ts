import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Type } from "@google/genai";
import { getGeminiClient } from "../_client.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { keyword } = req.body;
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ error: "Keyword is required." });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
        temperature: 0.7
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error("Explain Concept API error:", error);
    return res.status(500).json({ error: error.message || "개념 분석 번역 도중 오류가 발생했습니다." });
  }
}
