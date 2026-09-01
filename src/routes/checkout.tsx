import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Banknote,
  Check,
  ChevronLeft,
  Truck,
} from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart-context";
import { BounceButton, Reveal } from "../components/motion";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { formatPKR } from "@/data/catalog";
import { submitStorefrontOrder } from "@/lib/storefront-orders";
import {
  isValidEmail,
  isValidName,
  isValidPakistaniPhone,
  normalizePakistaniPhone,
} from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Leia Cosmetics" },
      { name: "description", content: "Complete your order securely with Cash on Delivery." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <CheckoutContent />
        <Footer />
      </div>
  );
}

function CheckoutContent() {
  const navigate = useNavigate();
  const { items, count, subtotal, placeOrder } = useCart();

  // Contact
  const [email, setEmail] = useState("");
  const [emailOffers, setEmailOffers] = useState(false);

  // Delivery
  const [country] = useState("Pakistan");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lahore");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"Cash on Delivery" | "JazzCash" | "Easypaisa">("Cash on Delivery");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingFee = 350;
  const total = subtotal + shippingFee;

  const paymentOptions = [
    {
      id: "Cash on Delivery" as const,
      title: "Cash on Delivery (COD)",
      subtitle: "Pay cash to rider upon arrival at your doorstep",
      icon: Banknote,
    },
  ];

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!isValidEmail(email)) {
      errs.email = "Please enter a valid email address (e.g. name@example.com)";
    }
    if (!isValidName(firstName)) {
      errs.firstName = "Please enter a valid first name (letters only, min 2 characters)";
    }
    if (!isValidName(lastName)) {
      errs.lastName = "Please enter a valid last name (letters only, min 2 characters)";
    }
    if (!address.trim() || address.trim().length < 5) {
      errs.address = "Please enter your complete delivery address (house/street info)";
    }
    if (!city.trim()) {
      errs.city = "Please select your city";
    }
    if (!isValidPakistaniPhone(phone)) {
      errs.phone = "Please enter a valid 11-digit Pakistani phone number (e.g. 0300 1234567)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (items.length === 0) return;

    setIsSubmitting(true);
    const standardPhone = normalizePakistaniPhone(phone);
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    try {
      const order = await submitStorefrontOrder({
        customerName: `${cleanFirstName} ${cleanLastName}`,
        email: email.trim(),
        phone: standardPhone,
        address: `${address.trim()}, ${city}${postalCode ? ", " + postalCode.trim() : ""}`,
        city,
        paymentMethod,
        items,
      });
      placeOrder({
        customerName: `${cleanFirstName} ${cleanLastName}`,
        phone: standardPhone,
        address: `${address.trim()}, ${city}${postalCode ? ", " + postalCode.trim() : ""}`,
        city,
        paymentMethod,
        orderId: order.order_number,
        shippingFee: Number(order.shipping_fee),
      });
      setIsSubmitting(false);
      navigate({ to: "/confirmation" });
    } catch (error) {
      setErrors(current => ({ ...current, checkout: error instanceof Error ? error.message : "Your order could not be placed. Please try again." }));
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-soft">
          <Truck className="size-10 text-primary" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-primary">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add items to your cart before proceeding to checkout.</p>
        <div className="mt-8">
          <Link to="/shop">
            <BounceButton size="lg">Return to shop</BounceButton>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      {/* Back button & Title */}
      <Reveal className="mb-8">
        <div>
          <Link to="/cart" className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" /> Back to Cart
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Checkout
          </h1>
        </div>
      </Reveal>

      <form onSubmit={handleSubmitOrder} className="grid gap-12 lg:grid-cols-12">
        {errors.checkout && <p className="lg:col-span-12 text-sm text-destructive">{errors.checkout}</p>}
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">

          {/* ── CONTACT ── */}
          <Reveal className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="font-display text-xl font-bold text-foreground">Contact</h2>

            {/* Email */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: "" })); }}
                  className={
                    "w-full rounded-xl border bg-background px-4 py-3 pr-10 text-sm text-foreground focus:outline-none transition-all " +
                    (errors.email ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-accent")
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 select-none cursor-help" title="We'll send your order confirmation here">?</span>
              </div>
              {errors.email && <p className="mt-1 text-xs font-semibold text-destructive">{errors.email}</p>}
            </div>

            {/* Newsletter checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-foreground">
              <input
                type="checkbox"
                checked={emailOffers}
                onChange={(e) => setEmailOffers(e.target.checked)}
                className="size-4 rounded border-border accent-pink-500 cursor-pointer"
              />
              Email me with news and offers
            </label>
          </Reveal>

          {/* ── DELIVERY ── */}
          <Reveal index={1} className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="font-display text-xl font-bold text-foreground">Delivery</h2>

            {/* Country (fixed) */}
            <div>
              <div className="relative">
                <select
                  value={country}
                  disabled
                  className="w-full appearance-none rounded-xl border border-border bg-background px-4 pt-6 pb-2 text-sm text-foreground focus:outline-none cursor-not-allowed opacity-80"
                >
                  <option>Pakistan</option>
                </select>
                <span className="absolute left-4 top-1.5 text-[10px] text-muted-foreground font-semibold tracking-wide pointer-events-none">Country/Region</span>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">▾</span>
              </div>
            </div>

            {/* First name + Last name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors(p => ({ ...p, firstName: "" })); }}
                  className={
                    "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground focus:outline-none transition-all " +
                    (errors.firstName ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-accent")
                  }
                />
                {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors(p => ({ ...p, lastName: "" })); }}
                  className={
                    "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground focus:outline-none transition-all " +
                    (errors.lastName ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-accent")
                  }
                />
                {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors(p => ({ ...p, address: "" })); }}
                className={
                  "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground focus:outline-none transition-all " +
                  (errors.address ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-accent")
                }
              />
              {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
            </div>

            {/* City + Postal code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); if (errors.city) setErrors(p => ({ ...p, city: "" })); }}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>City</option>
                  <option>Lahore</option>
                  <option>Karachi</option>
                  <option>Islamabad</option>
                  <option>Rawalpindi</option>
                  <option>Faisalabad</option>
                  <option>Peshawar</option>
                  <option>Multan</option>
                  <option>Quetta</option>
                  <option>Sialkot</option>
                  <option>Gujranwala</option>
                  <option>Hyderabad</option>
                  <option>Abbottabad</option>
                  <option>Bahawalpur</option>
                  <option>Sargodha</option>
                </select>
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Postal code (optional)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone with embedded +92 Pakistan Code */}
            <div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 border-r border-border/80 pr-2.5 text-xs font-bold text-foreground select-none pointer-events-none">
                  <span>🇵🇰</span>
                  <span>+92</span>
                </div>
                <input
                  type="tel"
                  placeholder="300 1234567"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setPhone(raw);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                  }}
                  className={
                    "w-full rounded-xl border bg-background py-3 pl-20 pr-10 text-sm text-foreground focus:outline-none transition-all " +
                    (errors.phone ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-accent")
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 cursor-help text-xs" title="11-digit Pakistani mobile number for delivery rider contact">?</span>
              </div>
              {errors.phone && <p className="mt-1 text-xs font-semibold text-destructive">{errors.phone}</p>}
            </div>

            {/* Save info checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-foreground">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="size-4 rounded border-border accent-pink-500 cursor-pointer"
              />
              Save this information for next time
            </label>
          </Reveal>

          {/* ── SHIPPING METHOD ── */}
          <Reveal index={2} className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground">Shipping method</h2>
            <div className="flex items-center justify-between rounded-2xl border-2 border-accent bg-accent/5 px-5 py-4">
              <span className="font-semibold text-foreground text-sm">Shipping</span>
              <span className="font-bold text-foreground text-sm">{formatPKR(shippingFee)}</span>
            </div>
          </Reveal>

          {/* ── PAYMENT METHOD ── */}
          <Reveal index={3} className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <h2 className="font-display text-xl font-bold text-foreground">Payment</h2>
            </div>
            <div className="space-y-3">
              {paymentOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <motion.div
                    key={opt.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setPaymentMethod(opt.id); if (errors.paymentMethod) setErrors(p => ({ ...p, paymentMethod: "" })); }}
                    className={
                      "relative flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all " +
                      (isSelected
                        ? "border-accent bg-accent/10 ring-2 ring-accent shadow-sm"
                        : "border-border/80 bg-background hover:border-accent/60")
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className={
                        "flex size-10 items-center justify-center rounded-xl border " +
                        (isSelected ? "border-accent bg-accent text-accent-foreground" : "border-border/60 bg-muted text-muted-foreground")
                      }>
                        <IconComponent className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{opt.title}</h3>
                        <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                      </div>
                    </div>
                    <div>
                      {isSelected ? (
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-4" />
                        </span>
                      ) : (
                        <div className="size-5 rounded-full border border-border" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="lg:col-span-5">
          <Reveal index={4} className="sticky top-24 rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="font-display text-2xl font-bold text-primary">
              Order Summary ({count} {count === 1 ? "item" : "items"})
            </h2>

            {/* Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/60 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-xl bg-soft/40 border border-border/50">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-foreground line-clamp-1">{item.name}</h4>
                      {item.shade && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="size-2.5 rounded-full border border-border" style={{ backgroundColor: item.shade.hex }} />
                          <span>{item.shade.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">{formatPKR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm border-t border-border/60 pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Shipping</span>
                <span>{formatPKR(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary border-t border-border/60 pt-3">
                <span>Total</span>
                <span>{formatPKR(total)}</span>
              </div>
            </div>

            {/* Error banner in sidebar */}
            {errors.checkout && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive space-y-1">
                <p className="font-bold text-sm">⚠️ Order Submission Failed</p>
                <p>{errors.checkout}</p>
              </div>
            )}

            {/* Place Order */}
            <BounceButton
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full py-4 text-base font-semibold"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="size-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Securing Order...</span>
                </div>
              ) : (
                <>Place Order • {formatPKR(total)}</>
              )}
            </BounceButton>

            <div className="rounded-2xl bg-soft/30 p-4 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">30-Day Happiness Guarantee</p>
              <p>Hassle-free returns and exchanges nationwide.</p>
            </div>
          </Reveal>
        </div>
      </form>
    </main>
  );
}
