import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { categories as fallbackCategories, type Category, type Product } from "@/data/catalog";
import { supabase } from "@/lib/supabase";

export type DatabaseProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_count: number;
  image_url: string | null;
  image_urls: string[];
  ingredients: string | null;
  directions: string | null;
  created_at: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  new_arrival_order: number | null;
  categories: { name: string } | null;
  product_variants: {
    id: string;
    name: string;
    stock_count: number;
    price_override: number | null;
    image_url: string | null;
  }[];
};

export type DatabaseCategory = {
  id: string;
  name: string;
  image_url: string | null;
  description: string | null;
  display_order: number | null;
  created_at: string;
};

export type StorefrontCatalog = {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const StorefrontCatalogContext = createContext<StorefrontCatalog | null>(null);

const swatchColors = ["#D6336C", "#B4566E", "#D9A2A2", "#C05C79", "#9B6B7A", "#E4C9A5", "#451A03"];
const fallbackImage =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80";

const CACHE_KEY_PRODUCTS = "leia_cached_storefront_products_v1";
const CACHE_KEY_CATEGORIES = "leia_cached_storefront_categories_v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh window

let inMemoryProductsCache: Product[] | null = null;
let inMemoryCategoriesCache: Category[] | null = null;
let lastFetchTimestamp = 0;
const singleProductCache = new Map<string, { product: Product; fetchedAt: number }>();

export function mapProduct(product: DatabaseProduct): Product {
  const variants = product.product_variants ?? [];
  return {
    id: product.id,
    name: product.name,
    brand: "LEIA",
    category: product.categories?.name ?? "Uncategorized",
    price: Number(product.price),
    originalPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
    image: product.image_url ?? product.image_urls?.[0] ?? fallbackImage,
    hoverImage:
      product.image_urls?.[1] &&
      product.image_urls[1] !== (product.image_url ?? product.image_urls?.[0])
        ? product.image_urls[1]
        : undefined,
    gallery: product.image_urls?.length ? product.image_urls : undefined,
    shades: variants.map((variant, index) => ({
      id: variant.id,
      name: variant.name,
      hex: swatchColors[index % swatchColors.length],
      stockCount: variant.stock_count,
      priceOverride: variant.price_override,
    })),
    dateAdded: product.created_at,
    rating: 0,
    reviewCount: 0,
    shortDescription: product.description ?? undefined,
    fullDescription: product.description ?? undefined,
    directions: product.directions ?? undefined,
    isBestseller: product.is_featured,
    isNew: product.is_new_arrival,
    stockCount: variants.length
      ? variants.reduce((total, variant) => total + variant.stock_count, 0)
      : product.stock_count,
  };
}

export function mapCategory(category: DatabaseCategory, products: Product[]): Category {
  const fallback = fallbackCategories.find(
    (item) => item.name.toLowerCase() === category.name.toLowerCase(),
  );
  return {
    slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: category.name,
    blurb:
      category.description ??
      fallback?.blurb ??
      `Explore our ${category.name.toLowerCase()} collection.`,
    count: products.filter((product) => product.category === category.name).length,
    image: category.image_url ?? fallback?.image ?? fallbackImage,
  };
}

export async function fetchSingleProduct(productId: string): Promise<Product | null> {
  const client = supabase;
  if (!client || !productId) return null;

  const cleanId = productId.trim().toLowerCase();
  const cached = singleProductCache.get(cleanId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.product;
  }

  try {
    const { data, error } = await client
      .from("products")
      .select(
        "id,name,description,price,compare_at_price,stock_count,image_url,image_urls,ingredients,directions,created_at,is_featured,is_new_arrival,new_arrival_order,categories(name),product_variants(id,name,stock_count,price_override,image_url)",
      )
      .ilike("id", cleanId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const mapped = mapProduct(data as unknown as DatabaseProduct);
    singleProductCache.set(cleanId, { product: mapped, fetchedAt: Date.now() });
    return mapped;
  } catch (err) {
    console.warn("fetchSingleProduct error:", err);
    return null;
  }
}

export function StorefrontCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (inMemoryProductsCache && inMemoryProductsCache.length > 0) {
      return inMemoryProductsCache;
    }
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY_PRODUCTS);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            inMemoryProductsCache = parsed;
            return parsed;
          }
        }
      } catch {
        // ignore parse error
      }
    }
    return [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    if (inMemoryCategoriesCache && inMemoryCategoriesCache.length > 0) {
      return inMemoryCategoriesCache;
    }
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY_CATEGORIES);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            inMemoryCategoriesCache = parsed;
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return fallbackCategories;
  });

  const [loading, setLoading] = useState(() => {
    if (inMemoryProductsCache && inMemoryProductsCache.length > 0) return false;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY_PRODUCTS);
        if (cached && JSON.parse(cached)?.length > 0) return false;
      } catch {
        // ignore
      }
    }
    return true;
  });

  const [error, setError] = useState<string | null>(null);

  const load = async (retryCount = 0, force = false) => {
    // Stale-while-revalidate: Skip refetch if already fresh in memory unless forced
    if (
      !force &&
      inMemoryProductsCache &&
      inMemoryProductsCache.length > 0 &&
      Date.now() - lastFetchTimestamp < CACHE_TTL_MS
    ) {
      setLoading(false);
      return;
    }

    const client = supabase;
    if (!client) {
      setError("Store data is unavailable.");
      setLoading(false);
      return;
    }

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        client
          .from("products")
          .select(
            "id,name,description,price,compare_at_price,stock_count,image_url,image_urls,ingredients,directions,created_at,is_featured,is_new_arrival,new_arrival_order,categories(name),product_variants(id,name,stock_count,price_override,image_url)",
          )
          .eq("is_active", true)
          .order("new_arrival_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false }),
        client
          .from("categories")
          .select("id,name,image_url,description,display_order,created_at")
          .order("display_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true }),
      ]);

      if (productsResult.error) {
        console.warn(
          `[StorefrontCatalog] Products fetch attempt ${retryCount + 1} failed:`,
          productsResult.error.message,
        );
        if (retryCount < 2) {
          setTimeout(
            () => {
              load(retryCount + 1, force);
            },
            (retryCount + 1) * 1000,
          );
          return;
        }
        setError(productsResult.error.message);
        setLoading(false);
        return;
      }

      const rawProducts = (productsResult.data ?? []) as unknown as DatabaseProduct[];
      const mappedProducts = rawProducts.map(mapProduct);
      setProducts(mappedProducts);
      inMemoryProductsCache = mappedProducts;
      lastFetchTimestamp = Date.now();

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(mappedProducts));
        } catch {
          // ignore storage quota
        }
      }

      if (categoriesResult.data && !categoriesResult.error) {
        const rawCats = categoriesResult.data as DatabaseCategory[];
        const mappedCats = rawCats.map((c) => mapCategory(c, mappedProducts));
        setCategories(mappedCats);
        inMemoryCategoriesCache = mappedCats;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify(mappedCats));
          } catch {
            // ignore
          }
        }
      } else if (categories.length === 0) {
        setCategories(fallbackCategories);
      }

      setError(null);
      setLoading(false);
    } catch (err: unknown) {
      console.warn(
        `[StorefrontCatalog] Exception loading catalog (attempt ${retryCount + 1}):`,
        err,
      );
      if (retryCount < 2) {
        setTimeout(
          () => {
            load(retryCount + 1, force);
          },
          (retryCount + 1) * 1000,
        );
        return;
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("storefront-catalog")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () =>
        load(0, true),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "product_variants" }, () =>
        load(0, true),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () =>
        load(0, true),
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const value = useMemo(
    () => ({
      products,
      categories,
      loading,
      error,
      refresh: () => load(0, true),
    }),
    [products, categories, loading, error],
  );

  return (
    <StorefrontCatalogContext.Provider value={value}>{children}</StorefrontCatalogContext.Provider>
  );
}

export function useStorefrontCatalog() {
  const value = useContext(StorefrontCatalogContext);
  if (!value) throw new Error("useStorefrontCatalog must be used within StorefrontCatalogProvider");
  return value;
}
