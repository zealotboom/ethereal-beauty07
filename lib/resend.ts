import { Resend } from "resend";

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOrderConfirmation(email: string, orderId: string, total: number) {
  if (!process.env.RESEND_API_KEY) return;

  await resend?.emails.send({
    from: "Ethereal Beauty <orders@etherealbeauty.com>",
    to: email,
    subject: "Your order is confirmed",
    html: `
      <div style="background:#080808;color:#F0EDE6;font-family:sans-serif;padding:40px;max-width:600px">
        <h1 style="color:#C9A84C;font-size:28px">Ethereal Beauty</h1>
        <p>Thank you for your order. We're preparing it now.</p>
        <div style="background:#161616;border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0;color:#7A7570;font-size:13px">ORDER ID</p>
          <p style="margin:4px 0 0;font-size:18px;color:#C9A84C">#${orderId}</p>
          <p style="margin:16px 0 0;color:#7A7570;font-size:13px">TOTAL</p>
          <p style="margin:4px 0 0;font-size:20px">$${total.toFixed(2)}</p>
        </div>
        <p style="color:#7A7570;font-size:13px">You'll receive a shipping update once your order is dispatched.</p>
      </div>
    `
  });
}
