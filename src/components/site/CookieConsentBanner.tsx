import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const COOKIE_STORAGE_KEY = "leia_cookie_consent_v1";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!consent) {
        // Small delay before showing banner for clean page entrance
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage blocked or unavailable
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, "accepted");
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, "essential_only");
    } catch {}
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          aria-label="Cookie consent banner"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 z-40 sm:left-6 sm:right-auto sm:max-w-md overflow-hidden rounded-2xl border border-[#F5C6D5]/80 bg-white/95 p-4 sm:p-5 shadow-2xl shadow-pink-950/10 backdrop-blur-md"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F5] text-[#D6336C]">
              <Cookie className="size-5" />
            </div>

            <div className="flex-1 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">Cookie Preferences</h4>
                <button
                  onClick={handleDecline}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:hidden"
                  aria-label="Close cookie banner"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-1 leading-relaxed text-gray-600">
                We use cookies to save your cart, personalize your beauty shopping experience, and deliver fast checkout. Learn more in our{" "}
                <Link
                  to="/cookie-policy"
                  className="font-semibold text-[#D6336C] underline underline-offset-2 hover:text-[#b82a5b]"
                >
                  Cookie Policy
                </Link>
                .
              </p>

              <div className="mt-3.5 flex items-center gap-2.5">
                <button
                  onClick={handleAccept}
                  className="flex-1 rounded-xl bg-[#D6336C] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#b82a5b] active:scale-95"
                >
                  Accept All
                </button>
                <button
                  onClick={handleDecline}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95"
                >
                  Essential Only
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
