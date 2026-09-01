import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart-context";
import { BounceButton, Reveal, spring } from "../components/motion";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { formatPKR } from "@/data/catalog";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart — LEIA Cosmetics" },
      { name: "description", content: "Review your selected luxury beauty items and skincare essentials." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <CartPageContent />
        <Footer />
      </div>
  );
}

function CartPageContent() {
  const { items, count, subtotal, updateQuantity, removeItem } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const freeShippingThreshold = 5000;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 250;
  const discountAmount = discountApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discountAmount + shippingFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "MAISON10" || promoCode.trim().length > 0) {
      setDiscountApplied(true);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Reveal className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Your Order
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Shopping Bag ({count})
          </h1>
        </div>
        <Link to="/shop" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" /> Continue Shopping
        </Link>
      </Reveal>

      {items.length === 0 ? (
        /* Friendly Empty State */
        <Reveal className="my-16 text-center">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-soft">
            <ShoppingBag className="size-12 text-primary/70" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold text-primary">
            Your shopping bag is empty
          </h2>
          <p className="mt-3 max-w-md mx-auto text-sm text-muted-foreground leading-relaxed">
            Discover our atelier collection of luxury lipsticks, radiance serums and editorial eye palettes, formulated for warm skin tones.
          </p>
          <div className="mt-8">
            <Link to="/shop">
              <BounceButton size="lg">Browse Shop</BounceButton>
            </Link>
          </div>
        </Reveal>
      ) : (
        /* Full Cart Grid */
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Items List (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Free Shipping Alert Banner */}
            <div className="rounded-2xl border border-border/70 bg-soft/30 p-4">
              <div className="flex items-center gap-3">
                <Truck className="size-5 text-primary flex-shrink-0" />
                <div className="text-xs">
                  {subtotal >= freeShippingThreshold ? (
                    <span className="font-bold text-emerald-800">
                      Congratulations! You unlocked FREE Express Nationwide Shipping.
                    </span>
                  ) : (
                    <span className="text-foreground/90">
                      Add <strong className="text-primary">{formatPKR(freeShippingThreshold - subtotal)}</strong> more to qualify for <strong>FREE Shipping</strong>.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-3xl border border-border/70 bg-card shadow-xs overflow-hidden">
              <div className="divide-y divide-border/60">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, padding: 0 }}
                      transition={spring}
                      className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6"
                    >
                      {/* Image & Title */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="size-24 flex-shrink-0 overflow-hidden rounded-2xl bg-soft/40 border border-border/60">
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                            {item.category}
                          </span>
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {item.name}
                          </h3>
                          {item.shade && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="size-3 rounded-full border border-border" style={{ backgroundColor: item.shade.hex }} />
                              <span>{item.shade.name}</span>
                            </div>
                          )}
                          <span className="mt-1 block text-sm font-semibold text-primary sm:hidden">
                            {formatPKR(item.price)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-border/50 pt-4 sm:pt-0">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-background p-1.5 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-foreground hover:text-primary"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-foreground hover:text-primary"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        {/* Total Price */}
                        <span className="font-bold text-base text-primary hidden sm:block min-w-[100px] text-right">
                          {formatPKR(item.price * item.quantity)}
                        </span>

                        {/* Remove */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Remove item"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="size-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-6">
              <h2 className="font-display text-2xl font-bold text-primary">Order Summary</h2>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (e.g. MAISON10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground uppercase placeholder:normal-case focus:border-accent focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-primary bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Apply
                </button>
              </form>

              {discountApplied && (
                <div className="rounded-xl bg-emerald-100/90 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="size-4 text-emerald-700" />
                  10% First Order Discount Applied! (-{formatPKR(discountAmount)})
                </div>
              )}

              <div className="space-y-3 text-sm border-t border-border/60 pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatPKR(subtotal)}</span>
                </div>

                {discountApplied && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount (10%)</span>
                    <span>-{formatPKR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Shipping</span>
                  <span>{shippingFee === 0 ? "FREE" : formatPKR(shippingFee)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold text-primary border-t border-border/60 pt-3">
                  <span>Total</span>
                  <span>{formatPKR(total)}</span>
                </div>
              </div>

              <Link to="/checkout" className="block">
                <BounceButton
                  size="lg"
                  className="w-full py-4 text-base font-semibold"
                >
                  Proceed to checkout <ChevronRight className="size-4" />
                </BounceButton>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="rounded-2xl border border-border/60 bg-soft/20 p-5 space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                <span>Encrypted & Secure Checkout</span>
              </div>
              <p>We accept Cash on Delivery (COD) nationwide across Pakistan.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
