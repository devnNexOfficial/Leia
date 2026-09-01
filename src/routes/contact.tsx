import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle, Instagram } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/lib/supabase";
import { sendContactNotification } from "@/lib/order-emails";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot spam check: Bots fill hidden inputs; humans don't
    if (honeypot.trim()) {
      // Silently discard bot submission with simulated success
      setSent(true);
      return;
    }

    // Strict input validation
    if (!form.name.trim() || form.name.trim().length < 2 || !/^[a-zA-Z\s'.]{2,50}$/.test(form.name.trim())) {
      setError("Please enter a valid name (letters only, minimum 2 characters).");
      return;
    }

    if (!form.email.trim() || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email.trim())) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    if (!form.message.trim() || form.message.trim().length < 5) {
      setError("Please enter a message (minimum 5 characters).");
      return;
    }

    if (!supabase) {
      setError("Contact messages are temporarily unavailable. Please try again shortly.");
      return;
    }

    setSubmitting(true);
    setError("");
    const formattedMessage = form.subject.trim()
      ? `Subject: ${form.subject.trim()}\n\n${form.message.trim()}`
      : form.message.trim();

    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      message: formattedMessage,
      is_read: false,
    });
    setSubmitting(false);

    if (insertError) {
      setError("We couldn't send your message. Please check your connection and try again.");
      return;
    }

    // Trigger asynchronous admin email alert (does not block or fail user submission)
    void sendContactNotification({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      message: formattedMessage,
    });

    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#FFF0F5] via-white to-[#F9F0FF] py-20 px-5 border-b border-gray-100 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
            <MessageCircle className="size-3.5" /> Get In Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">We'd Love to <span className="text-[#D6336C]">Hear</span><br />From You</h1>
          <p className="text-gray-500 text-base">Our team is here to help. Reach out anytime.</p>
        </div>
      </section>

      <section className="py-16 px-5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Contact Information</h2>
              <p className="text-gray-500 text-sm">Mon – Sat · 9:00 AM – 6:00 PM (PKT)</p>
            </div>

            {[
              { icon: Phone, label: "WhatsApp / Call", value: "+92 300 0000000", href: "tel:+923000000000", color: "bg-emerald-50 text-emerald-600" },
              { icon: Mail, label: "Email Us", value: "hello@leia.pk", href: "mailto:hello@leia.pk", color: "bg-[#FFF0F5] text-[#D6336C]" },
              { icon: Instagram, label: "Instagram", value: "@leia.pk", href: "https://instagram.com", color: "bg-purple-50 text-purple-600" },
              { icon: MapPin, label: "Head Office", value: "Lahore, Punjab, Pakistan", href: "#", color: "bg-amber-50 text-amber-600" },
              { icon: Clock, label: "Business Hours", value: "Mon–Sat · 9AM–6PM PKT", href: "#", color: "bg-sky-50 text-sky-600" },
            ].map(({ icon: Icon, label, value, href, color }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#D6336C]/30 hover:shadow-md transition-all group"
              >
                <div className={`size-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#D6336C] transition-colors">{value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 max-w-xs">We've received your message and will get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-sm font-bold text-[#D6336C] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-gray-900 mb-6">Send us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot field for bot/spam prevention */}
                  <input
                    type="text"
                    name="organization_fax"
                    value={honeypot}
                    onChange={e => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="opacity-0 absolute -z-10 pointer-events-none h-0 w-0"
                    aria-hidden="true"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Name *</label>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Ayesha Khan"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D6336C] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@email.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D6336C] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Subject</label>
                    <input
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="Order issue, product query..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D6336C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us how we can help..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#D6336C] transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#D6336C] hover:bg-[#c02560] text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Send className="size-4" /> {submitting ? "Sending..." : "Send Message"}
                  </button>
                  {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
