"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  X,
  User,
  Lock,
  Phone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  Package,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { phoneDigits, isValidPhone, authEmailForPhone } from "@/lib/utils";

type ModalTab = "login" | "register" | "account";
type CustomerProfile = { id: string; full_name: string; phone: string };
type OrderSummary = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
};

const CUSTOMER_MAX_FAILS = 5;
const CUSTOMER_LOCKOUT_SECONDS = 60;
const CUSTOMER_FAIL_KEY = "leia_cust_fail_count";
const CUSTOMER_LOCKOUT_KEY = "leia_cust_lockout_until";

export function AccountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<ModalTab>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Handle client-side cooldown countdown
  useEffect(() => {
    const updateLockout = () => {
      const lockoutUntil = parseInt(sessionStorage.getItem(CUSTOMER_LOCKOUT_KEY) || "0", 10);
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemaining(remaining);
    };

    updateLockout();
    const interval = setInterval(updateLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAccount = async () => {
    if (!supabase) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        setProfile(null);
        setOrders([]);
        return;
      }

      // Fetch customer profile linked to auth_user_id
      const { data: customer } = await supabase
        .from("customers")
        .select("id, full_name, name, phone")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      const userFullName =
        customer?.full_name ||
        customer?.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "Valued Customer";
      const userPhone =
        customer?.phone ||
        user.user_metadata?.phone ||
        user.email?.replace(/^phone-/, "").replace(/@leia-store\.local$/, "") ||
        "";

      const currentProfile: CustomerProfile = {
        id: customer?.id ?? user.id,
        full_name: userFullName,
        phone: userPhone,
      };

      setProfile(currentProfile);
      setPhone(userPhone);
      setName(userFullName);
      setActiveTab("account");

      // Load user's orders
      if (customer?.id || userPhone) {
        const query = supabase
          .from("orders")
          .select("id, order_number, status, total, created_at")
          .order("created_at", { ascending: false });

        if (customer?.id) {
          const { data: accountOrders } = await query.eq("customer_id", customer.id);
          setOrders((accountOrders ?? []) as OrderSummary[]);
        } else {
          const { data: accountOrders } = await query.eq("customer_phone", userPhone);
          setOrders((accountOrders ?? []) as OrderSummary[]);
        }
      }
    } catch {
      // Gracefully handle any connection glitch
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError("");
      void loadAccount();
    }
  }, [isOpen]);

  const switchTab = (tab: ModalTab) => {
    setActiveTab(tab);
    setError("");
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lockoutRemaining > 0) {
      setError(`Sign in temporarily throttled. Please wait ${lockoutRemaining}s.`);
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number (10-15 digits).");
      return;
    }
    if (password.length < 8) {
      setError("Please enter your password (minimum 8 characters).");
      return;
    }
    if (!supabase) {
      setError("Account sign-in is temporarily unavailable. Please try again shortly.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmailForPhone(phone),
      password,
    });

    setLoading(false);

    if (signInError) {
      const currentFails = parseInt(sessionStorage.getItem(CUSTOMER_FAIL_KEY) || "0", 10) + 1;
      sessionStorage.setItem(CUSTOMER_FAIL_KEY, currentFails.toString());
      if (currentFails >= CUSTOMER_MAX_FAILS) {
        const lockoutTime = Date.now() + CUSTOMER_LOCKOUT_SECONDS * 1000;
        sessionStorage.setItem(CUSTOMER_LOCKOUT_KEY, lockoutTime.toString());
        setLockoutRemaining(CUSTOMER_LOCKOUT_SECONDS);
        setError(`Too many failed sign-in attempts. For security, please wait ${CUSTOMER_LOCKOUT_SECONDS} seconds before trying again.`);
      } else {
        const left = CUSTOMER_MAX_FAILS - currentFails;
        setError(`Incorrect phone number or password. (${left} attempt${left === 1 ? "" : "s"} remaining before cooldown)`);
      }
      return;
    }

    sessionStorage.removeItem(CUSTOMER_FAIL_KEY);
    sessionStorage.removeItem(CUSTOMER_LOCKOUT_KEY);
    setLockoutRemaining(0);
    await loadAccount();
    onClose();
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number (10-15 digits).");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (!supabase) {
      setError("Account creation is temporarily unavailable. Please try again shortly.");
      return;
    }

    setLoading(true);
    setError("");
    const normalizedPhone = phoneDigits(phone);
    const authEmail = authEmailForPhone(normalizedPhone);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: {
          full_name: name.trim(),
          phone: normalizedPhone,
        },
      },
    });

    if (
      signUpError ||
      !signUpData.user ||
      (signUpData.user.identities && signUpData.user.identities.length === 0)
    ) {
      setLoading(false);
      setError("An account with this phone number already exists. Please sign in instead.");
      return;
    }

    let userId = signUpData.user.id;

    // If auto-confirm is not instant or session is missing, sign in to establish session
    if (!signUpData.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (signInError || !signInData.user) {
        setLoading(false);
        setError("Your account was created, but automatic sign-in was not completed. Please sign in now.");
        return;
      }
      userId = signInData.user.id;
    }

    // Upsert customer profile row
    const { error: customerError } = await supabase.from("customers").upsert(
      {
        auth_user_id: userId,
        full_name: name.trim(),
        name: name.trim(),
        phone: normalizedPhone,
        email: authEmail,
      },
      { onConflict: "auth_user_id" }
    );

    if (customerError) {
      // Fallback: try update by phone if pre-existing from guest checkout
      await supabase
        .from("customers")
        .update({
          auth_user_id: userId,
          full_name: name.trim(),
          name: name.trim(),
        })
        .eq("phone", normalizedPhone);
    }

    setLoading(false);
    setWelcome(true);
    await loadAccount();

    // Show celebratory bounce banner and close modal after a brief moment
    window.setTimeout(() => {
      setWelcome(false);
      onClose();
    }, 1600);
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
    setOrders([]);
    setPassword("");
    setWelcome(false);
    switchTab("login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#F5C6D5] bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-[#D6336C] px-6 py-6 text-white">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full p-1 text-white/80 transition-colors hover:bg-white/20"
                  aria-label="Close account modal"
                >
                  <X className="size-5" />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                  LEIA BEAUTY CLUB
                </span>
                <h2 className="mt-1 font-bodoni text-2xl font-bold uppercase tracking-wider md:text-3xl">
                  My Account & Orders
                </h2>
                <p className="mt-1 text-xs text-white/90">
                  Access your account, earn VIP rewards & checkout faster.
                </p>

                {/* Tabs */}
                <div className="mt-6 flex gap-2 border-b border-white/20">
                  {profile ? (
                    <button
                      onClick={() => switchTab("account")}
                      className={`border-b-2 pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                        activeTab === "account" ? "border-white text-white" : "border-transparent text-white/70 hover:text-white"
                      }`}
                    >
                      My Account
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => switchTab("login")}
                        className={`border-b-2 pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                          activeTab === "login" ? "border-white text-white" : "border-transparent text-white/70 hover:text-white"
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => switchTab("register")}
                        className={`border-b-2 pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                          activeTab === "register" ? "border-white text-white" : "border-transparent text-white/70 hover:text-white"
                        }`}
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Welcome / Registration Success State with Spring Bounce */}
                {welcome && (
                  <motion.div
                    initial={{ scale: 0.6, y: -20, opacity: 0 }}
                    animate={{
                      scale: [0.6, 1.08, 0.97, 1],
                      y: 0,
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 12,
                      bounce: 0.6,
                    }}
                    className="mb-5 flex flex-col items-center justify-center rounded-2xl border border-[#F5C6D5] bg-[#FFF5F8] p-4 text-center shadow-md shadow-[#D6336C]/10"
                  >
                    <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-[#D6336C] text-white shadow-sm">
                      <Sparkles className="size-6 animate-spin-slow" />
                    </div>
                    <p className="text-sm font-black text-gray-900">Welcome to LEIA Beauty Club!</p>
                    <p className="mt-1 text-xs text-gray-600">
                      Here&apos;s your exclusive 15% OFF welcome discount code:
                    </p>
                    <span className="mt-2 inline-block rounded-xl border border-[#D6336C]/30 bg-white px-3 py-1 font-mono text-sm font-black tracking-wider text-[#D6336C]">
                      HELLO15
                    </span>
                  </motion.div>
                )}

                {/* TAB 1: Logged-in Account View */}
                {activeTab === "account" && profile && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border-2 border-[#D6336C] bg-[#FFF5F8] text-[#D6336C] shadow-sm">
                        <User className="size-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Welcome back, {profile.full_name}!</h3>
                      <p className="text-xs text-gray-500">{profile.phone}</p>
                    </div>

                    <div className="rounded-2xl border border-[#F5C6D5] bg-[#FFF5F8] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#D6336C]">
                          Order History
                        </p>
                        <span className="text-[10px] font-semibold text-gray-500">
                          {orders.length} order{orders.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {orders.length > 0 ? (
                        <div className="max-h-52 space-y-2.5 overflow-y-auto pr-1">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between rounded-xl bg-white p-3 border border-gray-100 shadow-2xs text-xs"
                            >
                              <div>
                                <span className="font-bold text-gray-900">{order.order_number}</span>
                                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                                  <Calendar className="size-3" />
                                  {new Date(order.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="rounded-full bg-[#FFF0F4] px-2 py-0.5 text-[10px] font-black text-[#D6336C]">
                                  {order.status}
                                </span>
                                <p className="mt-1 font-bold text-gray-900">
                                  Rs. {Number(order.total).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <Package className="mx-auto size-8 text-gray-300 mb-1" />
                          <p className="text-xs text-gray-500">You haven&apos;t placed any orders yet.</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="mx-auto flex items-center gap-1.5 text-xs font-bold text-[#D6336C] hover:underline"
                    >
                      <LogOut className="size-3.5" /> Sign Out
                    </button>
                  </div>
                )}

                {/* TAB 2: Sign In Form */}
                {activeTab === "login" && !profile && (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {lockoutRemaining > 0 && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                        ⏱️ Too many failed sign-in attempts. Cooldown: <strong>{lockoutRemaining}s</strong>
                      </div>
                    )}
                    <Field
                      label="Phone Number"
                      icon={<Phone className="size-4" />}
                      value={phone}
                      onChange={setPhone}
                      placeholder="0300 1234567"
                      type="tel"
                    />
                    <Field
                      label="Password"
                      icon={<Lock className="size-4" />}
                      value={password}
                      onChange={setPassword}
                      placeholder="At least 8 characters"
                      type="password"
                    />
                    <Submit
                      loading={loading}
                      label={lockoutRemaining > 0 ? `Locked (${lockoutRemaining}s)` : "Sign In"}
                    />
                  </form>
                )}

                {/* TAB 3: Create Account Form */}
                {activeTab === "register" && !profile && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <Field
                      label="Full Name"
                      icon={<User className="size-4" />}
                      value={name}
                      onChange={setName}
                      placeholder="Fatima Ahmed"
                    />
                    <Field
                      label="Phone Number"
                      icon={<Phone className="size-4" />}
                      value={phone}
                      onChange={setPhone}
                      placeholder="0300 1234567"
                      type="tel"
                    />
                    <Field
                      label="Password"
                      icon={<Lock className="size-4" />}
                      value={password}
                      onChange={setPassword}
                      placeholder="At least 8 characters"
                      type="password"
                    />
                    <div className="flex items-center gap-2 rounded-xl bg-[#FFF5F8] p-3 text-[11px] text-gray-600">
                      <Sparkles className="size-4 shrink-0 text-[#D6336C]" />
                      <span>
                        Instant 15% OFF discount code: <strong>HELLO15</strong>
                      </span>
                    </div>
                    <Submit loading={loading} label="Create LEIA Account" />
                  </form>
                )}

                {/* Inline Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-red-600"
                  >
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  icon?: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-gray-700">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        )}
        <input
          type={type}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 py-2.5 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-[#D6336C] ${
            icon ? "pl-10" : "pl-4"
          }`}
        />
      </div>
    </div>
  );
}

function Submit({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D6336C] py-3 text-sm font-bold text-white shadow-md shadow-[#D6336C]/30 transition-all hover:bg-[#b82a5b] disabled:opacity-60"
    >
      {loading ? (
        "Please wait..."
      ) : (
        <>
          {label} <ArrowRight className="size-4" />
        </>
      )}
    </button>
  );
}

