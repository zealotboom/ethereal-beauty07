import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/resend";
import { createClient, hasSupabaseEnv } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!hasSupabaseEnv()) return NextResponse.json({ id: "local-order", ...body });

  const supabase = createClient();
  const { data, error } = await supabase.from("orders").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (body.email) await sendOrderConfirmation(body.email, data.id, Number(data.total ?? 0));
  return NextResponse.json(data);
}
