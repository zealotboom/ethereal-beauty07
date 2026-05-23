import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
export const geminiVision = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export const geminiEmbedding = genAI.getGenerativeModel({ model: "embedding-001" });

export function hasGeminiEnv() {
  return Boolean(process.env.GEMINI_API_KEY);
}
