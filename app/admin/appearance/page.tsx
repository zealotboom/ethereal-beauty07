import AdminSidebar from "@/components/AdminSidebar";

export default function AdminAppearancePage() {
  return (
    <div className="luxury-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <section>
        <h1 className="font-display text-5xl text-primary">Appearance</h1>
        <div className="mt-8 border border-dashed border-gold bg-surface p-10 text-center text-muted">
          Upload wallpaper, campaign banner, and seasonal editorial imagery to Cloudinary folder <span className="text-gold">ethereal-beauty/products</span>.
        </div>
      </section>
    </div>
  );
}
