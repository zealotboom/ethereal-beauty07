# Ethereal Beauty

Full-stack luxury fashion e-commerce starter built with Next.js 14, Tailwind CSS, Supabase, Gemini Vision, Stripe test mode, Cloudinary, Resend, Zustand, React Hook Form, Zod, Framer Motion, and Three.js.

## Run Locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill the free-tier service keys when you want live Supabase, Gemini, Cloudinary, Stripe, and Resend behavior.

## Supabase

Run `supabase/schema.sql` in the SQL editor, then `supabase/seed-products.sql` to create 50 sample products. Set an admin manually:

```sql
update public.profiles set role = 'admin' where id = '<user-id>';
```

## Notes

- AI endpoints return friendly local fallbacks when `GEMINI_API_KEY` is missing.
- Stripe route stays in test mode and returns a setup placeholder when keys are absent.
- Product images use Unsplash development URLs and Next Image remote patterns.
