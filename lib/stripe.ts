import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_missing", {
  apiVersion: "2024-06-20" as unknown as Stripe.StripeConfig["apiVersion"]
});

export async function createPaymentIntent(amount: number) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true }
  });
}
