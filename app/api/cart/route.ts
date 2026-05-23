import { NextRequest, NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase-server";

export async function GET() {
  if (!hasSupabaseEnv()) return NextResponse.json([]);
  const supabase = createClient();
  const { data, error } = await supabase.from("cart_items").select("*, products(*)");
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true });
  const supabase = createClient();
  const body = await req.json();
  const { data, error } = await supabase.from("cart_items").insert(body).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}
