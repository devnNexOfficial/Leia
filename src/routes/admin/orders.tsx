import { createFileRoute } from "@tanstack/react-router";
import { Search, X, Trash2, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminCard, adminInput } from "@/components/admin/AdminLayout";
import type { AdminOrder, OrderStatus } from "@/lib/admin-types";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/orders")({
  component: Orders,
});

const statuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function Orders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setOrders((data ?? []) as AdminOrder[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "All" || o.status === status) &&
          `${o.customer_name} ${o.order_number} ${o.shipping_address ?? ""} ${o.city ?? ""} ${o.customer_phone ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [orders, query, status]
  );

  const updateStatus = async (order: AdminOrder, next: OrderStatus) => {
    const { error } = await supabase!
      .from("orders")
      .update({ status: next })
      .eq("id", order.id);

    if (error) {
      setError(error.message);
    } else {
      setSelected((current) =>
        current?.id === order.id ? { ...current, status: next } : current
      );
    }
  };

  return (
    <section>
      <div className="mb-7">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track fulfilment, delivery addresses, and customer payment details.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input
            className={`${adminInput} pl-9`}
            placeholder="Search customer, phone, order #, city, or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          className={adminInput}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4">
          <AdminError message={error} />
        </div>
      )}

      {loading ? (
        <AdminLoading />
      ) : filtered.length === 0 ? (
        <EmptyState>No orders match these filters.</EmptyState>
      ) : (
        <div className={`${adminCard} overflow-x-auto`}>
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer & Contact</th>
                <th className="px-5 py-3">Delivery Address</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  {/* Order Number */}
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900">{o.order_number}</span>
                  </td>

                  {/* Customer & Phone */}
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900">{o.customer_name}</div>
                    {o.customer_phone && (
                      <div className="mt-0.5 text-xs text-slate-500 font-mono">
                        📞 {o.customer_phone}
                      </div>
                    )}
                    {o.customer_email && (
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {o.customer_email}
                      </div>
                    )}
                  </td>

                  {/* Delivery Address & City */}
                  <td className="px-5 py-3.5 max-w-[280px]">
                    <div className="text-xs text-slate-800 line-clamp-2 leading-relaxed font-normal">
                      {o.shipping_address || <span className="text-slate-400 italic">No address provided</span>}
                    </div>
                    {o.city && (
                      <span className="mt-1 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                        📍 {o.city}
                      </span>
                    )}
                  </td>

                  {/* Items Count */}
                  <td className="px-5 py-3.5 font-medium text-slate-700">
                    {o.order_items?.reduce((n, i) => n + i.quantity, 0) ?? 0}
                  </td>

                  {/* Total Amount */}
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    Rs. {Number(o.total).toLocaleString()}
                  </td>

                  {/* Payment Method */}
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      {o.payment_method}
                    </span>
                  </td>

                  {/* Order Status */}
                  <td className="px-5 py-3.5">
                    <select
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs focus:border-slate-500 focus:outline-none cursor-pointer"
                      value={o.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateStatus(o, e.target.value as OrderStatus)
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  {/* Order Date */}
                  <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <OrderDetail
          order={selected}
          updateStatus={updateStatus}
          close={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function OrderDetail({
  order,
  updateStatus,
  close,
}: {
  order: AdminOrder;
  updateStatus: (o: AdminOrder, s: OrderStatus) => void;
  close: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 p-4">
      <div className="mx-auto my-5 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">Order</p>
            <h2 className="text-xl font-bold">{order.order_number}</h2>
          </div>
          <div className="flex items-center gap-2">
            {order.customer_phone && (
              <a
                href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "").replace(/^0/, "92")}?text=${encodeURIComponent(`Hi! Yeh LEIA ki taraf se message hai. Aapka order ${order.order_number} confirm ho gaya hai. Koi sawaal ho to bata dein.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                title="WhatsApp Customer"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            )}
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to permanently delete this order?")) {
                  if (supabase) {
                    await supabase.from("order_items").delete().eq("order_id", order.id);
                    await supabase.from("orders").delete().eq("id", order.id);
                  }
                  close();
                }
              }}
              className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
              title="Delete Order"
            >
              <Trash2 className="size-5" />
            </button>
            <button onClick={close} aria-label="Close order details" className="p-2 text-slate-400 hover:text-slate-600">
              <X className="size-6" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Customer</h3>
            <p className="mt-2 text-sm">{order.customer_name}</p>
            <p className="text-sm text-slate-500">
              {order.customer_email ?? "No email"}
              <br />
              {order.customer_phone ?? "No phone"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Shipping address</h3>
            <p className="mt-2 text-sm text-slate-600">
              {order.shipping_address ?? "No address"}
              {order.city && (
                <>
                  <br />
                  {order.city}
                </>
              )}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Payment</h3>
            <p className="mt-2 text-sm">{order.payment_method}</p>
          </div>

          <label className="text-sm font-semibold">
            Status
            <select
              className={`${adminInput} mt-2 font-normal`}
              value={order.status}
              onChange={(e) => updateStatus(order, e.target.value as OrderStatus)}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-7">
          <h3 className="mb-3 text-sm font-semibold">Items</h3>
          <div className="divide-y rounded-md border">
            {order.order_items?.map((i) => (
              <div
                className="flex items-center justify-between gap-4 p-3 text-sm"
                key={i.id}
              >
                <div className="flex items-center gap-3">
                  {i.image_url ? (
                    <img
                      src={i.image_url}
                      alt={i.product_name}
                      loading="lazy"
                      decoding="async"
                      className="size-9 rounded object-cover"
                    />
                  ) : null}
                  <span>
                    {i.product_name}
                    {i.variant_name ? (
                      <span className="block text-xs text-slate-500">
                        {i.variant_name}
                      </span>
                    ) : null}
                  </span>
                </div>
                <span>
                  {i.quantity} × Rs. {Number(i.unit_price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end font-semibold">
            Total: Rs. {Number(order.total).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
