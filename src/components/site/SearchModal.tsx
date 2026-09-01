"use client";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, Sparkles, ArrowRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatPKR } from "@/data/catalog";
import { useCart } from "@/components/cart-context";
import { useStorefrontCatalog } from "@/components/storefront-catalog-context";

const popularTags = [
  "Skin Tint Foundation",
  "Rivaj UK Foundation",
  "Vitamin C Serum",
  "Eyeshadow Palette",
  "Glow Highlighter",
  "Rose Water Toner",
];

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();
  const { products } = useStorefrontCatalog();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
          />

          {/* Search Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#F5C6D5] shadow-2xl overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-5 py-6">
              {/* Top Search Input */}
              <div className="relative flex items-center gap-3 border-b-2 border-[#D6336C] pb-3">
                <Search className="size-6 text-[#D6336C] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search lipsticks, serums, eyeshadow palettes, brands..."
                  className="w-full text-lg md:text-xl font-medium text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full px-3 py-1 text-xs font-bold transition-colors shrink-0"
                >
                  ESC
                </button>
              </div>

              {/* Popular Searches */}
              {!query && (
                <div className="pt-6 pb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-[#D6336C]" /> Trending Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="bg-[#FFF5F8] hover:bg-[#FFF0F4] text-gray-700 hover:text-[#D6336C] border border-[#F5C6D5] rounded-full px-4 py-1.5 text-xs font-semibold transition-all shadow-2xs hover:scale-105"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Search Results */}
              {query && (
                <div className="py-6 max-h-[60vh] overflow-y-auto">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    {searchResults.length > 0
                      ? `Found ${searchResults.length} match${searchResults.length === 1 ? "" : "es"}`
                      : "No products found"}
                  </p>

                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-4 border border-gray-100 hover:border-[#F5C6D5] rounded-2xl p-3 bg-white hover:shadow-md transition-all group"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="size-16 object-cover rounded-xl shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6336C]">
                              {product.brand} • {product.category}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#D6336C] transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
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
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => {
                                addItem(product);
                                onClose();
                              }}
                              className="bg-[#D6336C] hover:bg-[#b82a5b] text-white p-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:scale-105"
                              title="Add to Cart"
                            >
                              <ShoppingBag className="size-4" />
                            </button>
                            <Link
                              to="/product/$productId"
                              params={{ productId: product.id }}
                              onClick={onClose}
                              className="border border-gray-200 hover:border-[#D6336C] text-gray-600 hover:text-[#D6336C] p-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                              title="View Details"
                            >
                              <ArrowRight className="size-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Sparkles className="size-10 text-[#D6336C] mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-700">No matching cosmetics found for "{query}"</p>
                      <p className="text-xs text-gray-400 mt-1">Try searching for "Lipstick", "Rivaj", or "Serum"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
