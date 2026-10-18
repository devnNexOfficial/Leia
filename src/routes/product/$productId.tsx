import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronRight,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useCart } from "@/components/cart-context";
import { BounceButton, Reveal, spring } from "../../components/motion";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { formatPKR, type Review, type Shade, type Product } from "@/data/catalog";
import { useStorefrontCatalog, fetchSingleProduct } from "@/components/storefront-catalog-context";
import { siteConfig, siteUrl, defaultOgImage, getCanonicalUrl } from "@/lib/siteConfig";
import { trackMetaEvent } from "@/lib/meta-pixel";

export const Route = createFileRoute("/product/$productId")({
  head: () => ({
    meta: [
      { title: "Product — LEIA Cosmetics" },
      {
        name: "description",
        content:
          "Shop authentic luxury cosmetics from LEIA Pakistan — radiant foundations, botanical serums, and high-pigment palettes.",
      },
      { property: "og:site_name", content: siteConfig.siteName },
      { property: "og:title", content: "Product — LEIA Cosmetics" },
      {
        property: "og:description",
        content: "Shop authentic luxury cosmetics from LEIA Pakistan.",
      },
      { property: "og:type", content: "product" },
      { property: "og:image", content: defaultOgImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: siteConfig.social.twitter },
      { name: "twitter:image", content: defaultOgImage },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = useParams({ from: "/product/$productId" });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ProductDetailContent key={productId} />
      <Footer />
    </div>
  );
}

function ProductDetailContent() {
  const { productId: rawProductId } = useParams({ from: "/product/$productId" });
  const productId = useMemo(() => {
    if (!rawProductId) return "";
    try {
      return decodeURIComponent(rawProductId).trim();
    } catch {
      return rawProductId.trim();
    }
  }, [rawProductId]);

  const { products, loading: catalogLoading, refresh: refreshCatalog } = useStorefrontCatalog();

  // Try matching case-insensitively from loaded catalog
  const catalogProduct = useMemo(() => {
    if (!productId) return undefined;
    const target = productId.toLowerCase();
    return products.find((item) => item.id.toLowerCase() === target);
  }, [products, productId]);

  // Standalone direct single-product fetch fallback
  const [standaloneProduct, setStandaloneProduct] = useState<Product | null>(null);
  const [standaloneLoading, setStandaloneLoading] = useState(false);
  const [fetchAttempt, setFetchAttempt] = useState(0);

  useEffect(() => {
    if (catalogProduct || !productId) {
      setStandaloneLoading(false);
      return;
    }

    let isMounted = true;
    setStandaloneLoading(true);

    fetchSingleProduct(productId)
      .then((item) => {
        if (!isMounted) return;
        setStandaloneProduct(item);
        setStandaloneLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("Direct product fetch failed:", err);
        setStandaloneLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, catalogProduct, fetchAttempt]);

  const product = catalogProduct || standaloneProduct;
  const loading = !product && (catalogLoading || standaloneLoading);
  const { addItem } = useCart();

  // ── ALL HOOKS MUST BE AT THE TOP — before any early returns ──
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedShadeIndex, setSelectedShadeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  // Review form state
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const hasTrackedViewContent = useRef<string | null>(null);

  // Effects — also must be before early returns
  useEffect(() => {
    if (product) {
      if (hasTrackedViewContent.current !== product.id) {
        hasTrackedViewContent.current = product.id;
        trackMetaEvent("ViewContent", {
          content_ids: [product.id],
          content_type: "product",
          value: product.price,
          currency: "PKR",
        });

        if (typeof window !== "undefined") {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "view_item",
            content_ids: [product.id],
            content_name: product.name,
            value: product.price,
            currency: "PKR",
          });
        }
      }

      document.title = `${product.name} — LEIA Cosmetics`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && product.shortDescription) {
        metaDesc.setAttribute("content", product.shortDescription);
      }

      // Update or create canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", getCanonicalUrl(`/product/${product.id}`));

      // Update Open Graph tags dynamically
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", `${product.name} — LEIA Cosmetics`);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", getCanonicalUrl(`/product/${product.id}`));
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && product.image) {
        ogImage.setAttribute(
          "content",
          product.image.startsWith("http") ? product.image : `${siteUrl}${product.image}`,
        );
      }

      // Load reviews from localStorage first, fallback to product reviews
      const saved =
        typeof window !== "undefined" ? localStorage.getItem(`leia_reviews_${product.id}`) : null;
      if (saved) {
        try {
          setReviewsList(JSON.parse(saved));
        } catch {
          setReviewsList(product.reviews || []);
        }
      } else if (product.reviews && product.reviews.length > 0) {
        setReviewsList(product.reviews);
      }

      // Load helpful votes
      if (typeof window !== "undefined") {
        try {
          const savedHelpful = localStorage.getItem("leia_helpful_reviews");
          if (savedHelpful) setHelpfulVotes(JSON.parse(savedHelpful));
        } catch {
          // ignore
        }
      }
    }
    return () => {
      document.title = "LEIA — Authentic Luxury Cosmetics Online Store";
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute("href", siteUrl);
      }
    };
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Related products memo — also must be before early returns
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 3);
  }, [product, products]);

  // ── Early returns AFTER all hooks ──
  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 min-h-[85vh] animate-pulse">
        <div className="h-4 w-48 bg-pink-100/70 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          <div className="aspect-square w-full max-w-[500px] bg-pink-100/50 rounded-3xl border border-[#F5C6D5]/40 mx-auto" />
          <div className="space-y-4 pt-2">
            <div className="h-4 w-24 bg-pink-100/60 rounded-full" />
            <div className="h-8 w-3/4 bg-pink-100/70 rounded-xl" />
            <div className="h-6 w-1/3 bg-pink-100/60 rounded-lg" />
            <div className="h-24 w-full bg-pink-50/70 rounded-2xl border border-pink-100/40" />
            <div className="h-12 w-full bg-pink-100/70 rounded-xl mt-6" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-20 min-h-[60vh] flex flex-col justify-center">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/shop" className="hover:text-gray-900 transition-colors">
            Shop
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-gray-700">Product Not Found</span>
        </nav>

        {/* Friendly Error Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-[#F5C6D5]/80 bg-gradient-to-br from-[#FFE8F0]/60 via-[#FFF6F9] to-[#FFF0F5] p-8 sm:p-14 text-center shadow-xs"
        >
          {/* Ambient Glow Orbs */}
          <div className="pointer-events-none absolute -top-12 -left-12 size-64 rounded-full bg-[#FF80AA]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 size-64 rounded-full bg-[#D6336C]/15 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-md space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-white border border-[#F5C6D5] text-[#D6336C] shadow-sm">
              <ShoppingBag className="size-10 stroke-[1.5]" />
            </div>

            <span className="inline-block rounded-full bg-[#FFF0F5] border border-[#F5C6D5] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#D6336C]">
              404 • Item Unavailable
            </span>

            <h1 className="font-display text-2xl sm:text-3xl font-black text-[#1A0A10] tracking-tight">
              Product Not Found
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              We couldn't locate the product you were looking for. It may have been renamed,
              removed, or is temporarily out of stock.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <BounceButton
                variant="primary"
                onClick={() => {
                  setFetchAttempt((c) => c + 1);
                  refreshCatalog();
                }}
                className="w-full sm:w-auto px-6 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <RefreshCw className="size-3.5" />
                Retry Loading
              </BounceButton>
              <Link to="/shop" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 bg-white font-bold text-xs text-gray-700 hover:border-[#D6336C] hover:text-[#D6336C] transition-all shadow-2xs">
                  Explore Shop Catalog
                </button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 bg-white font-bold text-xs text-gray-700 hover:border-[#D6336C] hover:text-[#D6336C] transition-all shadow-2xs">
                  Return to Home
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  // ── Derived values (not hooks) — safe after early returns ──
  const galleryImages = product.gallery || [product.image];
  const selectedShade: Shade | undefined = product.shades[selectedShadeIndex];
  const availableStock = selectedShade
    ? (selectedShade.stockCount ?? product.stockCount ?? 99)
    : product.stockCount || 99;
  const isOutOfStock = availableStock === 0;
  const hasReviews = reviewsList.length > 0;
  const currentRating = hasReviews
    ? Number((reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1))
    : 0;

  const handleAddToCart = () => {
    addItem(product, selectedShade, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: Review = {
      id: `user-rev-${Date.now()}`,
      author: newAuthor,
      rating: newRating,
      date: "Just now",
      title: newTitle || "Wonderful product!",
      comment: newComment,
      shade: selectedShade?.name || product.shades[0]?.name || "Original",
      verified: true,
    };

    const updated = [newRev, ...reviewsList];
    setReviewsList(updated);
    // Persist reviews to localStorage so they survive refresh
    if (typeof window !== "undefined") {
      localStorage.setItem(`leia_reviews_${product.id}`, JSON.stringify(updated));
    }
    setReviewSubmitted(true);
    window.setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
      setNewAuthor("");
      setNewTitle("");
      setNewComment("");
      setNewRating(5);
    }, 1500);
  };

  const handleHelpful = (revId: string) => {
    setHelpfulVotes((prev) => {
      const next = { ...prev, [revId]: !prev[revId] };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("leia_helpful_reviews", JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 md:py-12">
      {/* Product JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.image
              ? product.image.startsWith("http")
                ? product.image
                : `${siteUrl}${product.image}`
              : defaultOgImage,
            description:
              product.shortDescription ||
              product.fullDescription ||
              `Buy ${product.name} at Leia Cosmetics. Authentic luxury cosmetics in Pakistan.`,
            brand: {
              "@type": "Brand",
              name: product.brand || "Leia Cosmetics",
            },
            offers: {
              "@type": "Offer",
              url: getCanonicalUrl(`/product/${product.id}`),
              priceCurrency: "PKR",
              price: product.price,
              availability:
                availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
            },
            ...(product.rating && product.reviewCount
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: product.rating,
                    reviewCount: Math.max(product.reviewCount, 1),
                  },
                }
              : {}),
          }),
        }}
      />

      {/* Breadcrumb Navigation */}

      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <Link to="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <ChevronRight className="size-3" />
        <span className="hover:text-foreground">{product.category}</span>
        <ChevronRight className="size-3" />
        <span className="font-semibold text-foreground">{product.name}</span>
      </nav>

      {/* Top Product Section */}
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: Gallery */}
        <Reveal className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-soft/40 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={galleryImages[activeImageIndex]}
                alt={product.name}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.8 }}
                transition={spring}
                width={600}
                height={600}
                fetchPriority="high"
                decoding="async"
                className="h-[420px] w-full object-cover sm:h-[500px]"
              />
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
              {product.isBestseller && (
                <span className="rounded-full bg-primary/95 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm backdrop-blur-xs">
                  Bestseller
                </span>
              )}
              {product.isNew && (
                <span className="rounded-full bg-accent/95 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-sm backdrop-blur-xs">
                  New Release
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={
                    "relative size-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all " +
                    (activeImageIndex === idx
                      ? "border-primary shadow-sm ring-2 ring-primary/20"
                      : "border-border/60 opacity-70 hover:opacity-100")
                  }
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </Reveal>

        {/* Right: Product Info & Actions */}
        <Reveal index={1} className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="rounded-md bg-soft px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {product.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {hasReviews ? (
                <>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3.5 ${
                          i < Math.round(currentRating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-amber-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-foreground">{currentRating}</span>
                  <span>
                    ({reviewsList.length} {reviewsList.length === 1 ? "review" : "reviews"})
                  </span>
                </>
              ) : (
                <>
                  <div className="flex text-amber-300/40">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-transparent text-amber-200" />
                    ))}
                  </div>
                  <span className="text-muted-foreground">No reviews yet</span>
                </>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 text-2xl font-bold text-primary">
              {formatPKR(product.price)}
              {product.originalPrice && (
                <span className="ml-3 text-base font-medium text-muted-foreground line-through">
                  {formatPKR(product.originalPrice)}
                </span>
              )}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>

            {/* Tactile Shade Swatches OR Skincare Specs */}
            {product.shades.length > 0 ? (
              <div className="mt-8 border-t border-border/60 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Select Shade:
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {selectedShade?.name}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {product.shades.map((s, idx) => {
                    const isSelected = selectedShadeIndex === idx;
                    return (
                      <motion.button
                        key={s.name}
                        aria-label={s.name}
                        title={s.name}
                        onClick={() => setSelectedShadeIndex(idx)}
                        whileHover={{ scale: 1.2, y: -2 }}
                        whileTap={{ scale: 0.88 }}
                        animate={isSelected ? { scale: [1, 1.25, 0.95, 1.08] } : { scale: 1 }}
                        transition={spring}
                        className={
                          "relative size-9 rounded-full ring-offset-2 ring-offset-card transition-all shadow-xs " +
                          (isSelected
                            ? "ring-2 ring-primary"
                            : "ring-1 ring-border hover:ring-accent")
                        }
                        style={{ backgroundColor: s.hex }}
                      >
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={spring}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Check className="size-4 text-primary-foreground drop-shadow" />
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-8 border-t border-border/60 pt-6 grid grid-cols-2 gap-3">
                {product.size && (
                  <div className="rounded-2xl border border-border/70 bg-soft/50 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Volume / Size
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">{product.size}</p>
                  </div>
                )}
                {product.skinType && (
                  <div className="rounded-2xl border border-border/70 bg-soft/50 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Skin Type
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">{product.skinType}</p>
                  </div>
                )}
                {product.keyBenefit && (
                  <div className="col-span-2 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Key Formulation
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-900">
                      {product.keyBenefit}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Quantity Picker */}
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-1.5 shadow-2xs sm:w-36">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex size-9 items-center justify-center rounded-lg hover:bg-muted text-foreground"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </motion.button>
                <span className="font-semibold text-sm">{quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQuantity((q) => Math.min(q + 1, availableStock))}
                  disabled={quantity >= availableStock}
                  className="flex size-9 items-center justify-center rounded-lg hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </motion.button>
              </div>

              {/* Bounce Add to Cart Button */}
              <BounceButton
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                size="lg"
                className="flex-1 py-4 text-base font-semibold"
              >
                {added ? (
                  <>
                    <Check className="size-5" /> Added {quantity} to cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-5" /> Add to cart •{" "}
                    {formatPKR(product.price * quantity)}
                  </>
                )}
              </BounceButton>
            </div>
          </div>

          {/* Trust strip info */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="size-5 text-primary" />
              <span className="font-medium text-foreground">Free Shipping</span>
              <span>On orders over PKR 5,000</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 border-x border-border/60">
              <ShieldCheck className="size-5 text-primary" />
              <span className="font-medium text-foreground">100% Authentic</span>
              <span>Direct luxury formula</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RefreshCw className="size-5 text-primary" />
              <span className="font-medium text-foreground">Cash on Delivery</span>
              <span>Nationwide delivery</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Below the Fold: Tabs for Description, Reviews */}
      <section className="mt-20 border-t border-border/70 pt-12">
        <div className="flex items-center justify-center gap-4 sm:gap-8 border-b border-border/60 pb-4">
          {(["description", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                "relative font-display text-lg font-bold capitalize transition-colors " +
                (activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground")
              }
            >
              {tab === "reviews" ? `Reviews (${reviewsList.length})` : tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-10 mx-auto max-w-4xl">
          {/* Full Description Tab */}
          {activeTab === "description" && (
            <Reveal className="space-y-6">
              <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-xs">
                <h3 className="font-display text-2xl font-bold text-primary mb-4">
                  The Story & Texture
                </h3>
                <p className="text-base leading-relaxed text-foreground/90">
                  {product.fullDescription}
                </p>
                {product.directions && (
                  <div className="mt-8 border-t border-border/60 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      How to Use
                    </h4>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                      {product.directions}
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <Reveal className="space-y-8">
              {/* Rating summary banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-border/60 bg-card p-8 shadow-xs">
                <div className="text-center sm:text-left">
                  {hasReviews ? (
                    <>
                      <div className="font-display text-5xl font-bold text-primary">
                        {currentRating}
                      </div>
                      <div className="flex text-amber-400 my-2 justify-center sm:justify-start">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-5 ${
                              i < Math.round(currentRating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-transparent text-amber-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Based on {reviewsList.length} customer{" "}
                        {reviewsList.length === 1 ? "review" : "reviews"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="font-display text-3xl font-bold text-foreground">
                        No reviews yet
                      </div>
                      <div className="flex text-amber-300/40 my-2 justify-center sm:justify-start">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-5 fill-transparent text-amber-200" />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        There are no reviews for this product yet.
                      </p>
                    </>
                  )}
                </div>

                <BounceButton onClick={() => setShowReviewForm((v) => !v)} variant="outline">
                  {showReviewForm ? "Close Form" : "Write a Review"}
                </BounceButton>
              </div>

              {/* Review Form Drawer/Modal */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleReviewSubmit}
                    className="rounded-3xl border border-accent/40 bg-card p-6 shadow-md space-y-4 overflow-hidden"
                  >
                    <h3 className="font-display text-xl font-bold text-primary">
                      Share your feedback
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Rating:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="p-1 transition-transform hover:scale-110 active:scale-95"
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            <Star
                              className={`size-7 transition-all duration-150 ${
                                star <= newRating
                                  ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                  : "fill-transparent text-amber-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-amber-500">{newRating}/5</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Review Title (optional)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>

                    <textarea
                      required
                      rows={3}
                      placeholder="Write your review here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground focus:border-accent focus:outline-none"
                    />

                    <div className="flex items-center justify-between">
                      {reviewSubmitted ? (
                        <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                          <Check className="size-4" /> Review published!
                        </span>
                      ) : (
                        <div />
                      )}
                      <BounceButton type="submit">Submit Review</BounceButton>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-10 text-center">
                    <p className="font-semibold text-foreground text-sm">No customer reviews yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Be the first to share your experience with this product!
                    </p>
                    {!showReviewForm && (
                      <div className="mt-4">
                        <BounceButton size="md" onClick={() => setShowReviewForm(true)}>
                          Write the First Review
                        </BounceButton>
                      </div>
                    )}
                  </div>
                ) : (
                  reviewsList.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-border/60 bg-card p-6 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {rev.author}
                          </span>
                          {rev.verified && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              <Check className="size-3" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{rev.date}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 ${
                                i < rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-transparent text-amber-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-foreground">{rev.title}</span>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                        {rev.comment}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
                        <span>
                          Shade: <strong className="text-foreground">{rev.shade}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleHelpful(rev.id)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            helpfulVotes[rev.id]
                              ? "text-primary font-bold"
                              : "hover:text-foreground"
                          }`}
                        >
                          <ThumbsUp
                            className={`size-3.5 transition-transform active:scale-125 ${helpfulVotes[rev.id] ? "fill-primary text-primary" : ""}`}
                          />
                          <span>Helpful{helpfulVotes[rev.id] ? " (1)" : ""}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-border/70 pt-16">
          <Reveal className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Complete Your Ritual
              </span>
              <h2 className="font-display text-3xl font-bold text-primary">You May Also Love</h2>
            </div>
            <Link to="/shop" className="text-xs font-semibold text-primary hover:underline">
              View Collection →
            </Link>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-3">
            {relatedProducts.map((p, idx) => (
              <Reveal key={p.id} index={idx}>
                <Link to="/product/$productId" params={{ productId: p.id }}>
                  <motion.article
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={spring}
                    className="group overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)] hover:border-accent hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-soft/50 h-56">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className={`h-full w-full object-cover transition-all duration-300 ease-out group-hover:scale-105 ${
                          p.hoverImage ? "opacity-100 group-hover:opacity-0" : ""
                        }`}
                      />
                      {p.hoverImage && (
                        <img
                          src={p.hoverImage}
                          alt={`${p.name} alternate view`}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {p.category}
                      </span>
                      <h3 className="font-display text-lg font-bold text-foreground">{p.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatPKR(p.price)}
                      </p>
                    </div>
                  </motion.article>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
