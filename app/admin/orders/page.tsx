import AdminSidebar from "@/components/AdminSidebar";

export default function AdminOrdersPage() {
  return (
    <div className="luxury-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <section>
        <h1 className="font-display text-5xl text-primary">Orders</h1>
        <div className="mt-8 grid gap-3">
          {["EB-1048 pending", "EB-1047 paid", "EB-1046 dispatched"].map((order) => (
            <div key={order} className="flex justify-between border border-[rgba(201,168,76,0.15)] bg-surface p-4 text-primary/80">
              <span>{order}</span><select className="bg-bg p-2 text-gold"><option>pending</option><option>paid</option><option>shipped</option></select>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
