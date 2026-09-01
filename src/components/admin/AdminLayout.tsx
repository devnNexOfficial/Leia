import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tags,
  Video,
  Image,
  Mail,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  Newspaper,
  HelpCircle,
  Star,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AdminNotificationProvider,
  useAdminNotifications,
} from "@/components/admin/AdminNotificationProvider";

const links = [
  { to: "/admin" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products" as const, label: "Products", icon: Package },
  { to: "/admin/orders" as const, label: "Orders", icon: ShoppingBag, hasBadge: true },
  { to: "/admin/messages" as const, label: "Messages", icon: MessageSquare },
  { to: "/admin/customers" as const, label: "Customers", icon: Users },
  { to: "/admin/categories" as const, label: "Categories", icon: Tags },
  { to: "/admin/blogs" as const, label: "Blogs & Articles", icon: Newspaper },
  { to: "/admin/story" as const, label: "Our Story", icon: Sparkles },
  { to: "/admin/faqs" as const, label: "FAQs", icon: HelpCircle },
  { to: "/admin/reviews" as const, label: "Reviews", icon: Star },
  { to: "/admin/videos" as const, label: "Videos", icon: Video },
  { to: "/admin/banners" as const, label: "Banners", icon: Image },
  { to: "/admin/subscribers" as const, label: "Newsletter", icon: Mail },
  { to: "/admin/pages" as const, label: "Pages", icon: FileText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminNotificationProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminNotificationProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { unreadCount, clearUnread, requestDesktopPermission, hasDesktopPermission } =
    useAdminNotifications();

  const signOut = async () => {
    await supabase?.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  const nav = (
    <nav className="space-y-1">
      {links.map(({ to, label, icon: Icon, hasBadge }) => {
        const active =
          location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            onClick={() => {
              setOpen(false);
              if (hasBadge) clearUnread();
            }}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="size-4" />
              <span>{label}</span>
            </div>
            {hasBadge && unreadCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-sm animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-slate-200 bg-white p-5 md:flex">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div className="text-lg font-bold tracking-tight text-slate-950">
              LEIA <span className="font-normal text-slate-400">Admin</span>
            </div>
            {unreadCount > 0 && (
              <Link
                to="/admin/orders"
                onClick={clearUnread}
                className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800"
              >
                <Bell className="size-3 animate-bounce" /> {unreadCount} new
              </Link>
            )}
          </div>
          {nav}
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          {!hasDesktopPermission && (
            <button
              onClick={requestDesktopPermission}
              className="flex w-full items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              <Bell className="size-3.5" /> Enable Desktop Order Alerts
            </button>
          )}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-1 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-bold text-slate-950">LEIA Admin</span>
        <Link
          to="/admin/orders"
          onClick={clearUnread}
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden">
          <aside className="flex h-full w-64 flex-col justify-between bg-white p-5 shadow-2xl">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <span className="font-bold text-slate-950">LEIA Admin</span>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="size-5" />
                </button>
              </div>
              {nav}
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="p-5 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}

export const adminCard = "rounded-lg border border-slate-200 bg-white shadow-sm";
export const adminButton = "inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50";
export const adminInput = "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500";
