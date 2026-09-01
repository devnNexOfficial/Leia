import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Package, TrendingUp, CheckCircle2, Send, Users, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/wholesale")({
  head: () => ({
    meta: [
      { title: "Wholesale & Salon Partnerships — LEIA Pakistan" },
      {
        name: "description",
        content:
          "Partner with LEIA for wholesale cosmetic distribution, bulk salon orders, and competitive tiered pricing across Pakistan.",
      },
    ],
  }),
  component: WholesalePage,
});

const benefits = [
  { icon: Package, title: "Bulk Discounts", desc: "Tiered pricing starting at 15% off for orders over PKR 50,000", color: "bg-[#FFF0F5] text-[#D6336C]" },
  { icon: TrendingUp, title: "Priority Stock", desc: "Wholesale partners get first access to new arrivals and limited editions", color: "bg-purple-50 text-purple-600" },
  { icon: Users, title: "Dedicated Manager", desc: "A dedicated account manager for seamless reordering", color: "bg-emerald-50 text-emerald-600" },
  { icon: ShieldCheck, title: "Authentic Products", desc: "100% authentic products with official brand certificates", color: "bg-amber-50 text-amber-600" },
];

function WholesalePage() {
  const [form, setForm] = useState({ business: "", name: "", email: "", phone: "", city: "", volume: "", notes: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-[#FFF0F5] via-white to-[#F9F0FF] py-20 px-5 border-b border-gray-100 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
            <Store className="size-3.5" /> Wholesale
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Wholesale &amp; <span className="text-[#D6336C]">B2B</span> Inquiries</h1>
          <p className="text-gray-500 text-base">Partner with Leia to stock Pakistan's most-loved beauty brands at competitive wholesale prices.</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 px-5 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {benefits.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-xs hover:shadow-md transition-shadow">
              <div className={`size-12 rounded-2xl ${color} flex items-center justify-center mx-auto mb-3`}>
                <Icon className="size-6" />
              </div>
              <p className="text-sm font-black text-gray-900 mb-1">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="py-14 px-5 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Wholesale Pricing Tiers</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { tier: "Bronze", range: "PKR 25,000 – 75,000", discount: "10% OFF", items: ["Minimum 50 units/order", "Standard delivery", "Email support"] },
              { tier: "Silver", range: "PKR 75,000 – 200,000", discount: "18% OFF", items: ["Minimum 150 units/order", "Priority delivery", "Dedicated account manager", "First access to new stock"], hot: true },
              { tier: "Gold", range: "PKR 200,000+", discount: "25% OFF", items: ["No minimum order", "Free delivery", "Custom packaging options", "Exclusive promotions", "Monthly business review"] },
            ].map(t => (
              <div key={t.tier} className={`rounded-3xl p-6 border ${t.hot ? "bg-gradient-to-br from-[#D6336C] to-[#c02560] border-transparent text-white shadow-xl" : "bg-white border-gray-100 shadow-xs"}`}>
                {t.hot && <div className="text-xs font-black bg-white/20 text-white border border-white/30 rounded-full px-3 py-1 inline-block mb-3">Most Popular</div>}
                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${t.hot ? "text-white/70" : "text-[#D6336C]"}`}>{t.tier}</p>
                <p className={`text-3xl font-black mb-1 ${t.hot ? "text-white" : "text-gray-900"}`}>{t.discount}</p>
                <p className={`text-xs mb-5 ${t.hot ? "text-white/70" : "text-gray-400"}`}>{t.range}</p>
                <ul className="space-y-2">
                  {t.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`size-4 shrink-0 ${t.hot ? "text-white/80" : "text-emerald-500"}`} />
                      <span className={t.hot ? "text-white/90" : "text-gray-600"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Apply for Wholesale Account</h2>
            <p className="text-sm text-gray-500">We'll review your application and get back within 2 business days.</p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center text-center py-12 bg-emerald-50 rounded-3xl border border-emerald-100">
              <CheckCircle2 className="size-14 text-emerald-500 mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-2">Application Received!</h3>
              <p className="text-sm text-gray-500 max-w-xs">Our wholesale team will contact you within 2 business days to discuss next steps.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Business Name *", key: "business", placeholder: "Glam Studio PK" },
                  { label: "Contact Name *", key: "name", placeholder: "Ayesha Khan" },
                  { label: "Email *", key: "email", placeholder: "you@business.com", type: "email" },
                  { label: "Phone *", key: "phone", placeholder: "+92 300 0000000", type: "tel" },
                  { label: "City", key: "city", placeholder: "Lahore" },
                  { label: "Monthly Volume (PKR)", key: "volume", placeholder: "e.g. 100,000" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
                    <input
                      required={label.includes("*")}
                      type={type || "text"}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D6336C] transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Additional Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Tell us about your business and what products you're interested in..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D6336C] transition-colors resize-none"
                />
              </div>
              <button type="submit" className="w-full bg-[#D6336C] hover:bg-[#c02560] text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md">
                <Send className="size-4" /> Submit Application
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
