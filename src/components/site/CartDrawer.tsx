import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";

import { useCart } from "@/components/cart-context";
import { BounceButton, spring } from "../motion";
import { formatPKR } from "@/data/catalog";

export function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  const freeShippingThreshold = 5000;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={spring}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-card shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border/70 px-6 py-5 bg-soft/30">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShoppingBag className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-primary leading-tight">
                    Shopping Bag
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {count} {count === 1 ? "item" : "items"} in your cart
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeDrawer}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close cart drawer"
              >
                <X className="size-5" />
              </motion.button>
            </div>

            {/* Free Shipping Progress Strip */}
            {items.length > 0 && (
              <div className="border-b border-border/60 bg-soft/20 px-6 py-3">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Truck className="size-3.5 text-primary" />
                    {amountNeededForFreeShipping === 0
                      ? "You unlocked FREE Express Shipping!"
                      : `Add ${formatPKR(amountNeededForFreeShipping)} more for FREE Shipping`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-soft">
                    <ShoppingBag className="size-8 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                    Your bag is empty
                  </h3>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Looks like you haven't added any luxury cosmetics yet.
                  </p>
                  <BounceButton onClick={closeDrawer} className="mt-6" variant="outline">
                    Start Shopping
                  </BounceButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-border/60 bg-card p-3 shadow-2xs transition-all hover:border-accent/40"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="size-20 rounded-lg object-cover"
                      />

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="line-clamp-1 font-bold text-sm text-foreground">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                              title="Remove item"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          {item.shade && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span
                                className="size-2.5 rounded-full border border-border"
                                style={{ backgroundColor: item.shade.hex }}
                              />
                              <span>{item.shade.name}</span>
                            </div>
                          )}

                          <div className="mt-1 font-semibold text-xs text-primary">
                            {formatPKR(item.price)}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-border bg-background">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-muted-foreground hover:text-foreground"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>

                          <span className="font-bold text-xs text-foreground">
                            {formatPKR(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {items.length > 0 && (
              <div className="border-t border-border/60 bg-card p-6 shadow-lg space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">{formatPKR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-semibold text-foreground">
                      {subtotal >= freeShippingThreshold ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        formatPKR(250)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-primary border-t border-border/60 pt-2">
                    <span>Total</span>
                    <span>{formatPKR(subtotal + (subtotal >= freeShippingThreshold ? 0 : 250))}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeDrawer();
                    setTimeout(() => {
                      window.location.href = "/checkout";
                    }, 50);
                  }}
                  className="block w-full"
                >
                  <BounceButton size="lg" className="w-full py-4 text-base font-semibold">
                    Proceed to checkout <ChevronRight className="size-4" />
                  </BounceButton>
                </button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      closeDrawer();
                      // Small delay to allow the drawer to close without blocking the navigation
                      setTimeout(() => {
                        window.location.href = "/cart";
                      }, 50);
                    }}
                    className="link-bounce text-xs font-semibold text-primary inline-block cursor-pointer"
                  >
                    View detailed cart page →
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
