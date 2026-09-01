import { createFileRoute } from "@tanstack/react-router";
import { Truck, Clock, MapPin, Package, ShieldCheck, Gift, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/shipping")({
  component: ShippingPage,
});

const zones = [
  { city: "Lahore", standard: "1–2 days", express: "Same day*", fee: "Free over PKR 1,500" },
  { city: "Karachi", standard: "2–3 days", express: "Next day", fee: "Free over PKR 1,500" },
  { city: "Islamabad / Rawalpindi", standard: "2–3 days", express: "Next day", fee: "Free over PKR 1,500" },
  { city: "Other Major Cities", standard: "3–4 days", express: "2–3 days", fee: "Free over PKR 1,500" },
  { city: "Remote Areas", standard: "5–7 days", express: "N/A", fee: "PKR 200 flat" },
];

function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#FFF0F5] via-white to-[#F9F0FF] py-20 px-5 border-b border-gray-100 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
            <Truck className="size-3.5" /> Shipping Info
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Shipping &amp; <span className="text-[#D6336C]">Delivery</span></h1>
          <p className="text-gray-500 text-base">Fast, reliable delivery across Pakistan with real-time tracking.</p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-14 px-5 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: Truck, title: "Free Shipping", sub: "On orders over PKR 1,500", color: "bg-[#FFF0F5] text-[#D6336C]" },
            { icon: Clock, title: "Fast Dispatch", sub: "Orders dispatched within 24 hrs", color: "bg-purple-50 text-purple-600" },
            { icon: MapPin, title: "Nationwide", sub: "Delivery to all cities in Pakistan", color: "bg-emerald-50 text-emerald-600" },
            { icon: ShieldCheck, title: "Insured", sub: "All parcels are fully insured", color: "bg-amber-50 text-amber-600" },
          ].map(({ icon: Icon, title, sub, color }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-xs hover:shadow-md transition-shadow">
              <div className={`size-12 rounded-2xl ${color} flex items-center justify-center mx-auto mb-3`}>
                <Icon className="size-6" />
              </div>
              <p className="text-sm font-black text-gray-900">{title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Zones Table */}
      <section className="py-16 px-5 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Delivery Timeframes</h2>
          <p className="text-sm text-gray-500 mb-8">All times are business days (Mon–Sat), excluding public holidays.</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-xs">
            <table className="w-full text-sm">
              <thead className="bg-[#FFF0F5]">
                <tr>
                  {["City / Region", "Standard Delivery", "Express Delivery", "Shipping Fee"].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-black text-[#D6336C] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {zones.map((zone, i) => (
                  <tr key={zone.city} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-5 py-4 font-semibold text-gray-900">{zone.city}</td>
                    <td className="px-5 py-4 text-gray-600">{zone.standard}</td>
                    <td className="px-5 py-4 text-gray-600">{zone.express}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="size-3" /> {zone.fee}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">* Same-day delivery in Lahore available for orders placed before 12:00 PM. Subject to availability.</p>
        </div>
      </section>

      {/* Packaging & Policy */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#FFF0F5] to-white border border-[#F5C6D5]/60 rounded-3xl p-8">
            <div className="size-12 bg-[#D6336C]/10 rounded-2xl flex items-center justify-center mb-4">
              <Gift className="size-6 text-[#D6336C]" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-3">Premium Packaging</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every Leia order is carefully packed in our signature pink tissue paper and sealed with our brand sticker. Your products are bubble-wrapped to ensure safe delivery — because presentation matters as much as the product.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-3xl p-8">
            <div className="size-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <Package className="size-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-3">Courier Partners</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              We partner with Pakistan's most trusted couriers to ensure timely, damage-free delivery:
            </p>
            <div className="flex flex-wrap gap-2">
              {["TCS Express", "Leopard Courier", "M&P", "Pakistan Post"].map(c => (
                <span key={c} className="bg-white border border-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
