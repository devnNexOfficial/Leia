import { Outlet, createFileRoute, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { supabase } from "@/lib/supabase";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Admin Portal — LEIA" },
    ],
  }),
  component: AdminGate,
});

function AdminGate() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "allowed" | "denied" | "setup">("checking");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Authenticate admin
  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!supabase) { setState("setup"); return; }
    let live = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (live) setState("denied"); return; }
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (live) setState(isAdmin ? "allowed" : "denied");
    })();
    return () => { live = false; };
  }, [pathname]);

  // Inactivity timeout tracker (30 minutes of inactivity auto-logout)
  useEffect(() => {
    if (state !== "allowed" || pathname === "/admin/login") return;

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        if (supabase) {
          await supabase.auth.signOut();
        }
        setState("denied");
        navigate({ to: "/admin/login" });
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [state, pathname, navigate]);

  if (pathname === "/admin/login") return <Outlet />;
  if (state === "checking") return <div className="grid min-h-screen place-items-center bg-slate-100 text-sm text-slate-500">Checking admin access…</div>;
  if (state === "setup") return <div className="grid min-h-screen place-items-center bg-slate-100 p-6"><div className="w-full max-w-lg"><AdminSetupNotice /></div></div>;
  if (state === "denied") throw redirect({ to: "/admin/login" });
  return <AdminLayout><Outlet /></AdminLayout>;
}
