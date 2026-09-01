import { createFileRoute } from "@tanstack/react-router";
import {
  MessageSquare,
  Search,
  Trash2,
  CheckCircle,
  Mail,
  User,
  Clock,
  ExternalLink,
  X,
  Eye,
  EyeOff,
  Inbox,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessagesPage,
});

function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read">("all");

  const load = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setMessages((data ?? []) as ContactMessage[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-contact-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const remove = async (msg: ContactMessage) => {
    if (!confirm(`Are you sure you want to delete the message from "${msg.name}"?`)) return;
    const { error } = await supabase!.from("contact_messages").delete().eq("id", msg.id);
    if (error) {
      setError(error.message);
    } else {
      if (activeMessage?.id === msg.id) setActiveMessage(null);
    }
  };

  const toggleReadStatus = async (msg: ContactMessage, forceStatus?: boolean) => {
    const nextStatus = forceStatus !== undefined ? forceStatus : !msg.is_read;
    const { error } = await supabase!
      .from("contact_messages")
      .update({ is_read: nextStatus })
      .eq("id", msg.id);

    if (error) {
      setError(error.message);
    } else {
      if (activeMessage?.id === msg.id) {
        setActiveMessage({ ...activeMessage, is_read: nextStatus });
      }
    }
  };

  const handleOpenMessage = (msg: ContactMessage) => {
    setActiveMessage(msg);
    if (!msg.is_read) {
      void toggleReadStatus(msg, true);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === "unread") return !m.is_read;
    if (filterTab === "read") return m.is_read;
    return true;
  });

  return (
    <section className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
            <MessageSquare className="size-6 text-[#D6336C]" /> Customer Messages & Inquiries
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View, read, and respond to incoming customer messages submitted via the Contact Us form.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FFF0F5] text-[#D6336C] border border-[#F5C6D5] self-start sm:self-auto">
            <span className="size-2 rounded-full bg-[#D6336C] animate-pulse" />
            {unreadCount} unread {unreadCount === 1 ? "inquiry" : "inquiries"}
          </span>
        )}
      </div>

      {error && <AdminError message={error} />}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or message…"
            className={`${adminInput} pl-9`}
          />
        </div>

        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterTab === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            onClick={() => setFilterTab("unread")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterTab === "unread"
                ? "bg-[#D6336C] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="size-4 rounded-full bg-white text-[#D6336C] text-[10px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab("read")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterTab === "read"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {loading ? (
        <AdminLoading />
      ) : filtered.length === 0 ? (
        <EmptyState>
          <div className="text-center py-8">
            <Inbox className="size-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No contact messages found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              New inquiries from the Contact Us form will appear here in real-time.
            </p>
          </div>
        </EmptyState>
      ) : (
        <div className={`${adminCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Sender</th>
                  <th className="px-5 py-3.5">Message Preview</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((msg) => {
                  const dateStr = new Date(msg.created_at).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });

                  return (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        !msg.is_read ? "bg-[#FFF8FA]/60 font-semibold" : ""
                      }`}
                    >
                      <td className="px-5 py-4 w-28" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleReadStatus(msg)}
                          title="Click to toggle read / unread"
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                            !msg.is_read
                              ? "bg-[#D6336C] text-white shadow-xs"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {!msg.is_read ? (
                            <>
                              <span className="size-1.5 rounded-full bg-white animate-ping" />
                              Unread
                            </>
                          ) : (
                            <>
                              <CheckCircle className="size-3 text-slate-400" />
                              Read
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-4 w-60">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{msg.name}</p>
                          <a
                            href={`mailto:${msg.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-[#D6336C] hover:underline truncate block"
                          >
                            {msg.email}
                          </a>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs text-slate-600 line-clamp-2 max-w-xl leading-relaxed">
                          {msg.message}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`mailto:${msg.email}?subject=Re: Your LEIA inquiry`}
                            className="p-1.5 rounded-lg text-[#D6336C] hover:bg-[#FFF0F5] transition-colors"
                            title="Reply via Email"
                          >
                            <Send className="size-4" />
                          </a>
                          <button
                            onClick={() => handleOpenMessage(msg)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="View Full Message"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => remove(msg)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Message Detail Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-[#D6336C] p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-200">
                  Customer Inquiry
                </span>
                <h2 className="text-xl font-bold">{activeMessage.name}</h2>
              </div>
              <button
                onClick={() => setActiveMessage(null)}
                className="size-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Meta Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFF5F8] p-4 rounded-2xl border border-[#F5C6D5]/60">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </p>
                  <a
                    href={`mailto:${activeMessage.email}`}
                    className="text-xs font-bold text-[#D6336C] hover:underline"
                  >
                    {activeMessage.email}
                  </a>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Received Date
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {new Date(activeMessage.created_at).toLocaleString("en-PK", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Message Content:
                </p>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                  {activeMessage.message}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleReadStatus(activeMessage)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  {activeMessage.is_read ? (
                    <>
                      <EyeOff className="size-3.5 text-slate-400" /> Mark as Unread
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-3.5 text-emerald-600" /> Mark as Read
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => remove(activeMessage)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                  <a
                    href={`mailto:${activeMessage.email}?subject=Re: Your LEIA inquiry`}
                    className="px-5 py-2 rounded-xl bg-[#D6336C] hover:bg-[#c02560] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Send className="size-3.5" /> Reply to Customer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
