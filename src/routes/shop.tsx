import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronDown,
  Flame,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  X,
  Heart,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { BounceButton } from "../components/motion";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { formatPKR, type Product, type Shade } from "@/data/catalog";
import { useStorefrontCatalog } from "@/components/storefront-catalog-context";

type SortOption = "bestsellers" | "newest" | "price-asc" | "price-desc";

type ShopSearch = {
  category?: string;
  sale?: string;
  search?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    return {
      category: (search.category as string) || undefined,
      sale: (search.sale as string) || undefined,
      search: (search.search as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Shop Luxury Cosmetics — LEIA Pakistan" },
      {
        name: "description",
        content:
          "Browse authentic luxury cosmetics, radiant foundations, botanical serums, and high-pigment eye palettes from LEIA Pakistan. Filter by category, price, and shade.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <div className="min-h-screen bg-[#FFFBFD] text-foreground">
      <Navbar />
      <ShopContent />
      <Footer />
    </div>
  );
}

function ShopContent() {
  const { products, categories } = useStorefrontCatalog();
  const searchParams = Route.useSearch();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<SortOption>("bestsellers");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const sortOptions = [
    { value: "bestsellers", label: "Bestsellers", icon: Flame, color: "text-[#D6336C]" },
    { value: "newest", label: "Newest Arrivals", icon: Sparkles, color: "text-purple-500" },
    { value: "price-asc", label: "Price: Low to High", icon: TrendingUp, color: "text-emerald-500" },
    { value: "price-desc", label: "Price: High to Low", icon: Tag, color: "text-amber-500" },
  ];

  // Synchronize state with URL search params when navigation occurs
  useEffect(() => {
    if (searchParams.category) {
      const match = categories.find(
        (c) =>
          c.name.toLowerCase() === searchParams.category?.toLowerCase() ||
          c.slug.toLowerCase() === searchParams.category?.toLowerCase()
      );
      if (match) {
        setSelectedCategory(match.name);
      } else {
        // Keep navigation filters strict even while a category is missing from
        // the database (for example, /shop?category=Face). Falling back to
        // "All" would incorrectly show products from every category.
        setSelectedCategory(searchParams.category);
      }
    } else {
      setSelectedCategory("All");
    }

    if (searchParams.search) {
      setSearchQuery(searchParams.search);
    }
  }, [categories, searchParams.category, searchParams.search]);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== "All" && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        // Price filter
        if (p.price > maxPrice) {
          return false;
        }
        // Search query
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchCat = p.category.toLowerCase().includes(query);
          const matchBrand = p.brand.toLowerCase().includes(query);
          if (!matchName && !matchCat && !matchBrand) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "newest") return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        // default: bestsellers first then review count
        if (a.isBestseller !== b.isBestseller) return a.isBestseller ? -1 : 1;
        return b.reviewCount - a.reviewCount;
      });
  }, [products, selectedCategory, maxPrice, sortBy, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setMaxPrice(10000);
    setSearchQuery("");
    setSortBy("bestsellers");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* ── Minimal Professional Hero Banner with Floating Ambient Gradients ── */}
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFE8F0] via-[#FFF6F9] to-[#FFF0F5] border border-[#F5C6D5]/80 p-8 sm:p-14 text-center shadow-xs">
        {/* Floating Ambient Color Orbs */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.15, 0.95, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-12 -left-12 size-64 rounded-full bg-gradient-to-br from-[#FF80AA]/30 to-[#D6336C]/25 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -35, 25, 0],
            y: [0, 20, -18, 0],
            scale: [1, 0.92, 1.12, 1],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-12 -right-12 size-72 rounded-full bg-gradient-to-tr from-[#FFB3C6]/40 via-[#FCE7F3]/50 to-[#D6336C]/20 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-white/70 blur-2xl"
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-2xl space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#D6336C]">
            {selectedCategory === "All"
              ? "Luxury Cosmetics & Skincare"
              : `${selectedCategory} Collection`}
          </p>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A0A10]">
            {selectedCategory === "All"
              ? "The Beauty Atelier"
              : selectedCategory === "Face"
              ? "Complexion & Glow"
              : `${selectedCategory} Atelier`}
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-lg mx-auto">
            {selectedCategory === "All"
              ? "Discover authentic cosmetics and botanical skincare crafted to enhance your natural beauty."
              : selectedCategory === "Eyes"
              ? "Ultra-pigmented eyeshadow palettes, precise liners, and defining mascaras."
              : selectedCategory === "Face"
              ? "Breathable foundations, radiant blushes, and luminous highlighters."
              : "Nourishing serums, balancing toners, and restorative botanical moisturizers."}
          </p>
        </div>
      </section>

      {/* ── Search & Filter Controls Toolbar ── */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#F5C6D5]/80 rounded-2xl p-3 sm:p-4 shadow-xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="size-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search serums, foundations, palettes, brands..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-gray-200 bg-[#FFF5F8]/40 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#D6336C] focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto shrink-0">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-3 bg-[#FFF5F8] border border-[#F5C6D5] hover:border-[#D6336C] text-gray-900 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-2xs hover:bg-[#FFF0F4]"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-3.5 text-[#D6336C]" />
                <span className="text-gray-400 font-normal">Sort:</span>
                <span className="text-[#D6336C]">{sortOptions.find((o) => o.value === sortBy)?.label}</span>
              </div>
              <ChevronDown
                className={`size-3.5 text-[#D6336C] transition-transform duration-300 ${
                  sortDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Custom Popover Menu */}
            <AnimatePresence>
              {sortDropdownOpen && (
                <>
                  <div onClick={() => setSortDropdownOpen(false)} className="fixed inset-0 z-20" />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="absolute right-0 top-full mt-2 z-30 w-52 bg-white border border-[#F5C6D5] rounded-2xl shadow-xl overflow-hidden p-1.5 space-y-1"
                  >
                    {sortOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value as SortOption);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-[#D6336C] text-white shadow-xs"
                              : "text-gray-700 hover:bg-[#FFF5F8] hover:text-[#D6336C]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`size-3.5 ${isSelected ? "text-white" : opt.color}`} />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <Check className="size-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Animated Product Cards Grid ── */}
      <section className="w-full min-h-[400px]">
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#F5C6D5] bg-white py-20 px-4 text-center shadow-xs"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-[#FFF0F5] text-[#D6336C] shadow-inner mb-4">
              <Sparkles className="size-8" />
            </div>
            <h3 className="font-display text-2xl font-black text-[#1A0A10]">No matching products found</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Try adjusting your search query, shade selection, or click below to view all items.
            </p>
            <BounceButton onClick={resetFilters} className="mt-6" variant="primary">
              Show All Products
            </BounceButton>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p, i) => (
                <ShopProductCard key={p.id} product={p} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </main>
  );
}

function ShopProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [shadeIndex, setShadeIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.shades[shadeIndex]);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const selectedShade: Shade | undefined = product.shades[shadeIndex];
  const isOutOfStock = product.stockCount === 0 || (selectedShade ? selectedShade.stockCount === 0 : false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.03, 0.2),
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#F5C6D5]/70 bg-white shadow-xs hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#D6336C]/8 hover:border-[#D6336C]/40 transition-all duration-300 ease-out"
    >
      {/* Product Image & Overlay */}
      <Link to="/product/$productId" params={{ productId: product.id }} className="block relative">
        <div className="relative overflow-hidden bg-[#FFF5F8]/60 aspect-square">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
            {product.isBestseller && (
              <span className="rounded-full bg-[#1A0A10] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                HOT
              </span>
            )}
            {product.isNew && (
              <span className="rounded-full bg-[#FF4081] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                NEW
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label="Wishlist"
            className="absolute right-2.5 top-2.5 z-10 size-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xs hover:bg-white text-gray-400 hover:text-[#D6336C] transition-colors"
          >
            <Heart
              className={`size-4 transition-colors duration-200 ${
                isFavorited ? "fill-[#D6336C] text-[#D6336C]" : "group-hover:text-[#D6336C]"
              }`}
            />
          </motion.button>

          {/* Quick Add Overlay on Hover */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out z-10 hidden sm:block">
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md backdrop-blur-md active:scale-[0.97] ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-white/95 text-[#D6336C] hover:bg-[#D6336C] hover:text-white"
              }`}
            >
              {added ? (
                <>
                  <Check className="size-3.5" /> Added to bag
                </>
              ) : (
                <>
                  <Plus className="size-3.5" /> {isOutOfStock ? "Out of stock" : "Quick Add"}
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="font-bold tracking-widest text-[#D6336C] uppercase text-[10px] sm:text-[11px]">{product.brand}</span>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="text-xs">{product.rating}</span>
            <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
          </div>
        </div>

        <Link to="/product/$productId" params={{ productId: product.id }}>
          <h3 className="font-bold text-xs sm:text-sm text-[#1A0A10] hover:text-[#D6336C] transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price Tag */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-black text-[#D6336C]">
            {formatPKR(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPKR(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Swatches (For makeup with shades) OR Skincare/Spec Badges (For skincare & single-shade items) */}
        {product.shades.length > 0 ? (
          <div className="mt-3 pt-2.5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-gray-500 truncate max-w-[120px]">
                {selectedShade?.name}
              </span>
              <span className="text-[9px] text-gray-400">
                {product.shades.length} {product.shades.length === 1 ? "shade" : "shades"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {product.shades.slice(0, 5).map((s, i) => (
                <button
                  key={s.name}
                  aria-label={s.name}
                  title={s.name}
                  onClick={(e) => {
                    e.preventDefault();
                    setShadeIndex(i);
                  }}
                  className={`relative size-4 sm:size-4.5 rounded-full transition-all duration-200 hover:scale-110 ${
                    shadeIndex === i
                      ? "ring-2 ring-[#D6336C] ring-offset-2 scale-105"
                      : "ring-1 ring-gray-200 hover:ring-[#D6336C]"
                  }`}
                  style={{ backgroundColor: s.hex }}
                >
                  {shadeIndex === i && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className="size-2 text-white drop-shadow-xs" />
                    </span>
                  )}
                </button>
              ))}
              {product.shades.length > 5 && (
                <span className="text-[9px] font-bold text-gray-400">+{product.shades.length - 5}</span>
              )}
            </div>
          </div>
        ) : product.category === "Skincare" ? (
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1.5 text-[11px]">
            {product.size && (
              <span className="font-bold text-gray-600 bg-gray-100/80 border border-gray-200/60 px-2 py-0.5 rounded-md text-[10px] shrink-0">
                {product.size}
              </span>
            )}
            <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md truncate max-w-[150px]">
              {product.keyBenefit || product.skinType || "Botanical Formula"}
            </span>
          </div>
        ) : (
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1.5 text-[11px]">
            {product.size && (
              <span className="font-bold text-gray-600 bg-gray-100/80 border border-gray-200/60 px-2 py-0.5 rounded-md text-[10px] shrink-0">
                {product.size}
              </span>
            )}
            <span className="text-[10px] font-medium text-[#D6336C] bg-[#FFF0F5] border border-[#F5C6D5]/60 px-2 py-0.5 rounded-md truncate max-w-[150px]">
              {product.keyBenefit || product.finish || "Signature Beauty"}
            </span>
          </div>
        )}

        {/* Mobile Quick Add Button */}
        <div className="mt-3 sm:hidden pt-2 border-t border-gray-100">
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all duration-200 active:scale-[0.98] ${
              added ? "bg-emerald-600 text-white" : "bg-[#FFF0F5] text-[#D6336C] hover:bg-[#D6336C] hover:text-white"
            }`}
          >
            {added ? <Check className="size-3" /> : <Plus className="size-3" />}
            {added ? "Added" : isOutOfStock ? "Out of stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
