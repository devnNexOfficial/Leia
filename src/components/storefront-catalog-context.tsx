import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { categories as fallbackCategories, type Category, type Product } from "@/data/catalog";
import { supabase } from "@/lib/supabase";

type DatabaseProduct = {
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
  product_variants: { id: string; name: string; stock_count: number; price_override: number | null; image_url: string | null }[];
};

type DatabaseCategory = {
  id: string;
  name: string;
  image_url: string | null;
  description: string | null;
  display_order: number | null;
  created_at: string;
};

type StorefrontCatalog = {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
};

const StorefrontCatalogContext = createContext<StorefrontCatalog | null>(null);

const swatchColors = ["#D6336C", "#B4566E", "#D9A2A2", "#C05C79", "#9B6B7A", "#E4C9A5", "#451A03"];
const fallbackImage = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80";

function mapProduct(product: DatabaseProduct): Product {
  const variants = product.product_variants ?? [];
  return {
    id: product.id,
    name: product.name,
    brand: "LEIA",
    category: product.categories?.name ?? "Uncategorized",
    price: Number(product.price),
    originalPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
    image: product.image_url ?? product.image_urls?.[0] ?? fallbackImage,
    hoverImage: product.image_urls?.[1] && product.image_urls[1] !== (product.image_url ?? product.image_urls?.[0]) ? product.image_urls[1] : undefined,
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
    ingredientsText: product.ingredients ?? undefined,
    directions: product.directions ?? undefined,
    isBestseller: product.is_featured,
    isNew: product.is_new_arrival,
    stockCount: variants.length ? variants.reduce((total, variant) => total + variant.stock_count, 0) : product.stock_count,
  };
}

function mapCategory(category: DatabaseCategory, products: Product[]): Category {
  const fallback = fallbackCategories.find((item) => item.name.toLowerCase() === category.name.toLowerCase());
  return {
    slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: category.name,
    blurb: category.description ?? fallback?.blurb ?? `Explore our ${category.name.toLowerCase()} collection.`,
    count: products.filter((product) => product.category === category.name).length,
    image: category.image_url ?? fallback?.image ?? fallbackImage,
  };
}

export function StorefrontCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setError("Store data is unavailable.");
      setLoading(false);
      return;
    }

    const load = async () => {
      const [productsResult, categoriesResult] = await Promise.all([
        client
          .from("products")
          .select(
            "id,name,description,price,compare_at_price,stock_count,image_url,image_urls,ingredients,directions,created_at,is_featured,is_new_arrival,new_arrival_order,categories(name),product_variants(id,name,stock_count,price_override,image_url)"
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

      if (productsResult.error || categoriesResult.error) {
        setError(productsResult.error?.message ?? categoriesResult.error?.message ?? "Could not load store data.");
        setLoading(false);
        return;
      }

      const mappedProducts = ((productsResult.data ?? []) as unknown as DatabaseProduct[]).map(mapProduct);
      setProducts(mappedProducts);
      setCategories(((categoriesResult.data ?? []) as DatabaseCategory[]).map((c) => mapCategory(c, mappedProducts)));
      setError(null);
      setLoading(false);
    };

    load();

    const channel = client
      .channel("storefront-catalog")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_variants" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, load)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const value = useMemo(
    () => ({ products, categories, loading, error }),
    [products, categories, loading, error]
  );

  return <StorefrontCatalogContext.Provider value={value}>{children}</StorefrontCatalogContext.Provider>;
}

export function useStorefrontCatalog() {
  const value = useContext(StorefrontCatalogContext);
  if (!value) throw new Error("useStorefrontCatalog must be used within StorefrontCatalogProvider");
  return value;
}
