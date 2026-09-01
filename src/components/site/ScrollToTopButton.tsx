import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp } from "lucide-react";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.15, y: -3 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-6 z-50 size-12 rounded-full bg-gradient-to-br from-[#D6336C] to-[#B81D52] text-white shadow-xl shadow-[#D6336C]/40 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          {/* Pulse ring */}
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-[#D6336C]"
          />
          <ChevronUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
