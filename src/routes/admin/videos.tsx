import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

type HomepageVideo = {
  id: string;
  title: string | null;
  video_url: string;
  thumbnail_url: string | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
};

export const Route = createFileRoute("/admin/videos")({
  component: Videos,
});

function Videos() {
  const [videos, setVideos] = useState<HomepageVideo[]>([]);
  const [editing, setEditing] = useState<HomepageVideo | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("homepage_videos")
      .select("*")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at");

    if (error) {
      setError(error.message);
    } else {
      setVideos((data ?? []) as HomepageVideo[]);
    }
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

  return (
    <section>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Videos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage homepage beauty reels.
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
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr className="border-t border-slate-100" key={video.id}>
                  <td className="px-5 py-3">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title ?? "Video thumbnail"}
                        loading="lazy"
                        decoding="async"
                        className="size-12 rounded object-cover"
                      />
                    ) : (
                      <div className="size-12 rounded bg-slate-100" />
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {video.title || "Untitled video"}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <VideoForm video={editing} close={() => setEditing(undefined)} />
      )}
    </section>
  );
}

function VideoForm({
  video,
  close,
}: {
  video: HomepageVideo | null;
  close: () => void;
}) {
  const [title, setTitle] = useState(video?.title ?? "");
  const [url, setUrl] = useState(video?.video_url ?? "");
  const [thumbnail, setThumbnail] = useState(video?.thumbnail_url ?? "");
  const [order, setOrder] = useState(video?.display_order?.toString() ?? "");
  const [active, setActive] = useState(video?.is_active ?? true);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      title: title || null,
      video_url: url,
      thumbnail_url: thumbnail || null,
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">
          {video ? "Edit video" : "Add video"}
        </h2>

        <label className="mt-5 block text-sm font-medium">
          Title / caption{" "}
          <span className="font-normal text-slate-400">(optional)</span>
          <input
            className={`${adminInput} mt-1`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Video URL
          <input
            className={`${adminInput} mt-1`}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Thumbnail image URL{" "}
          <span className="font-normal text-slate-400">(optional)</span>
          <input
            className={`${adminInput} mt-1`}
            type="url"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
          />
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
          <button type="submit" className={adminButton}>
            Save video
          </button>
        </div>
      </form>
    </div>
  );
}
