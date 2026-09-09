import { createFileRoute } from "@tanstack/react-router";
import {
  Pencil,
  Plus,
  Trash2,
  HelpCircle,
  Search,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export const Route = createFileRoute("/admin/faqs")({
  component: AdminFaqsPage,
});

const DEFAULT_CATEGORIES = ["Orders", "Shipping", "Returns", "Payments", "Products", "General"];

function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [editing, setEditing] = useState<FaqItem | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const load = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("category")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setFaqs((data ?? []) as FaqItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-faqs-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "faqs" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const remove = async (faq: FaqItem) => {
    if (!confirm(`Are you sure you want to delete this FAQ: "${faq.question}"?`)) return;
    const { error } = await supabase!.from("faqs").delete().eq("id", faq.id);
    if (error) setError(error.message);
  };

  const togglePublished = async (faq: FaqItem) => {
    const { error } = await supabase!
      .from("faqs")
      .update({ is_published: !faq.is_published })
      .eq("id", faq.id);
    if (error) setError(error.message);
  };

  const allCategories = ["All", ...Array.from(new Set([...DEFAULT_CATEGORIES, ...faqs.map((f) => f.category)]))];

  const filtered = faqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "All" || f.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
            <HelpCircle className="size-6 text-[#D6336C]" /> FAQs Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, organize, and publish customer support questions and answers shown on /faqs.
          </p>
        </div>
        <button
          className={`${adminButton} bg-[#D6336C] hover:bg-[#c02560] shadow-sm`}
          onClick={() => setEditing(null)}
        >
          <Plus className="mr-1.5 size-4" /> Add FAQ
        </button>
      </div>

      {error && <AdminError message={error} />}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs by question or answer…"
            className={`${adminInput} pl-9`}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === cat
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <AdminLoading />
      ) : filtered.length === 0 ? (
        <EmptyState>
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">No FAQs found matching your criteria.</p>
            <button
              className="mt-3 text-xs font-bold text-[#D6336C] hover:underline"
              onClick={() => setEditing(null)}
            >
              Add a new question & answer →
            </button>
          </div>
        </EmptyState>
      ) : (
        <div className={`${adminCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Category & Sort</th>
                  <th className="px-5 py-3.5">Question & Answer</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((faq) => (
                  <tr key={faq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 align-top w-48">
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-[#D6336C] border border-pink-100">
                          {faq.category}
                        </span>
                        <p className="text-xs text-slate-400 font-mono">Order: #{faq.sort_order}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1 max-w-2xl">
                        <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span className="text-[#D6336C]">Q:</span> {faq.question}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          <span className="font-semibold text-slate-400">A:</span> {faq.answer}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <button
                        onClick={() => togglePublished(faq)}
                        title="Click to toggle publish status"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          faq.is_published
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {faq.is_published ? (
                          <>
                            <Eye className="size-3.5 text-emerald-600" /> Live
                          </>
                        ) : (
                          <>
                            <EyeOff className="size-3.5 text-slate-400" /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditing(faq)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Edit FAQ"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => remove(faq)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                          title="Delete FAQ"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {editing !== undefined && (
        <FaqModal
          faq={editing}
          categories={DEFAULT_CATEGORIES}
          close={() => setEditing(undefined)}
        />
      )}
    </section>
  );
}

function FaqModal({
  faq,
  categories,
  close,
}: {
  faq: FaqItem | null;
  categories: string[];
  close: () => void;
}) {
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState(faq?.category ?? "Orders");
  const [customCategory, setCustomCategory] = useState("");
  const [sortOrder, setSortOrder] = useState(faq?.sort_order ?? 0);
  const [isPublished, setIsPublished] = useState(faq?.is_published ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const finalCategory = (customCategory.trim() || category).trim();

    if (!question.trim() || !answer.trim() || !finalCategory) {
      setError("Question, Answer, and Category are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      category: finalCategory,
      sort_order: Number(sortOrder) || 0,
      is_published: isPublished,
    };

    if (faq?.id) {
      const { error: updateErr } = await supabase
        .from("faqs")
        .update(payload)
        .eq("id", faq.id);
      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertErr } = await supabase.from("faqs").insert([payload]);
      if (insertErr) {
        setError(insertErr.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    close();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-xs overflow-y-auto">
      <form
        onSubmit={submit}
        className="my-8 flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {faq ? "Edit FAQ Item" : "Add New FAQ Item"}
            </h2>
            <p className="text-xs text-slate-500">Provide clear answers for customer questions.</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#FFF0F5] text-[#D6336C]">
            Customer Support
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <AdminError message={error} />}

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Question *
            <input
              className={`${adminInput} mt-1`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Do you ship across all cities in Pakistan?"
              required
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Answer *
            <textarea
              className="mt-1 h-36 w-full resize-y rounded-md border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-slate-500"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write the full response clearly with relevant details..."
              required
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Category
                <select
                  className={`${adminInput} mt-1`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Custom">+ Other (Custom)</option>
                </select>
              </label>
              {category === "Custom" && (
                <input
                  className={`${adminInput} mt-2`}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  required
                />
              )}
            </div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Display Sort Order
              <input
                type="number"
                className={`${adminInput} mt-1`}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
              />
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="faq-publish-toggle"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4 rounded text-[#D6336C] focus:ring-[#D6336C]"
            />
            <label htmlFor="faq-publish-toggle" className="text-xs font-bold text-slate-700 select-none">
              Publish immediately on /faqs
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={close}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`${adminButton} bg-[#D6336C] hover:bg-[#c02560] px-5`}
          >
            {saving ? "Saving…" : faq ? "Save Changes" : "Create FAQ"}
          </button>
        </div>
      </form>
    </div>
  );
}
