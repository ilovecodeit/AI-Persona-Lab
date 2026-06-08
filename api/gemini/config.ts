import { GoogleGenAI } from "@google/genai";

export const GEMINI_CONFIG = {
  MODEL: "gemini-flash-lite-latest",
  TIMEOUT_MS: 50000, // 50 seconds
};

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
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Wraps a promise with a 50-second timeout.
 * Rejects if the main promise doesn't resolve within the timeout period.
 */
export function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`API request timed out locally after ${GEMINI_CONFIG.TIMEOUT_MS / 1000} seconds`));
    }, GEMINI_CONFIG.TIMEOUT_MS);
    if (timer.unref) {
      timer.unref();
    }
  });

  return Promise.race([
    promise.then((result) => {
      clearTimeout(timer);
      return result;
    }),
    timeoutPromise,
  ]);
}
