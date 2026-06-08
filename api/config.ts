import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function & AI Platform configuration
export const GEMINI_CONFIG = {
  // 사용자가 요청한 모델명
  MODEL_NAME: "gemini-3.1-flash-lite",
  // API timeout in milliseconds (50 seconds)
  TIMEOUT_MS: 50000,
  // Low thinking configuration budget
  THINKING_BUDGET: 0,
};

// Safe lazy-loaded GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        // 내부 타임아웃 50초 (50,000ms)로 성실히 준수
        timeout: GEMINI_CONFIG.TIMEOUT_MS,
        headers: {
          "User-Agent": "aistudio-build-vercel",
        },
      },
    });
  }
  return aiClient;
}

// Promise wrapper with a strict 50-second timeout mechanism
export async function withTimeout<T>(promise: Promise<T>, ms: number = GEMINI_CONFIG.TIMEOUT_MS): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`API request timed out dynamically after ${ms / 1000} seconds.`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// Error diagnostic helper to capture real status code and details
export function handleApiError(error: any) {
  console.error("--- Detailed Gemini API Outage Log ---");
  console.error("Name:", error?.name);
  console.error("Message:", error?.message);
  console.error("Status Code / HTTP Status:", error?.status || error?.statusCode || error?.status_code || 500);
  console.error("Stack:", error?.stack);
  console.error("Raw Error Data:", JSON.stringify(error, null, 2));
  console.error("--------------------------------------");

  const statusCode = error?.status || error?.statusCode || error?.status_code || 500;
  const rawMessage = error?.message || "Unknown error during AI generation.";
  
  return {
    statusCode,
    message: `Gemini API Error: ${rawMessage}`,
    details: error?.response?.data || error?.details || null,
  };
}

// Persona system prompts for serverless function
export const PERSONA_SYSTEM_PROMPTS: Record<string, string> = {
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
