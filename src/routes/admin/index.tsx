import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminCard } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import type { AdminOrder } from "@/lib/admin-types";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const load = async () => {
      setLoading(true);
      const [orderResult, productResult] = await Promise.all([
        client.from("orders").select("*").order("created_at", { ascending: false }),
        client.from("products").select("id", { count: "exact", head: true }),
      ]);

      if (orderResult.error || productResult.error) {
        setError(orderResult.error?.message ?? productResult.error?.message ?? "Could not load dashboard.");
      } else {
        setOrders((orderResult.data ?? []) as AdminOrder[]);
        setProductCount(productResult.count ?? 0);
      }
      setLoading(false);
    };

    load();

    const channel = client
      .channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  if (loading) return <AdminLoading />;
  if (error) return <AdminError message={error} />;

  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === "Pending").length;

  const stats: [string, string | number][] = [
    ["Total orders", orders.length],
    ["Total revenue", `Rs. ${revenue.toLocaleString()}`],
    ["Total products", productCount],
    ["Pending orders", pending],
  ];

  return (
    <section>
      <div className="mb-7">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Store performance at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className={`${adminCard} p-5`}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className={`${adminCard} mt-7 overflow-hidden`}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Recent orders</h2>
        </div>
        {orders.length === 0 ? (
          <EmptyState>No orders yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium">{o.order_number}</td>
                    <td className="px-5 py-3">{o.customer_name}</td>
                    <td className="px-5 py-3">Rs. {Number(o.total).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{o.status}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
