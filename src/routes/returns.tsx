import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, CheckCircle2, XCircle, Package, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/returns")({
  component: ReturnsPage,
});

const eligible = [
  "Product delivered in damaged/broken condition",
  "Wrong item sent",
  "Product significantly different from description",
  "Expired or near-expiry product received",
  "Sealed/unopened products within 7 days",
];

const notEligible = [
  "Used or opened products (unless defective)",
  "Sale / discounted items",
  "Products without original packaging",
  "Returns requested after 7 days of delivery",
  "Items returned without contacting support first",
];

const steps = [
  { step: "01", title: "Contact Support", desc: "WhatsApp us at 0300-0000000 with your Order ID and clear photos of the product within 7 days of delivery.", icon: Package },
  { step: "02", title: "Get Approval", desc: "Our team will review your request within 24 hours and send you a return approval with pickup details.", icon: CheckCircle2 },
  { step: "03", title: "Schedule Pickup", desc: "Once approved, we'll schedule a free pickup from your address via our courier partner.", icon: RefreshCw },
  { step: "04", title: "Receive Refund", desc: "After inspection, your refund is processed within 5–7 business days via original payment method or store credit.", icon: Clock },
];

function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#FFF0F5] via-white to-[#F9F0FF] py-20 px-5 border-b border-gray-100 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
            <RefreshCw className="size-3.5" /> Returns Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Returns &amp; <span className="text-[#D6336C]">Exchanges</span></h1>
          <p className="text-gray-500 text-base">We want you to love every purchase. If something isn't right, we'll make it right.</p>
        </div>
      </section>

      {/* Policy Window Banner */}
      <section className="py-8 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-[#D6336C] to-[#c02560] rounded-3xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="size-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Clock className="size-7" />
              </div>
              <div>
                <p className="text-2xl font-black">7-Day Return Window</p>
                <p className="text-white/80 text-sm">From the date of delivery</p>
              </div>
            </div>
            <a href="/contact" className="shrink-0 bg-white text-[#D6336C] font-bold text-sm px-6 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-md flex items-center gap-2">
              Initiate Return <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Eligible / Not Eligible */}
      <section className="py-12 px-5 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>
              <h3 className="font-black text-gray-900 text-lg">Eligible for Return</h3>
            </div>
            <ul className="space-y-3">
              {eligible.map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-10 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="size-5 text-red-500" />
              </div>
              <h3 className="font-black text-gray-900 text-lg">Not Eligible for Return</h3>
            </div>
            <ul className="space-y-3">
              {notEligible.map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <XCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Return Process Steps */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-2">How to Return an Item</h2>
            <p className="text-sm text-gray-500">Simple 4-step process — we handle the rest.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gray-200 z-0 translate-x-3" />
                )}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-xs hover:shadow-md transition-shadow relative z-10">
                  <div className="size-12 bg-[#FFF0F5] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="size-6 text-[#D6336C]" />
                  </div>
                  <div className="text-xs font-black text-[#D6336C] mb-1">STEP {step}</div>
                  <p className="text-sm font-black text-gray-900 mb-2">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="pb-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Important Note</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                For hygiene reasons, we cannot accept returns on opened cosmetic products unless they are defective or damaged. Please check your order carefully upon delivery and report any issues within 7 days. We reserve the right to decline returns that do not meet our policy criteria.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
