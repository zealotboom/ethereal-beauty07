import AdminSidebar from "@/components/AdminSidebar";

export default function AdminPromosPage() {
  return (
    <div className="luxury-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <section>
        <h1 className="font-display text-5xl text-primary">Promos</h1>
        <form className="mt-8 grid max-w-xl gap-4 border border-[rgba(201,168,76,0.15)] bg-surface p-6">
          <input className="border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary" placeholder="Code" />
          <select className="border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary"><option>percent</option><option>fixed</option></select>
          <input className="border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary" placeholder="Discount value" />
          <button className="bg-gold px-5 py-4 text-sm font-bold text-bg">Create Promo</button>
        </form>
      </section>
    </div>
  );
}
