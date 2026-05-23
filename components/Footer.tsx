import Link from "next/link";
import { Instagram, Mail, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(201,168,76,0.15)] bg-bg">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto_auto] lg:px-8">
        <div>
          <p className="font-display text-2xl text-gold">Ethereal Beauty</p>
          <p className="mt-2 max-w-md text-sm text-muted">Luxury clothing with cinematic intelligence, tailored for the way you move through the evening.</p>
        </div>
        <div className="flex gap-5 text-sm text-primary/75">
          <Link href="/shop">Shop</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/auth">Auth</Link>
        </div>
        <div className="flex gap-3 text-gold">
          <Instagram size={18} />
          <Mail size={18} />
          <Sparkles size={18} />
        </div>
      </div>
    </footer>
  );
}
