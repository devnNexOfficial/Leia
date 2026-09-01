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
import { useMemo, useState } from "react";

import { useCart } from "@/components/cart-context";
import { BounceButton, Reveal, spring } from "../../components/motion";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { formatPKR, type Review, type Shade } from "@/data/catalog";
import { useStorefrontCatalog } from "@/components/storefront-catalog-context";

export const Route = createFileRoute("/product/$productId")({
  head: ({ params }) => {
    const prod = { name: "LEIA", shortDescription: `Shop product ${params.productId}` };
    return {
      meta: [
        { title: `${prod.name} — LEIA Cosmetics` },
        { name: "description", content: prod.shortDescription },
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <ProductDetailContent />
        <Footer />
      </div>
  );
}

function ProductDetailContent() {
  const { productId } = useParams({ from: "/product/$productId" });
  const { products, loading } = useStorefrontCatalog();
  const product = useMemo(() => products.find((item) => item.id === productId), [products, productId]);
  const { addItem } = useCart();
  if (loading || !product) return <main className="mx-auto max-w-7xl px-6 py-8 md:py-12" />;

  const galleryImages = product.gallery || [product.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedShadeIndex, setSelectedShadeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "ingredients" | "reviews">("description");

  // Review form state
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const selectedShade: Shade | undefined = product.shades[selectedShadeIndex];
  const isOutOfStock = product.stockCount === 0 || (selectedShade ? selectedShade.stockCount === 0 : false);

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

    setReviewsList([newRev, ...reviewsList]);
    setReviewSubmitted(true);
    window.setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
      setNewAuthor("");
      setNewTitle("");
      setNewComment("");
    }, 1500);
  };

  // Related products
  const relatedProducts = useMemo(() => {
    return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
  }, [product, products]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 md:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3" />
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
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
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-soft px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-foreground">{product.rating}</span>
                <span>({reviewsList.length} reviews)</span>
              </div>
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 text-2xl font-bold text-primary">
              {formatPKR(product.price)}
              {product.originalPrice && <span className="ml-3 text-base font-medium text-muted-foreground line-through">{formatPKR(product.originalPrice)}</span>}
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
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Volume / Size</p>
                    <p className="mt-1 text-sm font-bold text-foreground">{product.size}</p>
                  </div>
                )}
                {product.skinType && (
                  <div className="rounded-2xl border border-border/70 bg-soft/50 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Skin Type</p>
                    <p className="mt-1 text-sm font-bold text-foreground">{product.skinType}</p>
                  </div>
                )}
                {product.keyBenefit && (
                  <div className="col-span-2 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Key Formulation</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-900">{product.keyBenefit}</p>
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
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex size-9 items-center justify-center rounded-lg hover:bg-muted text-foreground"
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
                    <ShoppingBag className="size-5" /> Add to cart • {formatPKR(product.price * quantity)}
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

      {/* Below the Fold: Tabs for Description, Ingredients, Reviews */}
      <section className="mt-20 border-t border-border/70 pt-12">
        <div className="flex items-center justify-center gap-4 sm:gap-8 border-b border-border/60 pb-4">
          {(["description", "ingredients", "reviews"] as const).map((tab) => (
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
                <div className="mt-8 grid gap-6 sm:grid-cols-3 border-t border-border/60 pt-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Finish</h4>
                    <p className="mt-1 text-sm font-semibold text-foreground">Velvet Satin / Lit-From-Within</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Coverage</h4>
                    <p className="mt-1 text-sm font-semibold text-foreground">Buildable Medium to Full</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Wear Time</h4>
                    <p className="mt-1 text-sm font-semibold text-foreground">Up to 12 Hours Transfer-Resistant</p>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* Ingredients Tab */}
          {activeTab === "ingredients" && (
            <Reveal className="space-y-6">
              <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-xs">
                <h3 className="font-display text-2xl font-bold text-primary mb-6">
                  Key Actives & Botanical Formula
                </h3>
                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                  {product.ingredients?.keyActives.map((ka) => (
                    <div key={ka.name} className="rounded-2xl border border-border/70 bg-soft/50 p-4">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Sparkles className="size-4" />
                        <span>{ka.name}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{ka.benefit}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/60 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Full INCI Ingredients List
                  </h4>
                  <p className="text-xs leading-relaxed font-mono text-muted-foreground/90 bg-muted/40 p-4 rounded-xl border border-border/40">
                    {product.ingredientsText ?? product.ingredients?.fullList}
                  </p>
                </div>
              </div>
            </Reveal>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <Reveal className="space-y-8">
              {/* Rating summary banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-border/60 bg-card p-8 shadow-xs">
                <div className="text-center sm:text-left">
                  <div className="font-display text-5xl font-bold text-primary">{product.rating}</div>
                  <div className="flex text-amber-400 my-2 justify-center sm:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Based on {reviewsList.length} customer reviews</p>
                </div>

                <BounceButton
                  onClick={() => setShowReviewForm((v) => !v)}
                  variant="outline"
                >
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
                    <h3 className="font-display text-xl font-bold text-primary">Share your feedback</h3>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="p-1 text-amber-400 hover:scale-115 transition-transform"
                          >
                            <Star className={`size-6 ${star <= newRating ? "fill-amber-400" : "text-muted"}`} />
                          </button>
                        ))}
                      </div>
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
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{rev.author}</span>
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
                            className={`size-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-foreground">{rev.title}</span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-foreground/90">{rev.comment}</p>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
                      <span>Shade: <strong className="text-foreground">{rev.shade}</strong></span>
                      <button className="flex items-center gap-1 hover:text-foreground">
                        <ThumbsUp className="size-3.5" /> Helpful
                      </button>
                    </div>
                  </div>
                ))}
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
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Complete Your Ritual</span>
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
                    <div className="overflow-hidden rounded-xl bg-soft/50">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{p.category}</span>
                      <h3 className="font-display text-lg font-bold text-foreground">{p.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-primary">{formatPKR(p.price)}</p>
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
