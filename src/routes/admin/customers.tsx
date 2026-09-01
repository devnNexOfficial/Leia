import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminCard, adminInput } from "@/components/admin/AdminLayout";
import type { AdminCustomer, AdminOrder } from "@/lib/admin-types";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/customers")({
  component: Customers,
});

function Customers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const [c, o] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*"),
    ]);

    if (c.error || o.error) {
      setError(c.error?.message ?? o.error?.message ?? "Could not load customers.");
    } else {
      setCustomers((c.data ?? []) as AdminCustomer[]);
      setOrders((o.data ?? []) as AdminOrder[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-customers")
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const filtered = useMemo(
    () =>
      customers.filter((c) =>
        `${c.name} ${c.email ?? ""} ${c.phone ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [customers, query]
  );

  const forCustomer = (id: string) => orders.filter((o) => o.customer_id === id);

  return (
    <section>
      <div className="mb-7">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">
          View customers and their purchase history.
        </p>
      </div>

      <input
        className={`${adminInput} mb-4 max-w-md`}
        placeholder="Search name, email, or phone"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {error && (
        <div className="mb-4">
          <AdminError message={error} />
        </div>
      )}

      {loading ? (
        <AdminLoading />
      ) : filtered.length === 0 ? (
        <EmptyState>No customers found.</EmptyState>
      ) : (
        <div className={`${adminCard} overflow-x-auto`}>
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Total orders</th>
                <th className="px-5 py-3">Total spent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const history = forCustomer(c.id);
                const spent = history
                  .filter((o) => o.status !== "Cancelled")
                  .reduce((n, o) => n + Number(o.total), 0);

                return (
                  <tr
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    key={c.id}
                    onClick={() => setSelected(c)}
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-slate-500">{c.email ?? "—"}</div>
                    </td>
                    <td className="px-5 py-3">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3">{history.length}</td>
                    <td className="px-5 py-3">Rs. {spent.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <CustomerDetail
          customer={selected}
          orders={forCustomer(selected.id)}
          close={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function CustomerDetail({
  customer,
  orders,
  close,
}: {
  customer: AdminCustomer;
  orders: AdminOrder[];
  close: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-bold">{customer.name}</h2>
            <p className="text-sm text-slate-500">
              {customer.email ?? "No email"} · {customer.phone ?? "No phone"}
            </p>
          </div>
          <button onClick={close} aria-label="Close customer details">
            <X />
          </button>
        </div>

        <h3 className="mt-7 text-sm font-semibold">Order history</h3>

        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="mt-3 divide-y rounded-md border">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{o.order_number}</p>
                  <p className="text-slate-500">
                    {new Date(o.created_at).toLocaleDateString()} · {o.status}
                  </p>
                </div>
                <span>Rs. {Number(o.total).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
