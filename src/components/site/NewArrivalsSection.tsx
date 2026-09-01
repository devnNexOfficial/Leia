"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPKR } from "@/data/catalog";
import { useCart } from "@/components/cart-context";
import { useStorefrontCatalog } from "@/components/storefront-catalog-context";

export function NewArrivalsSection() {
  const { addItem } = useCart();
  const { products } = useStorefrontCatalog();
  const newArrivals = useMemo(
    () => products.filter((product) => product.isNew),
    [products]
  );
  const allProducts = useMemo(
    () =>
      newArrivals.length >= 3
        ? newArrivals
        : [...newArrivals, ...newArrivals, ...newArrivals],
    [newArrivals]
  );
  const [current, setCurrent] = useState(0);
  const total = allProducts.length;

  useEffect(() => {
    if (total === 0) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % total), 3500);
    return () => clearInterval(t);
  }, [total]);

  if (newArrivals.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const getPos = (i: number) => {
    const diff = ((i - current) % total + total) % total;
    if (diff === 0) return "center";
    if (diff === 1) return "right";
    if (diff === total - 1) return "left";
    return "hidden";
  };

  const centerProduct = allProducts[current];

  return (
    <section className="py-20 px-5 md:px-8 bg-white overflow-hidden select-none">
      <div className="mx-auto max-w-6xl">
        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-widest mb-2">
            NEW ARRIVALS
          </h2>
          <p className="text-xs md:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Take your pick from our selection of the newest styles of the season.
          </p>
        </motion.div>

        {/* 3D Floating Carousel Area */}
        <div className="relative flex items-center justify-center min-h-[380px] md:min-h-[420px]">
          {/* Left Arrow Button */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-2 md:left-6 z-30 size-10 md:size-11 rounded-full bg-gray-200/70 hover:bg-gray-300/90 text-gray-700 flex items-center justify-center transition-all shadow-sm"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Floating Products Container */}
          <div className="relative w-full max-w-4xl h-[340px] md:h-[380px] flex items-center justify-center">
            {allProducts.map((product, i) => {
              const pos = getPos(i);
              if (pos === "hidden") return null;

              const isCenter = pos === "center";
              const isLeft = pos === "left";

              return (
                <div
                  key={`${product.id}-${i}`}
                  className={`absolute top-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out cursor-pointer ${
                    isCenter
                      ? "z-20 scale-110 opacity-100 translate-x-0"
                      : isLeft
                      ? "z-10 scale-75 opacity-40 -translate-x-[75%] md:-translate-x-[110%] blur-[0.5px]"
                      : "z-10 scale-75 opacity-40 translate-x-[75%] md:translate-x-[110%] blur-[0.5px]"
                  }`}
                  onClick={() => setCurrent(i)}
                >
                  {/* Floating Product Image with Bounce on Center */}
                  <div className={`relative ${isCenter ? "animate-bounce-gentle" : ""}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="h-44 md:h-56 max-w-[240px] md:max-w-[300px] object-contain filter drop-shadow-xl"
                    />

                    {/* Realistic Floating Oval Shadow */}
                    <div
                      className={`mx-auto rounded-[50%] bg-black/20 blur-md transition-all duration-700 ${
                        isCenter
                          ? "w-40 md:w-52 h-4 md:h-5 mt-4"
                          : "w-28 md:w-36 h-3 mt-2 opacity-60"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-2 md:right-6 z-30 size-10 md:size-11 rounded-full bg-gray-200/70 hover:bg-gray-300/90 text-gray-700 flex items-center justify-center transition-all shadow-sm"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Center Item Details */}
        {centerProduct && (
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="text-center mt-2 flex flex-col items-center"
          >
            <h3 className="text-sm md:text-base font-bold text-gray-900 tracking-wide">
              {centerProduct.name}
            </h3>
            <p className="text-sm font-extrabold text-gray-900 mt-1">
              {formatPKR(centerProduct.price)}
            </p>
            <div className="mt-5">
              <motion.button
                whileHover={{ scale: 1.07, y: -3, backgroundColor: "#D6336C" }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 400, damping: 16 }}
              onClick={() => addItem(centerProduct)}
                className="bg-[#1A0A10] text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-full shadow-md"
              >
                SHOP NOW
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Bottom Horizontal Line Indicators (Oakley style) */}
        <div className="flex justify-center items-center gap-1.5 mt-10">
          {allProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-0.5 transition-all duration-300 rounded-full ${
                idx === current ? "w-8 bg-gray-900" : "w-6 bg-gray-200 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
