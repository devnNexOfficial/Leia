import { useState, useEffect } from "react";
import { Truck, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const announcements = [
  { icon: Truck, text: "FREE EXPRESS DELIVERY ON ORDERS OVER PKR 5000" },
  { icon: CreditCard, text: "CASH ON DELIVERY ACCEPTED NATIONWIDE" },
];

export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % announcements.length), 3500);
    return () => clearInterval(t);
  }, []);

  const ActiveIcon = announcements[idx].icon;

  return (
    <div className="w-full bg-gradient-to-r from-[#B81D52] via-[#D6336C] to-[#B81D52] bg-[length:200%_100%] animate-gradient text-white text-center py-2 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold tracking-wide relative overflow-hidden z-50">
      {/* Shimmer sweep */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center justify-center gap-1.5 px-6 sm:px-0"
        >
          <ActiveIcon className="size-3.5 shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-none">{announcements[idx].text}</span>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators (hidden on smallest mobile screens to prevent overflow) */}
      <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 gap-1">
        {announcements.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setIdx(i)}
            animate={{ width: i === idx ? 16 : 6, opacity: i === idx ? 1 : 0.4 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="h-1.5 rounded-full bg-white"
            aria-label={`Announcement ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
