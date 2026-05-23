import { NextRequest, NextResponse } from "next/server";
import { geminiVision, hasGeminiEnv } from "@/lib/gemini";
import { parseJsonResponse } from "@/lib/utils";
import { checkAiRateLimit } from "@/lib/rate-limit";
import type { StyleProfile } from "@/lib/types";

const fallback: StyleProfile = {
  bodyType: "average",
  skinTone: "neutral medium",
  skinUndertone: "neutral",
  recommendedFits: ["structured shoulders", "tapered", "relaxed drape"],
  recommendedColors: ["#C9A84C", "#1E2A37", "#6E1F2F", "#F0EDE6", "#080808"],
  recommendedColorNames: ["Antique gold", "Navy", "Burgundy", "Ivory", "Black"],
  avoidPatterns: ["overly busy prints", "neon colors"],
  stylePersonality: "Polished, body-positive minimalism with a cinematic edge.",
  outfitSuggestions: ["Ivory sculpted shirt + obsidian trouser + gilded blazer"]
};

export async function POST(req: NextRequest) {
  try {
    const limited = await checkAiRateLimit(req.headers.get("x-user-id") ?? "anonymous");
    if (limited) return limited;

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || !hasGeminiEnv()) return NextResponse.json(fallback);

    const base64 = Buffer.from(await imageFile.arrayBuffer()).toString("base64");
    const prompt = `You are a professional fashion stylist and image analyst.
Analyze the person in this photo and return ONLY a valid JSON object, no extra text:
{
  "bodyType": "one of: slim / athletic / average / plus-size / petite / tall",
  "skinTone": "descriptive e.g. warm medium / cool fair / deep neutral",
  "skinUndertone": "warm or cool or neutral",
  "recommendedFits": ["list of 3-4 specific fits e.g. slim-cut, tapered, structured shoulders"],
  "recommendedColors": ["list of 5-6 hex color codes that suit this person"],
  "recommendedColorNames": ["matching color names e.g. Camel, Navy, Burgundy"],
  "avoidPatterns": ["list of 2-3 things to avoid e.g. horizontal stripes, neon colors"],
  "stylePersonality": "one sentence describing their ideal style",
  "outfitSuggestions": ["3 outfit description strings e.g. Slim navy trousers + white structured shirt + camel blazer"]
}
Be body-positive, specific, and helpful. Never use negative language about appearance.`;

    const result = await geminiVision.generateContent([prompt, { inlineData: { mimeType: imageFile.type, data: base64 } }]);
    return NextResponse.json(parseJsonResponse<StyleProfile>(result.response.text()));
  } catch {
    return NextResponse.json(fallback);
  }
}
