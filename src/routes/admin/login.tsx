import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { adminButton, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
const STORAGE_KEY_FAIL_COUNT = "leia_admin_fail_count";
const STORAGE_KEY_LOCKOUT = "leia_admin_lockout_until";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Admin Sign In — LEIA" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Initialize and tick lockout countdown if active
  useEffect(() => {
    const updateLockout = () => {
      const lockoutUntil = parseInt(sessionStorage.getItem(STORAGE_KEY_LOCKOUT) || "0", 10);
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemaining(remaining);
    };

    updateLockout();
    const interval = setInterval(updateLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFailedAttempt = (message: string) => {
    const currentFails = parseInt(sessionStorage.getItem(STORAGE_KEY_FAIL_COUNT) || "0", 10) + 1;
    sessionStorage.setItem(STORAGE_KEY_FAIL_COUNT, currentFails.toString());

    if (currentFails >= MAX_FAILED_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_SECONDS * 1000;
      sessionStorage.setItem(STORAGE_KEY_LOCKOUT, lockoutTime.toString());
      setLockoutRemaining(LOCKOUT_SECONDS);
      setError(`Too many failed login attempts. For security, please wait ${LOCKOUT_SECONDS} seconds before trying again.`);
    } else {
      const attemptsLeft = MAX_FAILED_ATTEMPTS - currentFails;
      setError(`${message} (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining before temporary lockout)`);
    }
  };

  const handleSuccess = () => {
    sessionStorage.removeItem(STORAGE_KEY_FAIL_COUNT);
    sessionStorage.removeItem(STORAGE_KEY_LOCKOUT);
    setLockoutRemaining(0);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (lockoutRemaining > 0) {
      setError(`Login temporarily locked. Please wait ${lockoutRemaining} seconds.`);
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      handleFailedAttempt(authError.message || "Invalid email or password.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (!isAdmin) {
      await supabase.auth.signOut();
      handleFailedAttempt("This account does not have admin access.");
      setLoading(false);
      return;
    }

    handleSuccess();
    navigate({ to: "/admin" });
  };

  const isLocked = lockoutRemaining > 0;

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
      >
        <h1 className="text-xl font-bold text-slate-900">LEIA Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage the store.</p>

        {!supabase ? (
          <div className="mt-5">
            <AdminSetupNotice />
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  className={`${adminInput} mt-1`}
                  type="email"
                  value={email}
                  disabled={isLocked || loading}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  className={`${adminInput} mt-1`}
                  type="password"
                  value={password}
                  disabled={isLocked || loading}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </div>

            {isLocked && (
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-medium">
                ⏱️ Account temporarily throttled. Cooldown: <strong>{lockoutRemaining}s</strong>
              </div>
            )}

            {error && !isLocked && <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>}

            <button
              type="submit"
              className={`${adminButton} mt-6 w-full`}
              disabled={loading || isLocked}
            >
              {isLocked
                ? `Locked (${lockoutRemaining}s)`
                : loading
                ? "Signing in…"
                : "Sign in"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
