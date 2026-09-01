"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Star, Heart, ShoppingBag, Search } from "lucide-react";
import { formatPKR } from "@/data/catalog";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { useStorefrontCatalog } from "@/components/storefront-catalog-context";

export function CategoryGrid() {
  const [active, setActive] = useState<string | null>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { categories, products } = useStorefrontCatalog();
  useEffect(() => { if (!active && categories[0]) setActive(categories[0].slug); }, [active, categories]);

  const filteredProducts = useMemo(
    () =>
      active
        ? products.filter(
            (p) =>
              p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === active
          )
        : [],
    [products, active]
  );

  const handleCategoryClick = (slug: string) => {
    if (active === slug) {
      // Keep at least one category always active — don't toggle off
      return;
    }
    setActive(slug);
    // Smooth scroll to products after a tiny delay so state updates first
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const activeCat = useMemo(() => categories.find((c) => c.slug === active), [categories, active]);

  return (
    <section className="py-16 px-5 md:px-8 bg-[#FFF5F8]">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 20 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-bold text-[#D6336C] uppercase tracking-widest mb-1">✦ Browse</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#1A0A10]">Shop By Category</h2>
          <p className="text-sm text-gray-400 mt-1">Tap a category to see all products</p>
        </motion.div>

        {/* ── Circular Category Tabs ── */}
        <div className="flex justify-center gap-6 md:gap-10 mb-12 flex-wrap">
          {categories.map((cat, ci) => {
            const isActive = cat.slug === active;
            return (
              <motion.button
                key={cat.slug}
                initial={{ opacity: 0, y: 20, scale: 0.85 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.1, type: "spring", stiffness: 320, damping: 18 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleCategoryClick(cat.slug)}
                className="flex flex-col items-center gap-3 group"
              >
                {/* Circle */}
                <div
                  className={`relative rounded-full overflow-hidden transition-all duration-300 ${
                    isActive
                      ? "ring-4 ring-[#D6336C] ring-offset-4 ring-offset-[#FFF5F8] shadow-xl shadow-[#D6336C]/30 scale-110"
                      : "ring-2 ring-[#F5C6D5] ring-offset-2 ring-offset-[#FFF5F8] group-hover:ring-[#D6336C] group-hover:scale-105 shadow-md"
                  }`}
                  style={{ width: 96, height: 96 }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Active overlay */}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#D6336C]/20" />
                  )}
                  {/* Pulse ring on active */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-[#D6336C]"
                    />
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className={`text-sm font-black transition-colors ${
                      isActive ? "text-[#D6336C]" : "text-gray-700 group-hover:text-[#D6336C]"
                    }`}
                  >
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{cat.count}+ items</p>
                </div>

                {/* Active dot indicator */}
                <motion.div
                  animate={{ scale: isActive ? 1 : 0 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#D6336C]"
                />
              </motion.button>
            );
          })}
        </div>

        {/* ── Filtered Products Grid ── */}
        <AnimatePresence mode="wait">
        {active && activeCat && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 22 }}
            ref={productsRef}
            className="scroll-mt-24"
          >
            {/* Category header */}
            <div className="flex items-center justify-between mb-6 border-b border-[#F5C6D5] pb-4">
              <div>
                <h3 className="text-xl font-black text-[#1A0A10]">
                  {activeCat.name}
                  <span className="ml-2 text-sm font-medium text-gray-400">
                    ({filteredProducts.length} products)
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{activeCat.blurb}</p>
              </div>
              <Link to="/shop" search={{ category: activeCat.name }} className="text-xs font-bold text-[#D6336C] hover:underline">
                View All {activeCat.name} →
              </Link>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="size-10 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold">No products found in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {filteredProducts.map((product, pi) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: pi * 0.06, type: "spring", stiffness: 280, damping: 20 }}
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 40px rgba(214,51,108,0.15)" }}
                    className="group relative bg-white rounded-2xl border border-[#F5C6D5] overflow-hidden cursor-pointer"
                  >
                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                      {product.isNew && (
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-[#FF4081] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                        >
                          NEW
                        </motion.span>
                      )}
                      {product.isSale && (
                        <motion.span
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="bg-[#D6336C] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                        >
                          SALE
                        </motion.span>
                      )}
                      {product.isBestseller && !product.isNew && !product.isSale && (
                        <span className="bg-[#1A0A10] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          BEST
                        </span>
                      )}
                    </div>

                    {/* Wishlist */}
                    <motion.button
                      whileTap={{ scale: 1.4 }}
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Wishlist"
                      className="absolute top-2.5 right-2.5 z-10 bg-white/90 p-1.5 rounded-full shadow-sm"
                    >
                      <Heart
                        className={`size-4 transition-colors ${
                          isInWishlist(product.id)
                            ? "fill-[#D6336C] text-[#D6336C]"
                            : "text-gray-400"
                        }`}
                      />
                    </motion.button>

                    {/* Image */}
                    <Link to="/product/$productId" params={{ productId: product.id }}>
                      <div className="relative bg-[#FFF5F8] h-44 md:h-52 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-white/95 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={(e) => { e.preventDefault(); addItem(product); }}
                            className="text-xs font-black text-[#D6336C] uppercase tracking-wider flex items-center justify-center gap-1 w-full"
                          >
                            <ShoppingBag className="size-3" /> Quick Add
                          </button>
                        </div>
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-3 md:p-4">
                      <p className="text-[10px] font-bold text-[#D6336C] uppercase tracking-widest mb-1">
                        {product.brand}
                      </p>
                      <Link to="/product/$productId" params={{ productId: product.id }}>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight hover:text-[#D6336C] transition-colors mb-2">
                          {product.name}
                        </h4>
                      </Link>

                      {/* Shades */}
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        {product.shades.slice(0, 5).map((shade) => (
                          <div
                            key={shade.name}
                            title={shade.name}
                            className="size-4 rounded-full border-2 border-white ring-1 ring-gray-200 hover:scale-125 transition-transform cursor-pointer"
                            style={{ backgroundColor: shade.hex }}
                          />
                        ))}
                        {product.shades.length > 5 && (
                          <span className="text-[10px] text-gray-400">+{product.shades.length - 5}</span>
                        )}
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-amber-400">
                          {[...Array(Math.round(product.rating))].map((_, j) => (
                            <Star key={j} className="size-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#D6336C]">
                          {formatPKR(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPKR(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </section>

  );
}
