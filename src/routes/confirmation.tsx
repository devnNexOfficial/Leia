import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Banknote,
  Check,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useCart } from "@/components/cart-context";
import { BounceButton, Reveal } from "../components/motion";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { formatPKR } from "@/data/catalog";

export const Route = createFileRoute("/confirmation")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — LEIA Cosmetics" },
      { name: "description", content: "Thank you for your order! Your luxury cosmetics purchase is confirmed." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <ConfirmationContent />
        <Footer />
      </div>
  );
}

function ConfirmationContent() {
  const { lastOrder } = useCart();

  // Fallback order details if visited directly
  const order = lastOrder || {
    orderId: "MR-2026-98412",
    customerName: "Valued Customer",
    phone: "0300 1234567",
    address: "House 14, Main Boulevard, Gulberg III",
    city: "Lahore",
    paymentMethod: "Cash on Delivery" as const,
    items: [],
    subtotal: 10350,
    shippingFee: 0,
    discountAmount: 0,
    total: 10350,
    date: new Date().toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    estimatedDelivery: "2 to 3 Business Days (Express Nationwide)",
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      {/* Success Badge Animation Banner */}
      <Reveal className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.25, 0.92, 1], rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="mx-auto flex size-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg ring-8 ring-emerald-50"
        >
          <Check className="size-12 stroke-[3]" />
        </motion.div>

        <span className="mt-6 inline-block rounded-full bg-emerald-100/90 px-4 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-300/40">
          Order Placed Successfully
        </span>

        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Thank you for your order!
        </h1>

        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          We've received your order and our atelier team is preparing your luxury cosmetics for dispatch.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-soft/60 px-4 py-2 text-xs font-semibold text-foreground border border-border/60">
          <span>Order Number:</span>
          <span className="font-mono text-sm font-bold text-primary">{order.orderId}</span>
        </div>
      </Reveal>

      {/* Delivery Status Card */}
      <Reveal index={1} className="mt-10 rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Truck className="size-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Estimated Delivery</h3>
              <p className="text-xs text-muted-foreground">{order.estimatedDelivery}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-200 w-fit">
            Confirmed & Processing
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 sm:grid-cols-2 text-sm">
          {/* Shipping Address */}
          <div className="space-y-2 rounded-2xl border border-border/60 bg-soft/20 p-5">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <MapPin className="size-4 text-primary" /> Delivery Address
            </h4>
            <p className="font-bold text-foreground">{order.customerName}</p>
            <p className="text-muted-foreground text-xs">{order.address}, {order.city}</p>
            <p className="text-muted-foreground text-xs flex items-center gap-1">
              <Phone className="size-3" /> {order.phone}
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 rounded-2xl border border-border/60 bg-soft/20 p-5">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Banknote className="size-4 text-primary" /> Payment Method
            </h4>
            <p className="font-bold text-foreground">{order.paymentMethod}</p>
            <p className="text-muted-foreground text-xs">
              {order.paymentMethod === "Cash on Delivery"
                ? "Please keep exact cash ready upon delivery rider arrival."
                : "Payment confirmed via mobile wallet."}
            </p>
            <p className="text-xs text-emerald-800 font-semibold mt-1">Payment Status: Pending at Delivery</p>
          </div>
        </div>

        {/* Order Items List */}
        {order.items.length > 0 && (
          <div className="border-t border-border/60 pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Items Ordered ({order.items.length})
            </h4>
            <div className="divide-y divide-border/50">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="size-14 rounded-xl object-cover border border-border/60 bg-soft/40"
                    />
                    <div>
                      <h5 className="font-display text-sm font-bold text-foreground">{item.name}</h5>
                      {item.shade && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <span className="size-2.5 rounded-full border border-border" style={{ backgroundColor: item.shade.hex }} />
                          <span>{item.shade.name}</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-primary">
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="mt-4 border-t border-border/60 pt-4 space-y-2 text-sm text-right">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? "FREE" : formatPKR(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary border-t border-border/60 pt-2">
                <span>Total Paid</span>
                <span>{formatPKR(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Reveal>

      {/* Action Buttons */}
      <Reveal index={2} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
        <Link to="/shop">
          <BounceButton size="lg">
            <ShoppingBag className="size-5" /> Continue Shopping
          </BounceButton>
        </Link>
        <Link to="/">
          <BounceButton variant="outline" size="lg">
            Return to Homepage
          </BounceButton>
        </Link>
      </Reveal>
    </main>
  );
}
