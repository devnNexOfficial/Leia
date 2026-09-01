import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, MapPin, Phone, Star, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/authorised-sellers")({
  component: AuthorisedSellersPage,
});

const sellers = [
  { name: "Glam Avenue", city: "Lahore", area: "Gulberg III", phone: "0300-1111111", rating: 4.9, reviews: 312 },
  { name: "Beauty Hub PK", city: "Karachi", area: "DHA Phase 6", phone: "0321-2222222", rating: 4.8, reviews: 241 },
  { name: "Leia Studio", city: "Islamabad", area: "F-7 Markaz", phone: "0311-3333333", rating: 5.0, reviews: 198 },
  { name: "The Beauty Lounge", city: "Rawalpindi", area: "Saddar", phone: "0333-4444444", rating: 4.7, reviews: 157 },
  { name: "Makeup Vault", city: "Faisalabad", area: "D-Ground", phone: "0345-5555555", rating: 4.8, reviews: 134 },
  { name: "Pink Palette", city: "Multan", area: "Cantt", phone: "0355-6666666", rating: 4.9, reviews: 89 },
];

function AuthorisedSellersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-[#FFF0F5] via-white to-[#F9F0FF] py-20 px-5 border-b border-gray-100 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
            <ShieldCheck className="size-3.5" /> Official Sellers
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Authorised <span className="text-[#D6336C]">Sellers</span></h1>
          <p className="text-gray-500 text-base">Find verified Leia stockists near you. Only buy from authorised sellers to guarantee authenticity.</p>
        </div>
      </section>

      {/* Warning Banner */}
      <section className="py-6 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Beware of Counterfeits</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Only purchase Leia products from our official website (leia.pk) or listed authorised sellers below. Unauthorised sellers may carry counterfeit or expired products. If you suspect a fake seller, please <a href="/contact" className="text-[#D6336C] font-bold hover:underline">report it here</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sellers Grid */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Verified Stockists</h2>
          <p className="text-sm text-gray-500 mb-8">All sellers are verified and carry 100% authentic Leia products.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sellers.map(seller => (
              <div key={seller.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#D6336C]/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 bg-[#FFF0F5] rounded-xl flex items-center justify-center">
                    <ShieldCheck className="size-5 text-[#D6336C]" />
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Verified
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">{seller.name}</h3>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`size-3.5 ${i < Math.round(seller.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-1">{seller.rating}</span>
                  <span className="text-xs text-gray-400">({seller.reviews})</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="size-3.5 text-[#D6336C] shrink-0" />
                    {seller.area}, {seller.city}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="size-3.5 text-[#D6336C] shrink-0" />
                    {seller.phone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Seller CTA */}
      <section className="py-12 px-5 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#D6336C] to-[#c02560] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div>
              <h3 className="text-2xl font-black mb-2">Want to Become an Authorised Seller?</h3>
              <p className="text-white/80 text-sm max-w-md">Join our growing network of verified stockists. Apply for a wholesale account and start selling Leia products in your store.</p>
            </div>
            <a href="/wholesale" className="shrink-0 flex items-center gap-2 bg-white text-[#D6336C] font-bold text-sm px-6 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-md">
              Apply Now <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
