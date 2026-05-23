import { CreditCard } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="luxury-shell max-w-3xl">
      <p className="text-sm uppercase tracking-[0.28em] text-gold">Stripe Test Mode</p>
      <h1 className="mt-2 font-display text-5xl text-primary">Checkout</h1>
      <div className="mt-8 border border-[rgba(201,168,76,0.18)] bg-surface p-6">
        <CreditCard className="text-gold" />
        <p className="mt-4 text-primary/80">Payment intent creation is available at <code className="text-gold">/api/checkout</code>. Use Stripe test card <code className="text-gold">4242 4242 4242 4242</code> during integration.</p>
        <form className="mt-6 grid gap-4">
          <input className="border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary" placeholder="Email" />
          <input className="border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary" placeholder="Shipping address" />
          <button className="bg-gold px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg">Create Test Payment</button>
        </form>
      </div>
    </div>
  );
}
