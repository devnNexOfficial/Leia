import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import type { AdminCategory } from "@/lib/admin-types";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/categories")({
  component: Categories,
});

function Categories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminCategory | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at");

    if (error) {
      setError(error.message);
    } else {
      setCategories(data as AdminCategory[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-categories")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const remove = async (category: AdminCategory) => {
    if (!confirm(`Delete ${category.name}? Products in this category will become uncategorized.`)) {
      return;
    }
    const { error } = await supabase!.from("categories").delete().eq("id", category.id);
    if (error) setError(error.message);
  };

  return (
    <section>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Organize the storefront catalog.</p>
        </div>
        <button className={adminButton} onClick={() => setEditing(null)}>
          <Plus className="mr-1 size-4" /> Add category
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <AdminError message={error} />
        </div>
      )}

      {loading ? (
        <AdminLoading />
      ) : categories.length === 0 ? (
        <EmptyState>No categories yet. Add your first category.</EmptyState>
      ) : (
        <div className={`${adminCard} overflow-hidden`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr className="border-t border-slate-100" key={c.id}>
                  <td className="px-5 py-3">
                    {c.image_url ? (
                      <img
                        className="size-10 rounded object-cover"
                        src={c.image_url}
                        alt={c.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="size-10 rounded bg-slate-100" />
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3">
                    <button
                      className="mr-3 text-slate-500 hover:text-slate-900"
                      onClick={() => setEditing(c)}
                      aria-label={`Edit ${c.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      className="text-slate-500 hover:text-red-600"
                      onClick={() => remove(c)}
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <CategoryForm category={editing} close={() => setEditing(undefined)} />
      )}
    </section>
  );
}

function CategoryForm({
  category,
  close,
}: {
  category: AdminCategory | null;
  close: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [image, setImage] = useState(category?.image_url ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(category?.display_order?.toString() ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (file: File) => {
    if (!supabase) return;
    setUploading(true);
    setError("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `category-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        setError(uploadError.message);
      } else {
        const publicUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
        setImage(publicUrl);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      name,
      image_url: image || null,
      description: description || null,
      display_order: displayOrder === "" ? null : Number(displayOrder),
    };

    const result = category
      ? await supabase!.from("categories").update(values).eq("id", category.id)
      : await supabase!.from("categories").insert(values);

    if (result.error) {
      setError(result.error.message);
    } else {
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">
          {category ? "Edit category" : "Add category"}
        </h2>

        <label className="mt-5 block text-sm font-medium">
          Name
          <input
            className={`${adminInput} mt-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Description <span className="font-normal text-slate-400">(optional)</span>
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-slate-300 p-3 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Display order <span className="font-normal text-slate-400">(optional)</span>
          <input
            className={`${adminInput} mt-1`}
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </label>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Image URL or Upload{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              className={`${adminInput} flex-1`}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... or click Upload →"
            />
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0">
              <Upload className="size-3.5" />
              {uploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
          </div>
          {image && (
            <div className="mt-2 relative w-full h-24 rounded-lg overflow-hidden border border-slate-200">
              <img src={image} alt="Category preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="h-9 rounded-md border px-3 text-sm"
            onClick={close}
          >
            Cancel
          </button>
          <button type="submit" className={adminButton}>
            Save category
          </button>
        </div>
      </form>
    </div>
  );
}
