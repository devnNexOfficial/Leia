import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, ShoppingBag, X, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { playOrderChime } from "@/lib/notification-sound";
import { supabase } from "@/lib/supabase";

export interface NewOrderAlert {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

interface AdminNotificationContextType {
  unreadCount: number;
  recentOrders: NewOrderAlert[];
  clearUnread: () => void;
  requestDesktopPermission: () => void;
  hasDesktopPermission: boolean;
}

const AdminNotificationContext = createContext<AdminNotificationContextType>({
  unreadCount: 0,
  recentOrders: [],
  clearUnread: () => {},
  requestDesktopPermission: () => {},
  hasDesktopPermission: false,
});

export const useAdminNotifications = () => useContext(AdminNotificationContext);

export function AdminNotificationProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<NewOrderAlert[]>([]);
  const [activeToast, setActiveToast] = useState<NewOrderAlert | null>(null);
  const [hasDesktopPermission, setHasDesktopPermission] = useState(false);

  // Check initial notification permissions
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasDesktopPermission(Notification.permission === "granted");
    }
  }, []);

  const requestDesktopPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setHasDesktopPermission(perm === "granted");
    }
  };

  // Real-time Supabase subscription for incoming orders
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("admin-realtime-orders-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as {
            id: string;
            order_number: string;
            customer_name: string;
            city: string;
            total: number;
            payment_method: string;
            created_at: string;
          };

          const newAlert: NewOrderAlert = {
            id: row.id || crypto.randomUUID(),
            orderNumber: row.order_number,
            customerName: row.customer_name || "Valued Customer",
            city: row.city || "Pakistan",
            total: Number(row.total || 0),
            paymentMethod: row.payment_method || "COD",
            createdAt: row.created_at || new Date().toISOString(),
          };

          // 1. Play audio chime
          playOrderChime();

          // 2. Update state & badge count
          setUnreadCount((c) => c + 1);
          setRecentOrders((prev) => [newAlert, ...prev.slice(0, 19)]);
          setActiveToast(newAlert);

          // 3. Trigger native desktop notification if permission granted
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification(`🛍️ New Order Received: ${newAlert.orderNumber}`, {
              body: `${newAlert.customerName} placed an order for Rs. ${newAlert.total.toLocaleString()} (${newAlert.city})`,
              icon: "/favicon.ico",
              tag: newAlert.id,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  // Auto-dismiss floating toast after 8 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const clearUnread = () => {
    setUnreadCount(0);
  };

  return (
    <AdminNotificationContext.Provider
      value={{
        unreadCount,
        recentOrders,
        clearUnread,
        requestDesktopPermission,
        hasDesktopPermission,
      }}
    >
      {children}

      {/* Floating Animated New Order Toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-5 right-5 z-50 w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-300 bg-white p-4 shadow-2xl shadow-emerald-950/20 ring-1 ring-emerald-500/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <ShoppingBag className="size-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>New Order Received!</span>
                </div>
                <h4 className="mt-0.5 text-sm font-bold text-slate-900">
                  {activeToast.orderNumber}
                </h4>
                <p className="text-xs text-slate-600">
                  <strong>{activeToast.customerName}</strong> ({activeToast.city})
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                  <span className="font-bold text-emerald-700">
                    Rs. {activeToast.total.toLocaleString()} • {activeToast.paymentMethod}
                  </span>
                  <button
                    onClick={() => {
                      setActiveToast(null);
                      clearUnread();
                      navigate({ to: "/admin/orders" });
                    }}
                    className="rounded-lg bg-slate-900 px-3 py-1 font-bold text-white transition-colors hover:bg-slate-700"
                  >
                    View Order →
                  </button>
                </div>
              </div>
              <button
                onClick={() => setActiveToast(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close notification"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminNotificationContext.Provider>
  );
}
