"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Play, Pause, Volume2, VolumeX, Sparkles, ShoppingBag, X } from "lucide-react";
import { formatPKR } from "@/data/catalog";
import { useStorefrontCatalog } from "@/components/storefront-catalog-context";
import { useCart } from "@/components/cart-context";
import { supabase } from "@/lib/supabase";

type RawVideo = {
  id: string;
  title: string | null;
  video_url: string;
  thumbnail_url: string | null;
};

type VideoReel = {
  id: string;
  title: string;
  creator: string;
  views: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  productName: string;
  productPrice: number;
  productBrand: string;
};

export function VideoShowcaseSection() {
  const [activeVideo, setActiveVideo] = useState<VideoReel | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const { addItem } = useCart();
  const { products } = useStorefrontCatalog();
  const [rawVideos, setRawVideos] = useState<RawVideo[]>([]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const load = async () => {
      const { data } = await client
        .from("homepage_videos")
        .select("id,title,video_url,thumbnail_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at");

      setRawVideos((data ?? []) as RawVideo[]);
    };

    load();

    const channel = client
      .channel("storefront-videos")
      .on("postgres_changes", { event: "*", schema: "public", table: "homepage_videos" }, load)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const liveReels = useMemo<VideoReel[]>(() => {
    const product = products[0];
    return rawVideos.map((video) => ({
      id: video.id,
      title: video.title || "Beauty Reel",
      creator: "Beauty Reel",
      views: "",
      duration: "",
      thumbnail: video.thumbnail_url || product?.image || "",
      videoUrl: video.video_url,
      productName: product?.name || "",
      productPrice: product?.price || 0,
      productBrand: product?.brand || "LEIA",
    }));
  }, [rawVideos, products]);

  if (liveReels.length === 0) return null;

  return (
    <section className="py-20 px-5 md:px-8 bg-gradient-to-b from-white via-[#FFF5F8] to-white relative overflow-hidden">
      {/* Background ambient animated orb */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.07, 0.14, 0.07] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FF4081] blur-[100px] rounded-full pointer-events-none"
      />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="text-center max-w-xl mx-auto mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 350 }}
            className="inline-flex items-center gap-1.5 bg-[#FFF0F4] border border-[#F5C6D5] px-3.5 py-1 rounded-full text-xs font-bold text-[#D6336C] mb-3"
          >
            <motion.div
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Sparkles className="size-3.5 text-[#D6336C]" />
            </motion.div>
            <span>Watch & Shop Beauty Reels</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1A0A10] leading-tight">
            See The Magic In Action
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            Watch real Pakistani beauty creators demonstrate our bestseller products. Tap any reel to watch and shop!
          </p>
        </motion.div>

        {/* Video Reels Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {liveReels.map((reel, ri) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 30, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: ri * 0.1, type: "spring", stiffness: 280, damping: 20 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => {
                setActiveVideo(reel);
                setIsPlaying(true);
              }}
              className="group relative rounded-3xl overflow-hidden bg-gray-900 border-2 border-[#F5C6D5] hover:border-[#D6336C] shadow-lg hover:shadow-2xl hover:shadow-[#D6336C]/20 transition-colors duration-300 cursor-pointer h-[380px] md:h-[440px] flex flex-col justify-between"
            >
              {/* Thumbnail Image / Preview Video */}
              <img
                src={reel.thumbnail}
                alt={reel.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 group-hover:from-black/95 transition-opacity" />

              {/* Top Bar inside card */}
              <div className="relative z-10 p-4 flex items-center justify-between">
                <span className="bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                  {reel.duration}
                </span>
                <span className="bg-[#D6336C] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <span>âœ¦ REEL</span>
                </span>
              </div>

              {/* Center Play Icon Pulse */}
              <div className="relative z-10 self-center my-auto">
                <div className="size-14 md:size-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[#D6336C] group-hover:border-[#D6336C] transition-all duration-300 shadow-xl">
                  <Play className="size-6 md:size-7 fill-current ml-1" />
                </div>
              </div>

              {/* Bottom Details inside card */}
              <div className="relative z-10 p-4 md:p-5">
                <p className="text-[10px] font-bold text-[#FFB6C1] uppercase tracking-wider mb-1">
                  {reel.creator} Â· {reel.views}
                </p>
                <h3 className="text-sm md:text-base font-black text-white leading-snug line-clamp-2 mb-3">
                  {reel.title}
                </h3>

                {/* Product Tag Box */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-white/70 uppercase">{reel.productBrand}</p>
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{reel.productName}</p>
                  </div>
                  <span className="text-xs font-black text-[#FFB6C1]">{formatPKR(reel.productPrice)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* â”€â”€ Interactive Video Modal Popup â”€â”€ */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-gray-900 rounded-3xl overflow-hidden max-w-sm md:max-w-md w-full border border-white/20 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-30 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
            >
              <X className="size-5" />
            </button>

            {/* Video Player */}
            <div className="relative h-[480px] bg-black">
              <video
                src={activeVideo.videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Video Overlay Controls */}
              <div className="absolute bottom-16 left-3 right-3 z-20 flex items-center justify-between bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-[#FFB6C1] p-1.5 transition-colors"
                >
                  {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 fill-current" />}
                </button>
                <span className="text-xs text-white/80 font-medium truncate max-w-[180px]">
                  {activeVideo.title}
                </span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-[#FFB6C1] p-1.5 transition-colors"
                >
                  {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                </button>
              </div>
            </div>

            {/* Bottom Product Drawer Bar */}
            <div className="p-4 bg-[#1A0A10] border-t border-white/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-[#FFB6C1] uppercase tracking-wider">
                  Featured Product
                </p>
                <p className="text-sm font-black text-white truncate max-w-[180px]">
                  {activeVideo.productName}
                </p>
                <p className="text-xs font-bold text-[#FF4081]">
                  {formatPKR(activeVideo.productPrice)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const product = products.find((item) => item.name === activeVideo.productName);
                    if (product) addItem(product);
                    setActiveVideo(null);
                  }}
                  className="bg-[#D6336C] hover:bg-[#b82a5b] text-white text-xs font-black px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors shadow-lg"
                >
                  <ShoppingBag className="size-3.5" /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
