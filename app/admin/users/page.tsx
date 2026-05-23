import AdminSidebar from "@/components/AdminSidebar";

export default function AdminUsersPage() {
  return (
    <div className="luxury-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <section>
        <h1 className="font-display text-5xl text-primary">Users</h1>
        <div className="mt-8 grid gap-3">
          {["muse@example.com", "stylist@example.com", "atelier@example.com"].map((email) => (
            <div key={email} className="flex justify-between border border-[rgba(201,168,76,0.15)] bg-surface p-4 text-primary/80">
              <span>{email}</span><button className="text-danger">Ban</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
