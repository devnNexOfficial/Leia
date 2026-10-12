import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Package, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { BounceButton } from "../components/motion";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order — LEIA Cosmetics" },
      {
        name: "description",
        content:
          "Track your LEIA order status. Contact us via WhatsApp or call for live order updates.",
      },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Back */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-[#F5C6D5]/80 bg-gradient-to-br from-[#FFE8F0]/60 via-[#FFF6F9] to-[#FFF0F5] p-8 sm:p-14 text-center shadow-sm"
        >
          {/* Glow orbs */}
          <div className="pointer-events-none absolute -top-12 -left-12 size-64 rounded-full bg-[#FF80AA]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 size-64 rounded-full bg-[#D6336C]/15 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-lg space-y-5">
            {/* Icon */}
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-white border border-[#F5C6D5] text-[#D6336C] shadow-sm">
              <Package className="size-10 stroke-[1.5]" />
            </div>

            <span className="inline-block rounded-full bg-[#FFF0F5] border border-[#F5C6D5] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#D6336C]">
              Coming Soon
            </span>

            <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1A0A10] tracking-tight">
              Track Your Order
            </h1>

            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Online order tracking is coming very soon! For now, contact us on
              WhatsApp or call us directly — we'll give you a real-time update
              on your order within minutes.
            </p>

            {/* Contact options */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/923417813558?text=Hi!%20I%20want%20to%20track%20my%20LEIA%20order."
                target="_blank"
                rel="noopener noreferrer"
              >
                <BounceButton className="w-full sm:w-auto px-6 py-3 text-xs font-extrabold uppercase tracking-wider">
                  <MessageCircle className="size-4" />
                  WhatsApp Us
                </BounceButton>
              </a>
              <a href="tel:+923417813558">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white font-bold text-xs text-gray-700 hover:border-[#D6336C] hover:text-[#D6336C] transition-all shadow-2xs">
                  <Phone className="size-4" />
                  0341-7813558
                </button>
              </a>
            </div>

            <p className="text-[11px] text-gray-400 pt-2">
              Available Mon–Sat, 10am–7pm Pakistan Standard Time
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
