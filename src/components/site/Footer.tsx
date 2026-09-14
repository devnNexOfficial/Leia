"use client";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useNewsletterSignup } from "@/hooks/useNewsletterSignup";

const columns = [
  {
    title: "COMPANY",
    links: [
      { name: "Shop", to: "/shop" },
      { name: "Our Story", to: "/about" },
      { name: "Reviews", to: "/reviews" },
      { name: "Blog", to: "/blog" },
    ],
  },
  {
    title: "SUPPORT",
    links: [
      { name: "FAQs", to: "/faqs" },
      { name: "Contact Us", to: "/contact" },
      { name: "Call / WhatsApp: 0341-7813558", href: "https://wa.me/923417813558?text=Hi!%20I%20have%20a%20question%20about%20LEIA%20products." },
    ],
  },
];

export function Footer() {
  const { email, setEmail, honeypot, setHoneypot, status, message, submit } = useNewsletterSignup();
  const subscribed = status === "success" || status === "duplicate";

  return (
    <footer className="w-full select-none overflow-x-hidden">
      {/* ── Straight Top Divider ── */}
      <div className="w-full flex flex-col pointer-events-none">
        <div className="w-full h-6 bg-[#EAA0B8]"></div>
      </div>

      {/* ── Main Footer Body ── */}
      <div className="bg-[#D6527B] text-white pb-8 pt-4 -mt-0.5">

      <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-20">
        {/* Top Grid: Links + Newsletter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16 items-start">
          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-black tracking-widest text-white/90 uppercase mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.name}>
                    {"href" in link && link.href ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/70 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.to!}
                        className="text-xs text-white/70 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Box Column (Spans 2 cols on lg) */}
          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <h4 className="text-[11px] font-black tracking-widest text-white/90 uppercase mb-2">
              NEWSLETTER
            </h4>
            <p className="text-xs text-white/80 font-medium mb-4">
              ✦ Get 15% off your first order
            </p>

            {subscribed ? (
              <div className="bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 text-xs text-white border border-white/30 font-semibold">
                🎉 {message}
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                {/* Honeypot field for bot/spam prevention */}
                <input
                  type="text"
                  name="company_fax_number"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="opacity-0 absolute -z-10 pointer-events-none h-0 w-0"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/20 backdrop-blur-md placeholder-white/60 text-white text-xs rounded-full px-4 py-2.5 outline-none border border-white/30 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-white text-[#D6527B] hover:bg-gray-100 text-xs font-black px-5 py-2.5 rounded-full uppercase tracking-wider transition-colors shrink-0 shadow-md"
                >
                  {status === "loading" ? "Sending…" : "Subscribe"}
                </button>
              </form>
            )}
            {status === "error" && <p className="mt-2 text-[10px] font-semibold text-white">{message}</p>}
            <p className="text-[10px] text-white/50 mt-2">
              Purity formulas without compromises. What works.
            </p>
          </div>
        </div>

        {/* Legal Links */}
        <div className="relative z-30 flex flex-col items-center justify-center gap-4 mb-12 text-center border-t border-white/15 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-white/70">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <span>·</span>
            <Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>

        {/* ── GIGANTIC DISPLAY BRAND LOGO ── */}
        <div className="relative w-full py-4 md:py-8 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 60 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 10,
              mass: 0.8,
            }}
            className="w-full text-center"
          >
            <h1
              className="font-bodoni text-[clamp(5rem,18vw,18rem)] leading-[0.85] text-white/95 font-bold tracking-[0.25em] md:tracking-[0.35em] select-none uppercase drop-shadow-2xl pl-[0.25em]"
              style={{
                textShadow: "0 0 80px rgba(255,255,255,0.15), 0 4px 32px rgba(0,0,0,0.2)"
              }}
            >
              {["L", "E", "I", "A"].map((char, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: i * 0.15 
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </h1>
          </motion.div>

          {/* Bottom copyright bar */}
          <div className="w-full flex flex-col items-center justify-center gap-1 text-[11px] text-white/80 pt-6 border-t border-white/20 mt-4 text-center">
            <p>© {new Date().getFullYear()} Leia. All rights reserved.</p>
            <p className="text-[10px] text-white/70 tracking-wide">A project by Devnex Innovation</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
}
