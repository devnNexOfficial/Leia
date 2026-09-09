"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "d1",
    category: "Shipping",
    question: "Do you deliver all over Pakistan?",
    answer:
      "Ji bilkul! We deliver to all major cities including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta and all other cities and towns across Pakistan.",
    sort_order: 1,
  },
  {
    id: "d2",
    category: "Payments",
    question: "Is Cash on Delivery (COD) available?",
    answer:
      "Yes! Cash on Delivery (COD) is available everywhere across Pakistan. You simply pay cash to the rider at your doorstep when receiving your parcel.",
    sort_order: 2,
  },
  {
    id: "d3",
    category: "Products",
    question: "Are all products 100% original/authentic?",
    answer:
      "Absolutely. We are official stockists of Luscious, Rivaj UK, J., and all other brands on our store. We never sell replicas or copies. Every product comes in original brand packaging with a receipt.",
    sort_order: 3,
  },
  {
    id: "d4",
    category: "Returns",
    question: "What is your return/exchange policy?",
    answer:
      "We offer a 7-day hassle-free return or exchange policy. If you receive a damaged item or the wrong product, contact us within 7 days and we will arrange a free pickup and exchange.",
    sort_order: 4,
  },
  {
    id: "d5",
    category: "Shipping",
    question: "How long does delivery take?",
    answer:
      "Karachi, Lahore, Islamabad: 1-2 working days. Other major cities: 2-3 working days. Remote areas: 3-5 working days. Orders are dispatched within 24 hours Monday to Saturday.",
    sort_order: 5,
  },
  {
    id: "d6",
    category: "Orders",
    question: "Do you offer gift wrapping?",
    answer:
      "Yes! Add a note at checkout requesting gift wrapping and we will beautifully wrap your order with a handwritten card — perfect for birthdays, Eid gifts, and special occasions!",
    sort_order: 6,
  },
];

export function FaqSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [openId, setOpenId] = useState<string | null>(null);

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
        }
      } catch {
        // Fallback to DEFAULT_FAQS remains active
      }
    };

    void fetchFaqs();
  }, []);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="py-16 px-5 md:px-8 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="lg:sticky lg:top-24 self-start"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xs font-bold text-[#D6336C] uppercase tracking-widest mb-2"
            >
              ✦ Support
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="text-3xl md:text-4xl font-black text-[#1A0A10] leading-tight mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-400 mb-6"
            >
              Have more questions? Chat with us on WhatsApp — we reply within minutes!
            </motion.p>
          </motion.div>

          {/* Right FAQ accordion */}
          <div className="lg:col-span-2 divide-y divide-[#F5C6D5] border-t border-[#F5C6D5]">
            {faqs.map((faq, i) => {
              const isOpen = openId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, type: "spring", stiffness: 280, damping: 20 }}
                >
                  <motion.button
                    onClick={() => toggle(faq.id)}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-full flex items-center justify-between py-5 text-left gap-4"
                  >
                    <span className="font-bold text-gray-900 text-sm leading-snug">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    >
                      <Plus className="size-5 shrink-0 text-[#D6336C]" />
                    </motion.div>
                  </motion.button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.p
                        key="answer"
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="pb-5 text-sm text-gray-500 leading-relaxed overflow-hidden"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
