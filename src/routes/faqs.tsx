import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  MessageCircle,
  Package,
  CreditCard,
  RefreshCw,
  Truck,
  ShieldCheck,
  Search,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — LEIA Pakistan" },
      {
        name: "description",
        content:
          "Find quick answers to common questions about orders, nationwide delivery, cash on delivery, and returns for LEIA cosmetics.",
      },
    ],
  }),
  component: FAQsPage,
});

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "f1",
    category: "Orders",
    question: "How do I place an order on LEIA?",
    answer:
      "Browse our cosmetics catalog at leia.pk, select your desired products and shades, click 'Add to Cart', and proceed to checkout. We offer Cash on Delivery (COD) across all cities and towns in Pakistan.",
    sort_order: 1,
  },
  {
    id: "f2",
    category: "Orders",
    question: "Can I modify or cancel my order after placing it?",
    answer:
      "You can modify or cancel your order within 2 hours of placing it by messaging our customer support on WhatsApp. Once your parcel is dispatched, modifications are no longer possible.",
    sort_order: 2,
  },
  {
    id: "f3",
    category: "Orders",
    question: "How do I know my order is confirmed?",
    answer:
      "You will receive an immediate confirmation email and SMS containing your order ID. Our team verifies orders before dispatching via express couriers.",
    sort_order: 3,
  },
  {
    id: "f4",
    category: "Shipping",
    question: "How long does delivery take across Pakistan?",
    answer:
      "Standard delivery takes 2 to 4 business days for major hubs (Lahore, Karachi, Islamabad/Rawalpindi) and 3 to 5 business days for other cities across Pakistan.",
    sort_order: 1,
  },
  {
    id: "f5",
    category: "Shipping",
    question: "What are the shipping charges?",
    answer:
      "Shipping is 100% FREE on all orders of PKR 1,500 and above! For orders below PKR 1,500, a flat nominal delivery fee of PKR 150 applies nationwide.",
    sort_order: 2,
  },
  {
    id: "f6",
    category: "Returns",
    question: "What is your return & exchange policy?",
    answer:
      "We accept returns within 7 days of delivery for damaged, defective, or incorrect items in their original, unused packaging. Contact us on WhatsApp with photos to initiate a fast return.",
    sort_order: 1,
  },
  {
    id: "f7",
    category: "Payments",
    question: "What payment methods are supported?",
    answer:
      "We proudly offer Cash on Delivery (COD) nationwide so you can pay securely when your parcel arrives. We also accept direct online bank transfers upon request.",
    sort_order: 1,
  },
  {
    id: "f8",
    category: "Products",
    question: "Are LEIA products 100% authentic and skin-safe?",
    answer:
      "Yes, absolutely. All LEIA cosmetic products are formulated with dermatologically tested, skin-loving ingredients, cruelty-free, and guaranteed 100% authentic.",
    sort_order: 1,
  },
];

const CATEGORY_ICONS: Record<string, typeof Package> = {
  Orders: Package,
  Shipping: Truck,
  Returns: RefreshCw,
  Payments: CreditCard,
  Products: ShieldCheck,
  General: HelpCircle,
};

function FAQsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(["f1"]));

  useEffect(() => {
    const fetchFaqs = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("faqs")
          .select("id, question, answer, category, sort_order")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
          setFaqs(data as FaqItem[]);
          setOpenIds(new Set([data[0].id]));
        }
      } catch {
        // Fallback remains active
      }
    };

    void fetchFaqs();
  }, []);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()) ||
      faq.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#FFF5F8] via-white to-white py-16 px-5 border-b border-[#F5C6D5]/40 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest">
              <HelpCircle className="size-3.5" /> Customer Help Center
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Frequently Asked <span className="text-[#D6336C]">Questions</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Find quick, clear answers about orders, shade selection, fast nationwide shipping, and returns.
            </p>

            {/* Search Bar */}
            <div className="pt-3 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#D6336C]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions (e.g. delivery time, COD, return)..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-[#F5C6D5] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D6336C]/30 focus:border-[#D6336C] shadow-md transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Main Content */}
        <section className="py-12 px-5 max-w-4xl mx-auto">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-8 justify-start md:justify-center">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || HelpCircle;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? "bg-[#D6336C] text-white shadow-md shadow-[#D6336C]/20 scale-105"
                      : "bg-[#FFF5F8] text-gray-700 border border-[#F5C6D5]/60 hover:bg-[#FFEBF2] hover:text-[#D6336C]"
                  }`}
                >
                  <Icon className={`size-3.5 ${isSelected ? "text-white" : "text-[#D6336C]"}`} />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion FAQ List */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-[#FFF5F8] rounded-3xl border border-[#F5C6D5]/60 p-8">
              <HelpCircle className="size-12 text-[#D6336C] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-gray-900">No questions found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                We couldn't find any questions matching "{search}". Try searching for something else or talk to our team directly.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-4 px-4 py-2 bg-[#D6336C] text-white text-xs font-bold rounded-xl hover:bg-[#c02560] transition-colors"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openIds.has(faq.id);
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "border-[#D6336C] bg-[#FFF5F8]/40 shadow-sm"
                        : "border-[#F5C6D5]/60 bg-white hover:border-[#D6336C]/60"
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D6336C]/10 text-[#D6336C] shrink-0">
                          {faq.category}
                        </span>
                        <span className="font-bold text-sm md:text-base text-gray-900">
                          {faq.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`size-5 text-[#D6336C] shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-[#F5C6D5]/30">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Need More Help Card */}
          <div className="mt-12 bg-gradient-to-r from-[#D6336C] to-[#c02560] rounded-3xl p-8 text-white text-center shadow-xl shadow-[#D6336C]/15 space-y-4">
            <Sparkles className="size-8 mx-auto text-pink-200 animate-pulse" />
            <h3 className="text-xl md:text-2xl font-black">Still have questions?</h3>
            <p className="text-xs md:text-sm text-pink-100 max-w-md mx-auto">
              Our customer care specialists are available Monday to Saturday to assist you with order inquiries and shade guidance.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/923000000000"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#D6336C] hover:bg-pink-50 font-bold text-xs px-6 py-3 rounded-full transition-all shadow-md active:scale-95"
              >
                <MessageCircle className="size-4" /> WhatsApp Support
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-bold text-xs px-6 py-3 rounded-full transition-all"
              >
                Contact Form →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
