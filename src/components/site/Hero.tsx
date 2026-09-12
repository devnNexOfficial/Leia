import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import heroKylie from "@/assets/hero-kylie.png";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const spring = { type: "spring" as const, stiffness: 400, damping: 20 };

export function Hero() {
  const [banner, setBanner] = useState<{ image_url: string; link_url: string | null } | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const load = async () => {
      const { data } = await client
        .from("banners")
        .select("image_url,link_url")
        .eq("placement", "homepage_hero")
        .eq("is_active", true)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at")
        .limit(1)
        .maybeSingle();
      setBanner(data);
    };
    load();
    const channel = client
      .channel("homepage-hero-banner")
      .on("postgres_changes", { event: "*", schema: "public", table: "banners" }, load)
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const imageUrl = banner?.image_url || heroKylie;

  return (
    <section className="relative overflow-hidden bg-[#F7A1B8] min-h-[520px] md:min-h-[580px] flex items-center">

      {/* ── Full-bleed background image (mobile + desktop) ── */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
      >
        <img
          src={imageUrl}
          alt="LEIA Beauty Model"
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover object-[70%_15%] md:object-right-top"
        />
        {/* Gradient overlay for text readability (fades out to transparent before model image) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7A1B8] via-[#F7A1B8]/85 to-transparent w-[65%] sm:w-7/12 pointer-events-none" />
      </motion.div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 md:px-8 py-12 sm:py-10 md:py-24 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-8 md:gap-12">

          {/* Left Text Block */}
          <div className="w-full md:max-w-xl text-left">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.25 }}
              className="text-[2.25rem] sm:text-5xl md:text-6xl font-black text-[#1F0A14] leading-[1.08] tracking-tight mb-3 sm:mb-4 drop-shadow-2xs"
            >
              Define Your <br className="inline sm:inline" />
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.4 }}
                className="bg-gradient-to-r from-[#B81D52] via-[#D6336C] to-[#A01443] bg-clip-text text-transparent animate-gradient"
              >
                Signature Look.
              </motion.span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.5 }}
              className="text-[#2D0D1E] text-[13px] sm:text-base md:text-lg mb-5 font-semibold max-w-xs sm:max-w-md leading-relaxed"
            >
              Where authenticity meets elegance. Premium cosmetics, curated for every skin tone delivered straight to your door.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.65 }}
              className="flex items-center"
            >
              <a href={banner?.link_url || "/shop"}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 40px rgba(214,51,108,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={spring}
                  className="relative group overflow-hidden bg-gradient-to-r from-[#8E0E38] via-[#D6336C] to-[#FF528C] text-white font-black text-xs sm:text-sm tracking-wide rounded-full px-7 py-3.5 sm:px-8 sm:py-4 flex items-center justify-center gap-2.5 shadow-lg shadow-[#D6336C]/40"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Collection
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
