import { createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import { legalPages, type LegalPageDefinition, type LegalPageSlug } from "@/lib/legal-pages";
import { supabase } from "@/lib/supabase";

type StoredPage = LegalPageDefinition & { updated_at?: string };

export const Route = createFileRoute("/admin/pages")({
  component: Pages,
});

function Pages() {
  const [pages, setPages] = useState<StoredPage[]>(legalPages);
  const [editing, setEditing] = useState<StoredPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data, error: queryError } = await supabase
      .from("site_pages")
      .select("slug, title, content, updated_at");

    if (queryError) {
      setError(queryError.message);
    } else {
      const overrides = new Map((data ?? []).map((page) => [page.slug, page]));
      setPages(
        legalPages.map((page) => ({
          ...page,
          ...(overrides.get(page.slug) ?? {}),
        })) as StoredPage[]
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("admin-site-pages")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_pages" }, load)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  return (
    <section>
      <div className="mb-7">
        <h1 className="text-2xl font-bold">Pages</h1>
        <p className="mt-1 text-sm text-slate-500">
          Edit legal and policy content shown in the storefront footer.
        </p>
      </div>

      {error && <AdminError message={error} />}

      {loading ? (
        <AdminLoading />
      ) : (
        <div className={`${adminCard} divide-y divide-slate-100`}>
          {pages.map((page) => (
            <div
              className="flex items-center justify-between gap-5 p-5"
              key={page.slug}
            >
              <div>
                <h2 className="font-semibold">{page.title}</h2>
                <p className="mt-1 text-sm text-slate-500">/{page.slug}</p>
              </div>
              <button
                className={adminButton}
                onClick={() => setEditing(page)}
              >
                <Pencil className="mr-1 size-4" /> Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <PageForm page={editing} close={() => setEditing(null)} />
      )}
    </section>
  );
}

function PageForm({
  page,
  close,
}: {
  page: StoredPage;
  close: () => void;
}) {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;

    setSaving(true);
    const { error: saveError } = await supabase
      .from("site_pages")
      .upsert(
        {
          slug: page.slug as LegalPageSlug,
          title: title.trim(),
          content: content.trim(),
        },
        { onConflict: "slug" }
      );

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
    } else {
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <form
        onSubmit={submit}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">Edit {page.title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use blank lines between paragraphs and start headings with ##.
        </p>

        <label className="mt-5 block text-sm font-medium">
          Title
          <input
            className={`${adminInput} mt-1`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label className="mt-4 block min-h-0 flex-1 text-sm font-medium">
          Content (markdown)
          <textarea
            className="mt-1 h-80 w-full resize-y rounded-md border border-slate-300 p-3 font-mono text-sm outline-none focus:border-slate-500"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
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
            disabled={saving}
          >
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      </form>
    </div>
  );
}
