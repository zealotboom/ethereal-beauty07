import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient, hasSupabaseEnv } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) return NextResponse.json({ received: true });
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "payment_intent.succeeded" && hasSupabaseEnv()) {
      const intent = event.data.object;
      const supabase = createClient();
      await supabase.from("orders").update({ status: "paid" }).eq("stripe_id", intent.id);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
}
