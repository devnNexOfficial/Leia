import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  User,
  Phone,
  Mail,
  Clock,
  X,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminCard, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { formatRupees } from "@/lib/utils";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

type OrderItem = {
  id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
};

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  city: string;
  order_items: OrderItem[];
};

type Customer = {
  phone: string;
  name: string;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: Order[];
};

const STATUS_STYLES: Record<string, string> = {
  Pending:   "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Shipped:   "bg-purple-50 text-purple-700 border-purple-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const load = async () => {
      const { data, error: err } = await client
        .from("orders")
        .select("*, order_items(*)")
        .not("customer_phone", "is", null)
        .order("created_at", { ascending: false });

      if (err) setError(err.message);
      else setOrders((data ?? []) as Order[]);
      setLoading(false);
    };

    void load();

    const ch = client
      .channel("admin-customers")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void load())
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  // Group orders by phone number → one customer per unique phone
  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const order of orders) {
      const key = (order as any).customer_phone as string;
      if (!map.has(key)) {
        map.set(key, {
          phone: key,
          name: (order as any).customer_name ?? "Unknown",
          email: (order as any).customer_email ?? null,
          orderCount: 0,
          totalSpent: 0,
          firstOrderDate: order.created_at,
          lastOrderDate: order.created_at,
          orders: [],
        });
      }
      const c = map.get(key)!;
      c.orderCount++;
      c.totalSpent += order.total;
      if (order.created_at < c.firstOrderDate) c.firstOrderDate = order.created_at;
      if (order.created_at > c.lastOrderDate) {
        c.lastOrderDate = order.created_at;
        c.name = (order as any).customer_name ?? c.name;
        c.email = (order as any).customer_email ?? c.email;
      }
      c.orders.push(order);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }, [customers, query]);

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
            <Users className="size-6 text-[#D6336C]" /> Customers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Everyone who has placed an order, grouped by phone number.
          </p>
        </div>
      </div>

      {error && <AdminError message={error} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className={`${adminCard} flex flex-col gap-1 p-4`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Customers</p>
          <p className="text-2xl font-black text-slate-900">{customers.length}</p>
        </div>
        <div className={`${adminCard} flex flex-col gap-1 p-4`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Orders</p>
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
        </div>
        <div className={`${adminCard} flex flex-col gap-1 p-4 col-span-2 sm:col-span-1`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</p>
          <p className="text-2xl font-black text-[#D6336C]">{formatRupees(totalRevenue)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, or email…"
          className={`${adminInput} pl-9`}
        />
      </div>

      {/* Table */}
      {loading ? (
        <AdminLoading />
      ) : filtered.length === 0 ? (
        <EmptyState>
          <div className="text-center py-8">
            <ShoppingBag className="size-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No customers yet</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Customers who place orders will appear here automatically.
            </p>
          </div>
        </EmptyState>
      ) : (
        <div className={`${adminCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Orders</th>
                  <th className="px-5 py-3.5">Total Spent</th>
                  <th className="px-5 py-3.5">Last Order</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr
                    key={c.phone}
                    onClick={() => setSelected(c)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-[#FFF0F5] border border-[#F5C6D5] flex items-center justify-center shrink-0">
                          <span className="text-xs font-black text-[#D6336C]">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`tel:${c.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-mono text-slate-700 hover:text-[#D6336C] transition-colors"
                      >
                        {c.phone}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-[#D6336C] hover:underline"
                        >
                          {c.email}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        <Package className="size-3" /> {c.orderCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {formatRupees(c.totalSpent)}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3 text-slate-400" />
                        {new Date(c.lastOrderDate).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelected(c)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#D6336C] p-6 text-white flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-200">Customer Profile</span>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-pink-100">
                  <span className="flex items-center gap-1"><Phone className="size-3.5" /> {selected.phone}</span>
                  {selected.email && <span className="flex items-center gap-1"><Mail className="size-3.5" /> {selected.email}</span>}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="size-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
              <div className="p-4 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</p>
                <p className="text-2xl font-black text-slate-900">{selected.orderCount}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spent</p>
                <p className="text-2xl font-black text-[#D6336C]">{formatRupees(selected.totalSpent)}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Order</p>
                <p className="text-2xl font-black text-slate-900">{formatRupees(Math.round(selected.totalSpent / selected.orderCount))}</p>
              </div>
            </div>

            {/* Order History */}
            <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Order History</p>
              {selected.orders
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((order) => (
                  <div key={order.id} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{order.order_number}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(order.created_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {order.city || "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {order.status}
                        </span>
                        <span className="font-black text-slate-900">{formatRupees(order.total)}</span>
                      </div>
                    </div>
                    {/* Items */}
                    <div className="space-y-1">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-slate-600">
                          <span>
                            {item.product_name}
                            {item.variant_name ? ` — ${item.variant_name}` : ""}
                            {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                          </span>
                          <span className="font-semibold">{formatRupees(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
