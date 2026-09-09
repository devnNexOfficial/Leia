import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

type Banner = {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  placement: "homepage_hero";
  display_order: number | null;
  is_active: boolean;
  created_at: string;
};

export const Route = createFileRoute("/admin/banners")({
  component: Banners,
});

function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("placement")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at");

    if (error) {
      setError(error.message);
    } else {
      setBanners((data ?? []) as Banner[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-banners")
      .on("postgres_changes", { event: "*", schema: "public", table: "banners" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const remove = async (banner: Banner) => {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase!.from("banners").delete().eq("id", banner.id);
    if (error) setError(error.message);
  };

  const toggle = async (banner: Banner) => {
    const { error } = await supabase!
      .from("banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id);
    if (error) setError(error.message);
  };

  return (
    <section>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage visual banners used on the storefront.
          </p>
        </div>
        <button className={adminButton} onClick={() => setEditing(null)}>
          <Plus className="mr-1 size-4" /> Add banner
        </button>
      </div>

      {error && <AdminError message={error} />}

      {loading ? (
        <AdminLoading />
      ) : banners.length === 0 ? (
        <EmptyState>No banners yet.</EmptyState>
      ) : (
        <div className={`${adminCard} overflow-x-auto`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Preview</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Placement</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr className="border-t border-slate-100" key={banner.id}>
                  <td className="px-5 py-3">
                    <img
                      src={banner.image_url}
                      alt={banner.title ?? "Banner preview"}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-20 rounded object-cover"
                    />
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {banner.title || "Untitled banner"}
                  </td>
                  <td className="px-5 py-3">Homepage Hero</td>
                  <td className="px-5 py-3">{banner.display_order ?? "—"}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggle(banner)}
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        banner.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {banner.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      className="mr-3"
                      onClick={() => setEditing(banner)}
                      aria-label="Edit banner"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => remove(banner)}
                      aria-label="Delete banner"
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
        <BannerForm banner={editing} close={() => setEditing(undefined)} />
      )}
    </section>
  );
}

function BannerForm({
  banner,
  close,
}: {
  banner: Banner | null;
  close: () => void;
}) {
  const [title, setTitle] = useState(banner?.title ?? "");
  const [image, setImage] = useState(banner?.image_url ?? "");
  const [link, setLink] = useState(banner?.link_url ?? "");
  const [order, setOrder] = useState(banner?.display_order?.toString() ?? "");
  const [active, setActive] = useState(banner?.is_active ?? true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (file: File) => {
    if (!supabase) return;
    setUploading(true);
    setError("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `banner-${crypto.randomUUID()}.${ext}`;
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
      title: title || null,
      image_url: image,
      link_url: link || null,
      placement: "homepage_hero",
      display_order: order ? Number(order) : null,
      is_active: active,
    };

    const result = banner
      ? await supabase!.from("banners").update(values).eq("id", banner.id)
      : await supabase!.from("banners").insert(values);

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
          {banner ? "Edit banner" : "Add banner"}
        </h2>

        <label className="mt-5 block text-sm font-medium">
          Title / label{" "}
          <span className="font-normal text-slate-400">(admin reference)</span>
          <input
            className={`${adminInput} mt-1`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Image URL or Upload
          </label>
          <div className="flex gap-2">
            <input
              className={`${adminInput} flex-1`}
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... or click Upload →"
              required={!image}
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
            <div className="mt-2 relative w-full h-28 rounded-lg overflow-hidden border border-slate-200">
              <img src={image} alt="Banner preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <label className="mt-4 block text-sm font-medium">
          Link URL <span className="font-normal text-slate-400">(optional)</span>
          <input
            className={`${adminInput} mt-1`}
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Placement
          <select className={`${adminInput} mt-1`} disabled>
            <option>Homepage Hero</option>
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium">
          Display order
          <input
            className={`${adminInput} mt-1`}
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
        </label>

        <label className="mt-4 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />{" "}
          Active on storefront
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="h-9 rounded border px-3 text-sm"
            onClick={close}
          >
            Cancel
          </button>
          <button type="submit" className={adminButton}>
            Save banner
          </button>
        </div>
      </form>
    </div>
  );
}
