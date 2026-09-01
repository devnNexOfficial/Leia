import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

type Subscriber = { id: string; email: string; subscribed_at: string };

export const Route = createFileRoute("/admin/subscribers")({
  component: Subscribers,
});

function Subscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data, error: queryError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setSubscribers((data ?? []) as Subscriber[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("admin-newsletter-subscribers")
      .on("postgres_changes", { event: "*", schema: "public", table: "newsletter_subscribers" }, load)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(
        subscribers.map((subscriber) => subscriber.email).join("\n")
      );
      setNotice("All email addresses copied.");
    } catch {
      setNotice("Couldn't copy automatically. Please try again.");
    }
  };

  const exportCsv = () => {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [
      "Email,Subscribed at",
      ...subscribers.map(
        (subscriber) =>
          `${escape(subscriber.email)},${escape(subscriber.subscribed_at)}`
      ),
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "newsletter-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Newsletter subscribers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Emails collected from the storefront signup form.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={adminButton}
            onClick={copyAll}
            disabled={subscribers.length === 0}
          >
            <Copy className="mr-1 size-4" /> Copy all emails
          </button>
          <button
            className={adminButton}
            onClick={exportCsv}
            disabled={subscribers.length === 0}
          >
            <Download className="mr-1 size-4" /> Export CSV
          </button>
        </div>
      </div>

      {notice && <p className="mb-4 text-sm text-emerald-700">{notice}</p>}
      {error && <AdminError message={error} />}

      {loading ? (
        <AdminLoading />
      ) : subscribers.length === 0 ? (
        <EmptyState>No newsletter subscribers yet.</EmptyState>
      ) : (
        <div className={`${adminCard} overflow-x-auto`}>
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Subscribed at</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr className="border-t border-slate-100" key={subscriber.id}>
                  <td className="px-5 py-3 font-medium">
                    <Mail className="mr-2 inline size-4 text-slate-400" />
                    {subscriber.email}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(subscriber.subscribed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
