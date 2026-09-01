import { useEffect, useState } from "react";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { legalPageBySlug, type LegalPageSlug } from "@/lib/legal-pages";
import { supabase } from "@/lib/supabase";

type StoredPage = { title: string; content: string; updated_at: string };

export function LegalPage({ slug }: { slug: LegalPageSlug }) {
  const fallback = legalPageBySlug(slug);
  const [page, setPage] = useState<StoredPage | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("site_pages").select("title, content, updated_at").eq("slug", slug).maybeSingle().then(({ data }) => {
      if (data) setPage(data as StoredPage);
    });
  }, [slug]);

  const title = page?.title || fallback.title;
  const content = page?.content || fallback.content;
  const updatedAt = page?.updated_at ? new Date(page.updated_at).toLocaleDateString() : "August 29, 2026";
  const blocks = content.split(/\n\s*\n/).filter(Boolean);

  return <div className="min-h-screen bg-white"><Navbar /><main className="bg-[#FFF9FB] px-5 py-14 md:px-8 md:py-20"><article className="mx-auto max-w-3xl rounded-2xl border border-[#F5C6D5]/60 bg-white px-6 py-9 shadow-sm md:px-12 md:py-12"><p className="text-xs font-bold uppercase tracking-widest text-[#D6336C]">Legal information</p><h1 className="mt-3 text-4xl font-black text-gray-900 md:text-5xl">{title}</h1><p className="mt-3 text-sm text-gray-400">Last updated: {updatedAt}</p><div className="mt-10 space-y-7 text-sm leading-7 text-gray-600">{blocks.map((block, index) => block.startsWith("## ") ? <h2 key={index} className="pt-2 text-xl font-black leading-tight text-gray-900">{block.slice(3)}</h2> : <p key={index}>{block}</p>)}</div></article></main><Footer /></div>;
}
