"use client";
import { Link } from "@tanstack/react-router";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useWishlist } from "@/components/wishlist-context";
import { useCart } from "@/components/cart-context";
import { formatPKR, type Product } from "@/data/catalog";

export function WishlistDrawer() {
  const { isWishlistOpen, closeWishlist, wishlistProducts, toggleWishlist, wishlistCount } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (product: Product) => {
    addItem(product);
    toggleWishlist(product.id);
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F5C6D5] px-6 py-5 bg-[#FFF5F8]">
              <div className="flex items-center gap-2">
                <Heart className="size-5 text-[#D6336C] fill-[#D6336C]" />
                <h2 className="font-bold text-lg text-gray-900">Your Saved Favorites</h2>
                <span className="rounded-full bg-[#D6336C] px-2.5 py-0.5 text-xs font-black text-white">
                  {wishlistCount}
                </span>
              </div>
              <button
                onClick={closeWishlist}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlistProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-[#FFF5F8] p-5 mb-4 border border-[#F5C6D5]">
                    <Heart className="size-10 text-[#D6336C]" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Your Wishlist is Empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs mt-1 mb-6">
                    Tap the heart icon on any cosmetic item to save your favorite lipsticks, serums, and eye palettes.
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeWishlist}
                    className="bg-[#D6336C] hover:bg-[#b82a5b] text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 py-3 transition-all shadow-md shadow-[#D6336C]/30"
                  >
                    Explore Shop
                  </Link>
                </div>
              ) : (
                wishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 border border-gray-100 rounded-2xl p-4 bg-white hover:border-[#F5C6D5] transition-all shadow-xs group"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="size-20 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#D6336C] uppercase tracking-wider">
                            {product.brand}
                          </span>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-[#D6336C] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-sm font-black text-[#D6336C] mt-0.5">
                          {formatPKR(product.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleMoveToCart(product)}
                          className="flex-1 bg-[#D6336C] hover:bg-[#b82a5b] text-white rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="size-3.5" /> Move to Bag
                        </button>
                        <Link
                          to="/product/$productId"
                          params={{ productId: product.id }}
                          onClick={closeWishlist}
                          className="border border-gray-200 hover:border-[#D6336C] text-gray-600 hover:text-[#D6336C] p-2 rounded-xl text-xs font-bold transition-colors"
                          title="View Details"
                        >
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer action */}
            {wishlistProducts.length > 0 && (
              <div className="border-t border-[#F5C6D5] p-6 bg-[#FFF5F8]">
                <button
                  onClick={() => {
                    wishlistProducts.forEach((p) => addItem(p));
                    closeWishlist();
                  }}
                  className="w-full bg-[#D6336C] hover:bg-[#b82a5b] text-white font-bold text-xs uppercase tracking-wider rounded-xl py-3.5 transition-all shadow-md shadow-[#D6336C]/30 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="size-4" /> Add All ({wishlistCount}) Items To Bag
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
