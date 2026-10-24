"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Product } from "@/data/catalog";
import { useStorefrontCatalog } from "@/components/storefront-catalog-context";

type WishlistContextValue = {
  wishlistIds: string[];
  wishlistCount: number;
  isWishlistOpen: boolean;
  isLoaded: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistProducts: Product[];
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "leia_wishlist_ids";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { products } = useStorefrontCatalog();
  // Start with empty state on SSR & initial client mount (eliminates React error #418)
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state once mounted client-side
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWishlistIds(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Persist only after loading completes so initial empty state does not wipe storage
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds));
      } catch (e) {
        console.error(e);
      }
    }
  }, [wishlistIds, isLoaded]);

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isWishlistOpen,
        isLoaded,
        openWishlist,
        closeWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistProducts,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
