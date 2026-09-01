import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import heroKylie from "@/assets/hero-kylie.png";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const spring = { type: "spring" as const, stiffness: 400, damping: 20 };

export function Hero() {
  const [banner, setBanner] = useState<{ image_url: string; link_url: string | null } | null>(null);
  useEffect(() => { const client = supabase; if (!client) return; const load = async () => { const { data } = await client.from("banners").select("image_url,link_url").eq("placement", "homepage_hero").eq("is_active", true).order("display_order", { ascending: true, nullsFirst: false }).order("created_at").limit(1).maybeSingle(); setBanner(data); }; load(); const channel = client.channel("homepage-hero-banner").on("postgres_changes", { event: "*", schema: "public", table: "banners" }, load).subscribe(); return () => { client.removeChannel(channel); }; }, []);
  return (
    <section className="relative overflow-hidden min-h-[500px] md:min-h-[580px] flex items-center bg-[#F7A1B8]">

      {/* ── Animated background orbs ── */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-60px] left-[-60px] w-72 h-72 rounded-full bg-[#FF80AB]/40 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-80px] right-[5%] w-96 h-96 rounded-full bg-[#B81D52]/30 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [-20, 20, -20], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[30%] left-[45%] w-48 h-48 rounded-full bg-[#FFB3C6]/40 blur-2xl pointer-events-none"
      />

      {/* ── Floating sparkle dots ── */}
      {[
        { top: "12%", left: "8%", size: 8, delay: 0 },
        { top: "70%", left: "3%", size: 6, delay: 1 },
        { top: "25%", left: "38%", size: 10, delay: 0.5 },
        { top: "80%", left: "55%", size: 7, delay: 1.5 },
        { top: "10%", left: "60%", size: 5, delay: 2 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          animate={{ y: [-8, 8, -8], opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
          transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
          className="absolute rounded-full bg-white/70 pointer-events-none"
          style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
        />
      ))}

      {/* ── Rotating ring behind headline ── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute left-[2%] top-[15%] w-24 h-24 rounded-full border-2 border-dashed border-white/30 pointer-events-none"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute left-[4%] top-[17%] w-14 h-14 rounded-full border border-white/20 pointer-events-none"
      />

      {/* ── Background Model Image ── */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
      >
        <img
          src={banner?.image_url || heroKylie}
          alt="LEIA Beauty Model"
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover object-right md:object-right-top"
        />
      </motion.div>

      {/* ── Gradient Overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F7A1B8] via-[#F7A1B8]/95 to-transparent md:via-[#F7A1B8]/75 w-full md:w-3/5 pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-24 w-full">
        <div className="max-w-xl">

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.25 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1F0A14] leading-[1.08] tracking-tight mb-5 drop-shadow-2xs"
          >
            Define Your <br />
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.4 }}
              className="text-[#B81D52] bg-gradient-to-r from-[#B81D52] via-[#D6336C] to-[#A01443] bg-clip-text text-transparent animate-gradient"
            >
              Signature Look.
            </motion.span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.5 }}
            className="text-[#2D0D1E] text-base md:text-lg mb-8 font-semibold max-w-md leading-relaxed"
          >
            Discover 100% authentic cosmetics curated for every Pakistani skin tone. Premium velvets, glowing serums, and rich palettes — delivered straight to your door.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.65 }}
            className="flex flex-wrap items-center gap-4"
          >
            <a href={banner?.link_url || "/shop"}>
              <motion.button
                whileHover={{ scale: 1.06, y: -3, boxShadow: "0 20px 40px rgba(214,51,108,0.5)" }}
                whileTap={{ scale: 0.94 }}
                transition={spring}
                className="relative group overflow-hidden bg-gradient-to-r from-[#8E0E38] via-[#D6336C] to-[#FF528C] text-white font-black text-sm tracking-wide rounded-full px-8 py-4 flex items-center gap-2.5 shadow-xl shadow-[#D6336C]/40"
              >
                {/* Shimmer on hover */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </span>
                <span className="relative z-10 flex items-center gap-2.5">
                  Explore Collection
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="size-4" />
                  </motion.span>
                </span>
              </motion.button>
            </a>

            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: 0.8 }}
              className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-full px-4 py-2 text-xs font-bold text-[#1F0A14]"
            >
              <div className="flex -space-x-1.5">
                {["#D6336C", "#FF6B9D", "#B81D52"].map((c, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="size-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-black"
                    style={{ backgroundColor: c }}
                  >
                    {["A", "F", "M"][i]}
                  </motion.div>
                ))}
              </div>
              50,000+ happy customers
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.9 }}
            className="flex gap-6 mt-8"
          >
            {[
              { val: "500+", label: "Products" },
              { val: "4.8★", label: "Rating" },
              { val: "24h", label: "Delivery" },
            ].map(({ val, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.9 + i * 0.1 }}
                whileHover={{ y: -3, scale: 1.05 }}
                className="text-center"
              >
                <p className="text-xl font-black text-[#1F0A14]">{val}</p>
                <p className="text-[10px] font-bold text-[#2D0D1E]/70 uppercase tracking-wider">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Bottom transition ── */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#FFF5F8] to-transparent pointer-events-none" />
    </section>
  );
}
