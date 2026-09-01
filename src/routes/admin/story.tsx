import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Save,
  ExternalLink,
  Upload,
  CheckCircle,
  Heart,
  Quote,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

export type BrandStory = {
  id?: string;
  slug: string;
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
  updated_at?: string;
};

export const Route = createFileRoute("/admin/story")({
  component: AdminStoryPage,
});

const DEFAULT_STORY: BrandStory = {
  slug: "main",
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

function AdminStoryPage() {
  const [story, setStory] = useState<BrandStory>(DEFAULT_STORY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("brand_story")
      .select("*")
      .eq("slug", "main")
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (data) {
      setStory(data as BrandStory);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleImageUpload = async (file: File) => {
    if (!supabase) return;
    setUploading(true);
    setError("");

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `story-hero-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError(uploadError.message);
      } else {
        const publicUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
        setStory((prev) => ({ ...prev, hero_image: publicUrl }));
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setError("");
    setSavedSuccess(false);

    const payload = {
      slug: "main",
      eyebrow: story.eyebrow.trim(),
      title: story.title.trim(),
      intro: story.intro.trim(),
      hero_image: story.hero_image?.trim() || null,
      section_1_title: story.section_1_title.trim(),
      section_1_content: story.section_1_content.trim(),
      section_2_title: story.section_2_title.trim(),
      section_2_content: story.section_2_content.trim(),
      section_3_title: story.section_3_title.trim(),
      section_3_content: story.section_3_content.trim(),
      quote: story.quote.trim(),
    };

    const { error: upsertError } = await supabase
      .from("brand_story")
      .upsert(payload, { onConflict: "slug" });

    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
            <Sparkles className="size-6 text-[#D6336C]" /> Our Story & Brand Narrative
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Customize the "Our Story" page (/about) text, sections, values, and brand imagery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Eye className="size-3.5" /> View Live Page <ExternalLink className="size-3" />
          </a>
          <button
            type="submit"
            disabled={saving}
            className={`${adminButton} bg-[#D6336C] hover:bg-[#c02560] shadow-sm`}
          >
            <Save className="mr-1.5 size-4" /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {error && <AdminError message={error} />}

      {savedSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fadeIn">
          <CheckCircle className="size-4 text-emerald-600" />
          Our Story has been updated successfully! Changes are live on /about.
        </div>
      )}

      {/* Card 1: Page Header & Hero Image */}
      <div className={`${adminCard} p-6 space-y-4`}>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Heart className="size-4 text-[#D6336C]" /> 1. Page Header & Introduction
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Eyebrow Tag
            <input
              className={`${adminInput} mt-1`}
              value={story.eyebrow}
              onChange={(e) => setStory({ ...story, eyebrow: e.target.value })}
              placeholder="e.g. Our Story"
              required
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Main Headline
            <input
              className={`${adminInput} mt-1`}
              value={story.title}
              onChange={(e) => setStory({ ...story, title: e.target.value })}
              placeholder="e.g. Made for your everyday glow"
              required
            />
          </label>
        </div>

        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Introductory Subtitle / Summary
          <textarea
            className="mt-1 h-20 w-full resize-y rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-slate-500"
            value={story.intro}
            onChange={(e) => setStory({ ...story, intro: e.target.value })}
            placeholder="A compelling opening statement about your brand mission..."
            required
          />
        </label>

        {/* Hero Image */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Story Hero Banner Image (URL or Upload)
          </label>
          <div className="flex gap-2">
            <input
              className={`${adminInput} flex-1`}
              value={story.hero_image || ""}
              onChange={(e) => setStory({ ...story, hero_image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0">
              <Upload className="size-3.5" />
              {uploading ? "Uploading…" : "Upload Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
          </div>
          {story.hero_image && (
            <div className="mt-3 relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200">
              <img src={story.hero_image} alt="Hero banner" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Narrative Sections */}
      <div className={`${adminCard} p-6 space-y-6`}>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-[#D6336C]" /> 2. Core Narrative & Mission Sections
        </h2>

        {/* Section 1 */}
        <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Section 1 Title
            <input
              className={`${adminInput} mt-1 bg-white`}
              value={story.section_1_title}
              onChange={(e) => setStory({ ...story, section_1_title: e.target.value })}
              placeholder="e.g. Hello from LEIA"
              required
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 pt-2">
            Section 1 Content
            <textarea
              className="mt-1 h-28 w-full resize-y rounded-md border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-slate-500"
              value={story.section_1_content}
              onChange={(e) => setStory({ ...story, section_1_content: e.target.value })}
              required
            />
          </label>
        </div>

        {/* Section 2 */}
        <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Section 2 Title
            <input
              className={`${adminInput} mt-1 bg-white`}
              value={story.section_2_title}
              onChange={(e) => setStory({ ...story, section_2_title: e.target.value })}
              placeholder="e.g. What We Believe"
              required
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 pt-2">
            Section 2 Content
            <textarea
              className="mt-1 h-28 w-full resize-y rounded-md border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-slate-500"
              value={story.section_2_content}
              onChange={(e) => setStory({ ...story, section_2_content: e.target.value })}
              required
            />
          </label>
        </div>

        {/* Section 3 */}
        <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Section 3 Title
            <input
              className={`${adminInput} mt-1 bg-white`}
              value={story.section_3_title}
              onChange={(e) => setStory({ ...story, section_3_title: e.target.value })}
              placeholder="e.g. Our Promise"
              required
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 pt-2">
            Section 3 Content
            <textarea
              className="mt-1 h-28 w-full resize-y rounded-md border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-slate-500"
              value={story.section_3_content}
              onChange={(e) => setStory({ ...story, section_3_content: e.target.value })}
              required
            />
          </label>
        </div>

        {/* Brand Quote */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1">
            <Quote className="size-3.5 text-[#D6336C]" /> Featured Brand Quote / Motto
          </label>
          <input
            className={`${adminInput}`}
            value={story.quote}
            onChange={(e) => setStory({ ...story, quote: e.target.value })}
            placeholder="e.g. Beauty begins the moment you decide to be yourself."
            required
          />
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className={`${adminButton} bg-[#D6336C] hover:bg-[#c02560] px-6 text-sm shadow-md`}
        >
          <Save className="mr-2 size-4" /> {saving ? "Saving…" : "Save Our Story"}
        </button>
      </div>
    </form>
  );
}
