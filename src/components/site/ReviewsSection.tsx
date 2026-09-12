import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type DisplayReview = {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  text: string;
  shade: string | null;
  product: string | null;
  avatar: string;
};

const DEFAULT_REVIEWS: DisplayReview[] = [
  {
    id: "r1",
    name: "Ayesha M.",
    location: "Lahore",
    rating: 5,
    date: "3 days ago",
    text: "Absolutely obsessed with the Silk Blush Powder! The colour is so natural and it lasted my whole day at the office. Fast delivery and product was 100% genuine. 10/10 would order again!",
    shade: "Peach Flush",
    product: "Silk Blush Powder",
    avatar: "#D6336C",
  },
  {
    id: "r2",
    name: "Fatima Z.",
    location: "Karachi",
    rating: 5,
    date: "1 week ago",
    text: "Rivaj eyeshadow palette is a DREAM. The pigmentation is incredible for this price. Got it for my niece's shaadi and everyone was asking where I bought it from. Packaging is also so pretty!",
    shade: "Champagne Dreams",
    product: "12-Pan Eyeshadow Palette",
    avatar: "#FF6B9D",
  },
  {
    id: "r3",
    name: "Mahnoor S.",
    location: "Islamabad",
    rating: 5,
    date: "2 weeks ago",
    text: "J. Kajal is the only kajal I'll ever use. So black, so smooth, and it stays all day without smudging. I've been buying this for 2 years. The shipping was super fast too!",
    shade: "Jet Black",
    product: "Intense Kajal Eyeliner",
    avatar: "#B81D52",
  },
  {
    id: "r4",
    name: "Hira K.",
    location: "Rawalpindi",
    rating: 5,
    date: "3 weeks ago",
    text: "The Vitamin C serum by Rivaj is amazing! My skin has been so much brighter. I was skeptical at first because it's a Pakistani brand but honestly it's better than expensive imported serums.",
    shade: "30ml",
    product: "Vitamin C Brightening Serum",
    avatar: "#E91E8C",
  },
  {
    id: "r5",
    name: "Sana B.",
    location: "Multan",
    rating: 5,
    date: "1 month ago",
    text: "Luscious foundation matches my skin tone perfectly! Finally a Pakistani brand that caters to wheatish skin. Full coverage, doesn't look cakey. COD was available and delivery was fast.",
    shade: "Warm Caramel",
    product: "Skin Tint Foundation",
    avatar: "#C2185B",
  },
];

export function ReviewsSection() {
  const [reviewsList, setReviewsList] = useState<DisplayReview[]>(DEFAULT_REVIEWS);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("customer_reviews")
          .select("*")
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data && data.length > 0) {
          setReviewsList(
            data.map((r) => ({
              id: r.id,
              name: r.name,
              location: r.location || "Pakistan",
              rating: r.rating || 5,
              date: "Verified Review",
              text: r.review_text,
              shade: r.shade || "Authentic Shade",
              product: r.product_name || "LEIA Cosmetics",
              avatar: r.avatar_color || "#D6336C",
            }))
          );
        }
      } catch {
        // Fallback remains active
      }
    };

    void fetchFeaturedReviews();
  }, []);

  const marqueeReviews = [...reviewsList, ...reviewsList, ...reviewsList];

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 md:px-8 mb-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center mb-4"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xs font-bold text-[#D6336C] uppercase tracking-widest mb-1"
          >
            ✦ Reviews
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
            className="text-3xl md:text-4xl font-black text-[#1A0A10]"
          >
            What Our Customers Say
          </motion.h2>
        </motion.div>

        {/* Overall rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -30 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 400 }}
              >
                <Star className="size-5 fill-amber-400" />
              </motion.div>
            ))}
          </div>
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-black text-gray-900"
          >
            4.9
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-400"
          >
            from 50,000+ happy customers
          </motion.span>
        </motion.div>
      </div>

      {/* Infinite Marquee Auto-Scroll Container */}
      <div className="relative w-full overflow-hidden no-scrollbar py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex gap-5 animate-marquee hover:[animation-play-state:paused]">
          {marqueeReviews.map((rev, index) => (
            <motion.div
              key={`${rev.id}-${index}`}
              onMouseEnter={() => setHovered(`${rev.id}-${index}`)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`shrink-0 w-80 md:w-96 bg-[#FFF5F8] border rounded-2xl p-6 transition-colors duration-300 cursor-default select-none ${
                hovered === `${rev.id}-${index}`
                  ? "border-[#D6336C] shadow-xl shadow-[#D6336C]/15 bg-white"
                  : "border-[#F5C6D5]"
              }`}
            >
              {/* Stars */}
              <div className="flex text-amber-400 mb-3 gap-0.5">
                {[...Array(rev.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-gray-700 leading-relaxed mb-4 min-h-[72px]">
                "{rev.text}"
              </p>

              {/* Product + shade */}
              {rev.product && (
                <div className="bg-white rounded-xl px-3.5 py-2 border border-[#F5C6D5] mb-4 shadow-2xs">
                  <p className="text-[10px] font-black text-[#D6336C] uppercase tracking-wider">
                    {rev.product}
                  </p>
                  {rev.shade && <p className="text-[10px] text-gray-400">Shade: {rev.shade}</p>}
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="size-9 rounded-full flex items-center justify-center text-white text-sm font-black shadow-xs"
                  style={{ backgroundColor: rev.avatar }}
                >
                  {rev.name.charAt(0)}
                </motion.div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{rev.name}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <span>{rev.location}</span> · <span>{rev.date}</span> ·{" "}
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                      <CheckCircle2 className="size-3 text-emerald-600" /> Verified
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
