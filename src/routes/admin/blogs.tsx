import { createFileRoute } from "@tanstack/react-router";
import {
  Pencil,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  BookOpen,
  Calendar,
  User,
  Clock,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

export type BlogPost = {
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
  updated_at: string;
};

export const Route = createFileRoute("/admin/blogs")({
  component: AdminBlogsPage,
});

function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const load = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setBlogs((data ?? []) as BlogPost[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-blogs-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const remove = async (blog: BlogPost) => {
    if (!confirm(`Are you sure you want to delete the blog post "${blog.title}"?`)) return;
    const { error } = await supabase!.from("blog_posts").delete().eq("id", blog.id);
    if (error) setError(error.message);
  };

  const togglePublished = async (blog: BlogPost) => {
    const { error } = await supabase!
      .from("blog_posts")
      .update({ published: !blog.published })
      .eq("id", blog.id);
    if (error) setError(error.message);
  };

  const categories = ["All", ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(search.toLowerCase())) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
            <BookOpen className="size-6 text-[#D6336C]" /> Blogs & Articles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Write, publish, and manage skincare guides, beauty stories, and makeup tutorials.
          </p>
        </div>
        <button
          className={`${adminButton} bg-[#D6336C] hover:bg-[#c02560] shadow-sm`}
          onClick={() => setEditing(null)}
        >
          <Plus className="mr-1.5 size-4" /> New Blog Post
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
            placeholder="Search posts by title or topic…"
            className={`${adminInput} pl-9`}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
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
            <p className="text-sm text-slate-500">No blog posts found matching your filters.</p>
            <button
              className="mt-3 text-xs font-bold text-[#D6336C] hover:underline"
              onClick={() => setEditing(null)}
            >
              Create your first article →
            </button>
          </div>
        </EmptyState>
      ) : (
        <div className={`${adminCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Article</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Author & Read Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {blog.cover_image ? (
                          <img
                            src={blog.cover_image}
                            alt={blog.title}
                            className="size-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                        ) : (
                          <div className="size-12 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-[#D6336C] shrink-0">
                            <BookOpen className="size-5" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-md">
                          <p className="font-bold text-slate-900 truncate">{blog.title}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            /{blog.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600 space-y-0.5">
                      <p className="flex items-center gap-1 font-medium text-slate-900">
                        <User className="size-3 text-slate-400" /> {blog.author}
                      </p>
                      <p className="flex items-center gap-1 text-slate-400">
                        <Clock className="size-3" /> {blog.read_time}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePublished(blog)}
                        title="Click to toggle publish status"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          blog.published
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {blog.published ? (
                          <>
                            <Eye className="size-3.5 text-emerald-600" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="size-3.5 text-slate-400" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditing(blog)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Edit article"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => remove(blog)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                          title="Delete article"
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

      {/* Create / Edit Modal Form */}
      {editing !== undefined && (
        <BlogModal blog={editing} close={() => setEditing(undefined)} />
      )}
    </section>
  );
}

function BlogModal({
  blog,
  close,
}: {
  blog: BlogPost | null;
  close: () => void;
}) {
  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [category, setCategory] = useState(blog?.category ?? "Beauty Guide");
  const [author, setAuthor] = useState(blog?.author ?? "LEIA Editorial");
  const [readTime, setReadTime] = useState(blog?.read_time ?? "4 min read");
  const [coverImage, setCoverImage] = useState(blog?.cover_image ?? "");
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? "");
  const [content, setContent] = useState(blog?.content ?? "");
  const [published, setPublished] = useState(blog?.published ?? true);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!blog) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!supabase) return;
    setUploading(true);
    setError("");

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `blog-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError(uploadError.message);
      } else {
        const publicUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
        setCoverImage(publicUrl);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug, and content are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      category: category.trim(),
      author: author.trim(),
      read_time: readTime.trim(),
      cover_image: coverImage.trim() || null,
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      published,
    };

    if (blog?.id) {
      const { error: updateError } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", blog.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("blog_posts").insert([payload]);
      if (insertError) {
        setError(insertError.message);
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
        className="my-8 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {blog ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
            <p className="text-xs text-slate-500">
              Fill in the article details, cover image, and markdown body.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#FFF0F5] text-[#D6336C]">
            LEIA Journal
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <AdminError message={error} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Title *
              <input
                className={`${adminInput} mt-1`}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 5 Steps to Glowing Glass Skin"
                required
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              URL Slug *
              <input
                className={`${adminInput} mt-1 font-mono text-xs`}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. 5-steps-glowing-glass-skin"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Category
              <select
                className={`${adminInput} mt-1`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Beauty Guide">Beauty Guide</option>
                <option value="Skincare Rituals">Skincare Rituals</option>
                <option value="Makeup Tutorials">Makeup Tutorials</option>
                <option value="Product Reviews">Product Reviews</option>
                <option value="Brand Stories">Brand Stories</option>
                <option value="Tips & Trends">Tips & Trends</option>
              </select>
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Author
              <input
                className={`${adminInput} mt-1`}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Dr. Areesha Malik"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Read Time
              <input
                className={`${adminInput} mt-1`}
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 4 min read"
              />
            </label>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Cover Image URL or Upload
            </label>
            <div className="flex gap-2">
              <input
                className={`${adminInput} flex-1`}
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0">
                <Upload className="size-3.5" />
                {uploading ? "Uploading…" : "Upload"}
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
            {coverImage && (
              <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Excerpt */}
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Short Excerpt (Summary for Cards)
            <textarea
              className="mt-1 h-20 w-full resize-y rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-slate-500"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief 1-2 sentence hook for readers shown in the blog feed..."
            />
          </label>

          {/* Full Markdown Content */}
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Article Content (Markdown Supported) *
            <textarea
              className="mt-1 h-64 w-full resize-y rounded-md border border-slate-300 p-3 font-mono text-xs text-slate-900 outline-none focus:border-slate-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`## Introduction\n\nStart your article here. Use ## for headings and - for bullet points.\n\n### Key Tips\n- Tip 1\n- Tip 2`}
              required
            />
          </label>

          {/* Publication Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="published-toggle"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="size-4 rounded text-[#D6336C] focus:ring-[#D6336C]"
            />
            <label htmlFor="published-toggle" className="text-xs font-bold text-slate-700 select-none">
              Publish immediately (visible to all customers on /blog)
            </label>
          </div>
        </div>

        {/* Modal Footer */}
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
            {saving ? "Saving…" : blog ? "Save Changes" : "Publish Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
