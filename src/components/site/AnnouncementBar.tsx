import { useState, useEffect } from "react";
import { Truck, CreditCard, Gift } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const announcements = [
  { icon: Truck, text: "FREE EXPRESS DELIVERY ON ORDERS OVER PKR 2,500" },
  { icon: CreditCard, text: "CASH ON DELIVERY, JAZZCASH & EASYPAISA ACCEPTED" },
  { icon: Gift, text: "FLAT 15% OFF YOUR FIRST ORDER — CODE: HELLO15" },
];

export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % announcements.length), 3500);
    return () => clearInterval(t);
  }, []);

  const ActiveIcon = announcements[idx].icon;

  return (
    <div className="w-full bg-gradient-to-r from-[#B81D52] via-[#D6336C] to-[#B81D52] bg-[length:200%_100%] animate-gradient text-white text-center py-2.5 px-4 text-xs font-medium tracking-wide relative overflow-hidden z-50">

      {/* Shimmer sweep */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-center justify-center gap-2"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <ActiveIcon className="size-3.5 shrink-0" />
          </motion.div>
          <span>{announcements[idx].text}</span>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
        {announcements.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setIdx(i)}
            animate={{ width: i === idx ? 16 : 6, opacity: i === idx ? 1 : 0.4 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="h-1.5 rounded-full bg-white"
          />
        ))}
      </div>
    </div>
  );
}
