import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Upload, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { getVideoSourceInfo } from "@/lib/video-helpers";

type HomepageVideo = {
  id: string;
  title: string | null;
  video_url: string;
  thumbnail_url: string | null;
  product_id: string | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
};

type ProductOption = {
  id: string;
  name: string;
  price: number;
};

export const Route = createFileRoute("/admin/videos")({
  component: Videos,
});

/** 50 MB client-side limit for video uploads */
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

function Videos() {
  const [videos, setVideos] = useState<HomepageVideo[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [editing, setEditing] = useState<HomepageVideo | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data: vData, error: vErr } = await supabase
      .from("homepage_videos")
      .select("*")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at");

    if (vErr) {
      setError(vErr.message);
    } else {
      setVideos((vData ?? []) as HomepageVideo[]);
    }

    const { data: pData } = await supabase
      .from("products")
      .select("id, name, price")
      .order("name");

    setProducts((pData ?? []) as ProductOption[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-videos")
      .on("postgres_changes", { event: "*", schema: "public", table: "homepage_videos" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const remove = async (video: HomepageVideo) => {
    if (!confirm("Delete this video?")) return;
    const { error } = await supabase!.from("homepage_videos").delete().eq("id", video.id);
    if (error) setError(error.message);
  };

  const toggle = async (video: HomepageVideo) => {
    const { error } = await supabase!
      .from("homepage_videos")
      .update({ is_active: !video.is_active })
      .eq("id", video.id);
    if (error) setError(error.message);
  };

  const getProductName = (productId: string | null) => {
    if (!productId) return null;
    return products.find((p) => p.id === productId)?.name || null;
  };

  return (
    <section>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Videos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage homepage beauty reels, YouTube, Instagram & Facebook video links.
          </p>
        </div>
        <button className={adminButton} onClick={() => setEditing(null)}>
          <Plus className="mr-1 size-4" /> Add video
        </button>
      </div>

      {error && <AdminError message={error} />}

      {loading ? (
        <AdminLoading />
      ) : videos.length === 0 ? (
        <EmptyState>No homepage videos yet.</EmptyState>
      ) : (
        <div className={`${adminCard} overflow-x-auto`}>
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Thumbnail</th>
                <th className="px-5 py-3">Title & Type</th>
                <th className="px-5 py-3">Linked Product</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => {
                const source = getVideoSourceInfo(video.video_url, video.thumbnail_url);
                const thumb = video.thumbnail_url || source.thumbnailUrl;
                const linkedProduct = getProductName(video.product_id);

                return (
                  <tr className="border-t border-slate-100" key={video.id}>
                    <td className="px-5 py-3">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={video.title ?? "Video thumbnail"}
                          loading="lazy"
                          decoding="async"
                          className="size-12 rounded object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="size-12 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                          <Video className="size-5 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      <div>
                        {video.title || "Untitled video"}
                        <div className="mt-0.5 inline-block">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {source.badgeLabel}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {linkedProduct ? (
                        <span className="font-semibold text-slate-800">{linkedProduct}</span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3">{video.display_order ?? "—"}</td>
                    <td className="px-5 py-3">
                      <button
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          video.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                        onClick={() => toggle(video)}
                      >
                        {video.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        className="mr-3"
                        onClick={() => setEditing(video)}
                        aria-label="Edit video"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        className="text-red-600"
                        onClick={() => remove(video)}
                        aria-label="Delete video"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <VideoForm video={editing} products={products} close={() => setEditing(undefined)} />
      )}
    </section>
  );
}

function VideoForm({
  video,
  products,
  close,
}: {
  video: HomepageVideo | null;
  products: ProductOption[];
  close: () => void;
}) {
  const [title, setTitle] = useState(video?.title ?? "");
  const [url, setUrl] = useState(video?.video_url ?? "");
  const [thumbnail, setThumbnail] = useState(video?.thumbnail_url ?? "");
  const [productId, setProductId] = useState(video?.product_id ?? "");
  const [order, setOrder] = useState(video?.display_order?.toString() ?? "");
  const [active, setActive] = useState(video?.is_active ?? true);

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [error, setError] = useState("");

  const sourceInfo = getVideoSourceInfo(url, thumbnail);

  // ── Video file upload ────────────────────────────────────────────────────────
  const handleVideoUpload = async (file: File) => {
    if (!supabase) return;

    if (file.size > VIDEO_MAX_BYTES) {
      setError(
        `Video file is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 50 MB.`
      );
      return;
    }

    setUploadingVideo(true);
    setError("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `video-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError(uploadError.message);
      } else {
        const publicUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(path).data.publicUrl;
        setUrl(publicUrl);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setUploadingVideo(false);
    }
  };

  // ── Thumbnail image upload ───────────────────────────────────────────────────
  const handleThumbnailUpload = async (file: File) => {
    if (!supabase) return;
    setUploadingThumb(true);
    setError("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `thumbnail-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError(uploadError.message);
      } else {
        const publicUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(path).data.publicUrl;
        setThumbnail(publicUrl);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setUploadingThumb(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("A video URL or uploaded file is required.");
      return;
    }
    const values = {
      title: title || null,
      video_url: url,
      thumbnail_url: thumbnail || null,
      product_id: productId || null,
      display_order: order ? Number(order) : null,
      is_active: active,
    };

    const result = video
      ? await supabase!.from("homepage_videos").update(values).eq("id", video.id)
      : await supabase!.from("homepage_videos").insert(values);

    if (result.error) {
      setError(result.error.message);
    } else {
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 overflow-y-auto">
      <form
        onSubmit={submit}
        className="my-6 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">
          {video ? "Edit video" : "Add video"}
        </h2>

        {/* Title */}
        <label className="mt-5 block text-sm font-medium">
          Title / caption{" "}
          <span className="font-normal text-slate-400">(optional)</span>
          <input
            className={`${adminInput} mt-1`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        {/* ── Video URL / Upload ─────────────────────────────────────────────── */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Video URL or Upload{" "}
            <span className="font-normal text-slate-400">
              (YouTube, Instagram Reel, Facebook, or .mp4)
            </span>
          </label>
          <div className="flex gap-2">
            <input
              className={`${adminInput} flex-1`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube, Instagram, Facebook URL or upload file →"
              required={!url}
            />
            <label
              className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ${
                uploadingVideo ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <Upload className="size-3.5" />
              {uploadingVideo ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/*"
                className="hidden"
                disabled={uploadingVideo}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoUpload(file);
                }}
              />
            </label>
          </div>
          {/* Progress hint while uploading */}
          {uploadingVideo && (
            <p className="mt-1.5 text-xs text-slate-500 animate-pulse">
              Uploading video — this may take a moment for larger files…
            </p>
          )}

          {/* Source badge & preview hint */}
          {url && !uploadingVideo && (
            <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
              <span className="font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 uppercase">
                Detected: {sourceInfo.badgeLabel}
              </span>
              {sourceInfo.type === "youtube" && (
                <span className="text-emerald-600 font-medium">✓ YouTube auto-embed enabled</span>
              )}
              {sourceInfo.type === "instagram" && (
                <span className="text-indigo-600 font-medium">✓ Instagram reel embed enabled</span>
              )}
              {sourceInfo.type === "facebook" && (
                <span className="text-blue-600 font-medium">✓ Facebook video embed enabled</span>
              )}
            </div>
          )}

          {/* Direct video preview */}
          {url && !uploadingVideo && sourceInfo.type === "direct" && (
            <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video">
              <video
                src={url}
                className="w-full h-full object-contain"
                controls
                preload="metadata"
              />
            </div>
          )}
        </div>

        {/* ── Linked Product (Optional) ─────────────────────────────────────── */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Linked product <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <select
            className={`${adminInput} w-full`}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">-- None (No product linked) --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (PKR {p.price})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-400">
            If selected, a &quot;Featured Product&quot; card and &quot;Buy Now&quot; button will appear on the video. If left empty, no product overlay will be shown.
          </p>
        </div>

        {/* ── Thumbnail URL / Upload ─────────────────────────────────────────── */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Thumbnail image URL or Upload{" "}
            <span className="font-normal text-slate-400">
              ({sourceInfo.type === "youtube" ? "Auto-fetched from YouTube if left empty" : "optional"})
            </span>
          </label>
          <div className="flex gap-2">
            <input
              className={`${adminInput} flex-1`}
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://... or click Upload →"
            />
            <label
              className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ${
                uploadingThumb ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <Upload className="size-3.5" />
              {uploadingThumb ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingThumb}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailUpload(file);
                }}
              />
            </label>
          </div>
          {(thumbnail || sourceInfo.thumbnailUrl) && !uploadingThumb && (
            <div className="mt-2 relative w-full h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
              <img
                src={thumbnail || sourceInfo.thumbnailUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              {!thumbnail && sourceInfo.type === "youtube" && (
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur">
                  YouTube Thumbnail Auto-fetched
                </span>
              )}
            </div>
          )}
        </div>

        {/* Display order */}
        <label className="mt-4 block text-sm font-medium">
          Display order
          <input
            className={`${adminInput} mt-1`}
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
        </label>

        {/* Active toggle */}
        <label className="mt-4 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />{" "}
          Active on homepage
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
          <button
            type="submit"
            className={adminButton}
            disabled={uploadingVideo || uploadingThumb}
          >
            Save video
          </button>
        </div>
      </form>
    </div>
  );
}
