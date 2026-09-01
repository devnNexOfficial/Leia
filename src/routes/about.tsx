import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, Heart, ShieldCheck, Truck, Quote } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story & Brand Philosophy — LEIA Pakistan" },
      {
        name: "description",
        content:
          "Discover the founding story, philosophy, clean ingredient commitments, and craftsmanship behind LEIA cosmetics.",
      },
    ],
  }),
  component: AboutPage,
});

type BrandStory = {
  eyebrow: string;
  title: string;
  intro: string;
  hero_image: string | null;
  section_1_title: string;
  section_1_content: string;
  section_2_title: string;
  section_2_content: string;
  section_3_title: string;
  section_3_content: string;
  quote: string;
};

const DEFAULT_STORY: BrandStory = {
  eyebrow: "Our story",
  title: "Made for your everyday glow",
  intro:
    "At LEIA, we craft luxury cosmetic essentials formulated for real radiance, timeless beauty, and unmatched comfort across Pakistan.",
  hero_image:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
  section_1_title: "Hello from LEIA",
  section_1_content:
    "LEIA was founded with a singular purpose: to elevate everyday beauty rituals with high-performance formulas tailored to warm, diverse skin tones. We believe every person deserves makeup and skincare that feels weightless and looks effortlessly luminous.",
  section_2_title: "What We Believe",
  section_2_content:
    "We believe beauty should be empowering, accessible, and clean. Every shade is tested for rich pigmentation, long-lasting wear, and cruelty-free ethics without harsh chemicals.",
  section_3_title: "Our Promise",
  section_3_content:
    "We stand behind each handcrafted formula. From rapid nationwide shipping to verified ingredient authenticity, our atelier team ensures your luxury experience starts the moment you order.",
  quote: "Beauty begins the moment you decide to be yourself.",
};

function AboutPage() {
  const [story, setStory] = useState<BrandStory>(DEFAULT_STORY);

  useEffect(() => {
    const fetchStory = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("brand_story")
          .select("*")
          .eq("slug", "main")
          .maybeSingle();

        if (!error && data) {
          setStory(data as BrandStory);
        }
      } catch {
        // Fallback remains active
      }
    };

    void fetchStory();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#FFF5F8] via-white to-white py-16 px-5 border-b border-[#F5C6D5]/40 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest">
              <Sparkles className="size-3.5" /> {story.eyebrow}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight font-display">
              {story.title}
            </h1>
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              {story.intro}
            </p>
          </div>
        </section>

        {/* Hero Image */}
        {story.hero_image && (
          <div className="max-w-5xl mx-auto px-5 -mt-6 mb-12">
            <div className="relative h-72 md:h-96 w-full rounded-3xl overflow-hidden shadow-2xl border border-[#F5C6D5]/60">
              <img
                src={story.hero_image}
                alt="LEIA Brand Atelier"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-right">
                <span className="text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                  LEIA Pakistan Atelier
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Core Narrative Sections */}
        <section className="max-w-4xl mx-auto px-5 py-8 space-y-12">
          {/* Section 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-4">
              <h2 className="text-2xl font-black text-gray-900 border-l-4 border-[#D6336C] pl-4">
                {story.section_1_title}
              </h2>
            </div>
            <div className="md:col-span-8 text-sm md:text-base text-gray-600 leading-relaxed space-y-3 whitespace-pre-line">
              {story.section_1_content}
            </div>
          </div>

          {/* Section 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-6 border-t border-[#F5C6D5]/40">
            <div className="md:col-span-4">
              <h2 className="text-2xl font-black text-gray-900 border-l-4 border-[#D6336C] pl-4">
                {story.section_2_title}
              </h2>
            </div>
            <div className="md:col-span-8 text-sm md:text-base text-gray-600 leading-relaxed space-y-3 whitespace-pre-line">
              {story.section_2_content}
            </div>
          </div>

          {/* Section 3 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-6 border-t border-[#F5C6D5]/40">
            <div className="md:col-span-4">
              <h2 className="text-2xl font-black text-gray-900 border-l-4 border-[#D6336C] pl-4">
                {story.section_3_title}
              </h2>
            </div>
            <div className="md:col-span-8 text-sm md:text-base text-gray-600 leading-relaxed space-y-3 whitespace-pre-line">
              {story.section_3_content}
            </div>
          </div>

          {/* Highlight Quote */}
          {story.quote && (
            <div className="mt-12 bg-[#FFF5F8] border border-[#F5C6D5] rounded-3xl p-8 text-center space-y-3 shadow-sm">
              <Quote className="size-8 mx-auto text-[#D6336C] opacity-60" />
              <p className="text-lg md:text-xl font-bold font-serif text-gray-900 italic">
                "{story.quote}"
              </p>
              <p className="text-xs font-black uppercase tracking-widest text-[#D6336C]">
                — The LEIA Team
              </p>
            </div>
          )}

          {/* Core Values Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            <div className="p-6 rounded-2xl bg-white border border-[#F5C6D5] text-center space-y-2 shadow-sm">
              <div className="size-10 rounded-full bg-[#FFF0F5] text-[#D6336C] flex items-center justify-center mx-auto">
                <Heart className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Skin-Loving Ingredients</h3>
              <p className="text-xs text-gray-500">Cruelty-free formulas crafted for real nourishment and long-lasting glow.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#F5C6D5] text-center space-y-2 shadow-sm">
              <div className="size-10 rounded-full bg-[#FFF0F5] text-[#D6336C] flex items-center justify-center mx-auto">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">100% Authentic Quality</h3>
              <p className="text-xs text-gray-500">Dermatologically tested cosmetics meeting international safety standards.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#F5C6D5] text-center space-y-2 shadow-sm">
              <div className="size-10 rounded-full bg-[#FFF0F5] text-[#D6336C] flex items-center justify-center mx-auto">
                <Truck className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Express Nationwide COD</h3>
              <p className="text-xs text-gray-500">Swift doorstep delivery with Cash on Delivery across all cities in Pakistan.</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
