import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase-server";

export async function checkAiRateLimit(userId: string) {
  if (!hasSupabaseEnv()) return null;

  const supabase = createClient();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("ai_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", hourAgo);

  if (error) return null;
  if ((count ?? 0) >= 10) {
    return NextResponse.json({ error: "You have reached the 10 AI requests per hour limit. Please try again soon." }, { status: 429 });
  }

  await supabase.from("ai_rate_limits").insert({ user_id: userId });
  return null;
}
