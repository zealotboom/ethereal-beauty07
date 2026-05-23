import { NextRequest, NextResponse } from "next/server";
import { geminiEmbedding, geminiVision, hasGeminiEnv } from "@/lib/gemini";
import { createClient, hasSupabaseEnv } from "@/lib/supabase-server";
import { parseJsonResponse } from "@/lib/utils";
import { checkAiRateLimit } from "@/lib/rate-limit";
import type { FindThisFeatures } from "@/lib/types";

const fallback: FindThisFeatures = {
  garmentType: "jacket",
  primaryColor: "black",
  secondaryColors: ["gold"],
  pattern: "solid",
  fit: "structured",
  neckline: "collar",
  sleeveType: "long",
  styleCategory: "formal",
  searchKeywords: ["black", "structured", "jacket", "tailoring", "evening"]
};

export async function POST(req: NextRequest) {
  try {
    const limited = await checkAiRateLimit(req.headers.get("x-user-id") ?? "anonymous");
    if (limited) return limited;

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || !hasGeminiEnv()) return NextResponse.json({ features: fallback, matches: [] });

    const base64 = Buffer.from(await imageFile.arrayBuffer()).toString("base64");
    const prompt = `Analyze this clothing item image. Return ONLY valid JSON, no extra text:
{
  "garmentType": "e.g. t-shirt / dress / jacket / trousers",
  "primaryColor": "main color name",
  "secondaryColors": ["other colors present"],
  "pattern": "e.g. solid / striped / floral / geometric / plain",
  "fit": "e.g. slim / oversized / regular / relaxed",
  "neckline": "e.g. crew / v-neck / collar / turtleneck / none",
  "sleeveType": "e.g. full / half / sleeveless / long",
  "styleCategory": "e.g. casual / formal / streetwear / athletic",
  "searchKeywords": ["5-8 keywords to find similar products in a database"]
}`;

    const result = await geminiVision.generateContent([prompt, { inlineData: { mimeType: imageFile.type, data: base64 } }]);
    const features = parseJsonResponse<FindThisFeatures>(result.response.text());

    if (!hasSupabaseEnv()) return NextResponse.json({ features, matches: [] });

    const searchText = `${features.searchKeywords.join(" ")} ${features.garmentType}`;
    const embeddingResult = await geminiEmbedding.embedContent(searchText);
    const supabase = createClient();
    const { data: matches } = await supabase.rpc("match_products", {
      query_embedding: embeddingResult.embedding.values,
      match_count: 12
    });

    return NextResponse.json({ features, matches: matches ?? [] });
  } catch {
    return NextResponse.json({ features: fallback, matches: [] });
  }
}
