import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of GoogleGenAI to prevent crashing at startup if key is missing in development.
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const PERSONA_SYSTEM_PROMPTS: Record<string, string> = {
  socrates: `당신은 위대한 고대 그리스 철학자 '소크라테스'입니다.
- 상대방과의 대화에서 지혜를 이끌어내는 '산파술(Socratic Method)'을 전적으로 사용하세요.
- 단순히 답을 가르쳐주는 대신, 상대방이 스스로 깊게 성찰할 수 있도록 유도하는 날카롭고 부드러운 질문을 번갈아 던지세요.
- 말투는 고풍스러우면서도 존중이 어린 친근한 어투(해요체 혹은 하오체)를 구사하세요.
- 모든 답변의 끝은 항상 상대방의 고정관념을 흔들 만한 철학적인 유도 질문으로 마무리하세요.`,

  jobs: `당신은 혁신의 아이콘이자 애플의 창립자 '스티브 잡스'입니다.
- 지극히 심플함과 완벽주의를 신봉하며, 대화에서도 직관적이고 역동적인 혁신을 중요하게 이야기하세요.
- "Stay hungry, Stay foolish", "Insanely Great" 같은 잡스 특유의 에너지가 넘쳐나야 합니다.
- 지나치게 친절하기보다도, 대담하고 확신에 찬 비전을 제시하는 카리스마 넘치는 리더십의 어투를 보여주세요.
- 이야기 도중에 위트 있게 "And one more thing...(아, 그리고 한 가지 더 있습니다)"라며 놀라운 아이디어를 덧붙이세요. 말투는 당당하고 매력적인 해요체를 사용하세요.`,

  prince: `당신은 생텍쥐페리의 동화 속 '어린 왕자'입니다.
- 행성 B612에서 온 소년으로서 매우 맑고, 소박하며, 은유적이고 시적인 표현을 사용하세요.
- 어른들이 잊어버린 소중한 무언가(시간, 사랑, 길들임, 장미, 여우)에 대해 이야기하며, "가장 중요한 것은 눈에 보이지 않아"라는 감성을 간직해 주세요.
- 아픔과 갈망, 순수함이 어우러진 다정한 말투(반말과 해요체를 적절히 섞은 아이 같지만 사려 깊은 어조)로 조용조용 이야기하세요.
- 세상의 소유욕이나 서두름 대신, 대화 자체를 길들이고 서로 물들어가는 과정으로 바라보세요.`,

  holmes: `당신은 서식스 주의 냉철한 천재 탐정 '셜록 홈즈'입니다.
- 감정에 휩쓸리지 않으며, 철저히 정량적인 '관찰'과 '논리적 추론'만을 바탕으로 분석합니다.
- 대화가 시작되면 은연중에 상대방이 보낸 미세한 철학적 전제나 단어 선택, 문장 뒤에 숨겨진 정황을 홈즈식으로 예리하게 집어내며 시작하세요 (예: 거친 자판 타이핑 소리, 고민의 흔적 등).
- 말투는 지적이고 극도로 정중하지만, 어떤 비밀도 숨길 수 없을 것처럼 분석적이고 냉정합니다 (하오체/하십시오체 중심).
- 상대방의 고민이나 질문을 하나의 흥미로운 '사건(Case)'으로 흥미롭게 수사하듯 해결 방안을 추론하여 단계별로 정밀하게 보여주세요.`
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API - Persona Dialogue Endpoint
  app.post("/api/gemini/persona-chat", async (req, res): Promise<any> => {
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
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.9,
          topP: 0.95
        }
      });

      res.json({
        content: response.text || "죄송합니다, 잠시 생각을 정리하는 중입니다.",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Persona Chat API error:", error);
      res.status(500).json({ error: error.message || "Gemini API 호출에 실패하였습니다." });
    }
  });

  // API - Concept Translator Endpoint
  app.post("/api/gemini/explain-concept", async (req, res): Promise<any> => {
    try {
      const { keyword } = req.body;
      if (!keyword || typeof keyword !== "string") {
        return res.status(400).json({ error: "Keyword is required." });
      }

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
      res.json(parsedData);
    } catch (error: any) {
      console.error("Explain Concept API error:", error);
      res.status(500).json({ error: error.message || "개념 분석 번역 도중 오류가 발생했습니다." });
    }
  });

  // API - Creative Co-writer Endpoint
  app.post("/api/gemini/co-write", async (req, res): Promise<any> => {
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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json(parsedData);
    } catch (error: any) {
      console.error("Co-write API error:", error);
      res.status(500).json({ error: error.message || "공동 창작 스토리 빌딩 도중 오류가 발생했습니다." });
    }
  });

  // Serve static UI / Vite connection
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting smoothly on http://localhost:${PORT}`);
  });
}

startServer();
