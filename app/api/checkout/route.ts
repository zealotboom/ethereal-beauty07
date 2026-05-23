import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ clientSecret: "stripe-env-not-configured" });
    const intent = await createPaymentIntent(Number(amount));
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch {
    return NextResponse.json({ error: "Could not create payment intent." }, { status: 400 });
  }
}
