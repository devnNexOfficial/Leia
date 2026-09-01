import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  X,
  Sparkles,
  Share2,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Beauty Journal, Skincare Guides & Makeup Tips — LEIA" },
      {
        name: "description",
        content:
          "Explore expertly curated skincare routines, foundation matching guides, makeup trends, and behind-the-scenes beauty tutorials from LEIA.",
      },
    ],
  }),
  component: BlogPage,
});

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string;
  author: string;
  read_time: string;
  published: boolean;
  created_at: string;
};

const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: "b1",
    title: "How to Achieve a Glass-Skin Glow in 5 Simple Steps",
    slug: "glass-skin-glow-guide",
    excerpt:
      "Master the art of radiant, luminous skin with our curated routine designed specifically for humid and changing climates.",
    content: `## The Secret to Radiant Skin

Achieving glass skin is not about covering flaws—it is about deep hydration, gentle exfoliation, and locking in moisture with lightweight layers.

### 1. Double Cleanse with Care
Start your evening ritual with an oil-based cleanser to melt away sunscreen and impurities, followed by a gentle pH-balanced foaming wash.

### 2. Hydrating Mist & Essence
Damp skin absorbs moisture 10x better than dry skin. Pat a soothing rosewater or hyaluronic acid toner generously onto your face.

### 3. Vitamin C & Niacinamide
Brighten dark spots and even out texture with a potent antioxidant serum. Apply 3–4 drops and press gently into skin.

### 4. Lightweight Gel Cream
Lock in the glow without clogging pores. Look for squalane, ceramides, and soothing botanicals.

### 5. Non-Negotiable Sunscreen
Never skip broad-spectrum SPF 50+ to protect your cellular barrier and prevent photoaging.`,
    cover_image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=900&auto=format&fit=crop&q=80",
    category: "Skincare Rituals",
    author: "Dr. Areesha Malik",
    read_time: "5 min read",
    published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "b2",
    title: "Finding Your Perfect Foundation Shade for South Asian Undertones",
    slug: "find-perfect-foundation-shade",
    excerpt:
      "Olive, golden, neutral or peach? Here is how to pick the right undertone for seamless, natural foundation coverage.",
    content: `## Demystifying Warm & Olive Undertones

Finding the exact shade match can feel intimidating when traditional international ranges fail to capture South Asian skin depth.

### Understanding Your Undertone
- **Warm / Golden:** Veins look greenish, gold jewelry flatters you most.
- **Olive:** A subtle greenish or muted hue, neither strictly pink nor intensely yellow.
- **Neutral:** A harmonious balance that adapts easily to true beige and peach tones.

### How to Swatch Correctly
Never test foundation on your wrist! Always swatch along your lower jawline down towards your neck in natural daylight.

### Setting with Translucent Powder
For long-lasting heat resistance, press micro-fine translucent powder into the T-zone while leaving high points fresh and dewy.`,
    cover_image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop&q=80",
    category: "Makeup Tutorials",
    author: "Zainab Noor",
    read_time: "4 min read",
    published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "b3",
    title: "Lip Care 101: Preventing Chapped Lips All Year Round",
    slug: "lip-care-101-preventing-chapped-lips",
    excerpt:
      "Say goodbye to dry, peeling lips with our hydrating routine and nourishing botanical lip tints.",
    content: `## Why Lips Need Special Care

The skin on our lips is 3x thinner than the rest of our facial skin and lacks natural oil glands.

### Step 1: Gentle Sugar Polish
Exfoliate dead skin once a week with a gentle sugar & jojoba oil scrub.

### Step 2: Overnight Peptide Mask
Apply a thick layer of peptide balm before sleep to repair micro-cracks.

### Step 3: Tinted Oils with SPF
Choose tinted lip oils enriched with Vitamin E for everyday radiant color that hydrates simultaneously.`,
    cover_image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=900&auto=format&fit=crop&q=80",
    category: "Beauty Guide",
    author: "LEIA Editorial",
    read_time: "3 min read",
    published: true,
    created_at: new Date().toISOString(),
  },
];

function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>(DEFAULT_BLOGS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setBlogs(data as BlogPost[]);
        }
      } catch {
        // Keep default blogs
      }
    };

    void fetchBlogs();
  }, []);

  const categories = ["All", ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(search.toLowerCase())) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#FFF5F8] via-white to-white py-16 px-5 border-b border-[#F5C6D5]/40 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest">
              <BookOpen className="size-3.5" /> LEIA Beauty Journal
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Stories, Rituals & <span className="text-[#D6336C]">Guides</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Step into our beauty journal for everyday skincare secrets, tutorials, and masterclasses from makeup artists.
            </p>

            {/* Search Bar */}
            <div className="pt-3 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#D6336C]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles by title, topic, or ingredient..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-[#F5C6D5] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D6336C]/30 focus:border-[#D6336C] shadow-md transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="py-8 px-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar justify-start md:justify-center">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? "bg-[#D6336C] text-white shadow-md shadow-[#D6336C]/20 scale-105"
                      : "bg-[#FFF5F8] text-gray-700 border border-[#F5C6D5]/60 hover:bg-[#FFEBF2] hover:text-[#D6336C]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Articles Grid */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16 bg-[#FFF5F8] rounded-3xl border border-[#F5C6D5]/60 p-8 my-6">
              <BookOpen className="size-12 text-[#D6336C] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-gray-900">No articles found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                We couldn't find any articles matching your search query. Try another keyword or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-6">
              {filteredBlogs.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setActiveArticle(post)}
                  className="group bg-white rounded-3xl border border-[#F5C6D5]/60 hover:border-[#D6336C] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Image Banner */}
                  <div className="relative h-52 w-full overflow-hidden bg-pink-50">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#D6336C]">
                        <BookOpen className="size-12 opacity-40" />
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-[#D6336C] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md border border-[#F5C6D5]/60">
                      {post.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="size-3 text-[#D6336C]" /> {post.author}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {post.read_time}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#D6336C] transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#F5C6D5]/30 flex items-center justify-between text-xs font-bold text-[#D6336C] group-hover:translate-x-1 transition-transform">
                      <span>Read Article</span>
                      <ArrowRight className="size-4" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Full Article Reader Modal */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="my-8 w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-[#F5C6D5] overflow-hidden animate-fadeIn">
              {/* Header Image */}
              <div className="relative h-64 sm:h-80 w-full bg-slate-900">
                {activeArticle.cover_image && (
                  <img
                    src={activeArticle.cover_image}
                    alt={activeArticle.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <button
                  onClick={() => setActiveArticle(null)}
                  className="absolute top-4 right-4 size-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                  aria-label="Close article"
                >
                  <X className="size-5" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="inline-block bg-[#D6336C] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    {activeArticle.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {activeArticle.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 pt-1">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <User className="size-3.5 text-pink-300" /> {activeArticle.author}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" /> {activeArticle.read_time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-10 max-h-[60vh] overflow-y-auto space-y-4">
                {activeArticle.excerpt && (
                  <p className="text-sm font-semibold text-gray-700 italic border-l-4 border-[#D6336C] pl-4 py-1 bg-[#FFF5F8] rounded-r-xl">
                    "{activeArticle.excerpt}"
                  </p>
                )}

                <div className="prose prose-sm max-w-none text-gray-700 space-y-4 text-sm leading-relaxed whitespace-pre-line">
                  {activeArticle.content}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#F5C6D5]/40 bg-[#FFF5F8] px-6 sm:px-10 py-4 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">LEIA Beauty Editorial</span>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2 rounded-full bg-[#D6336C] text-white text-xs font-bold hover:bg-[#c02560] transition-colors shadow-md"
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
