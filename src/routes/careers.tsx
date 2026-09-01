import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, MapPin, Clock, Heart, ArrowRight, Star, Users, Sparkles } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
});

const openings = [
  { title: "Social Media Manager", dept: "Marketing", type: "Full-Time", location: "Lahore", desc: "Manage our Instagram, TikTok, and Facebook presence. Create content, run campaigns, and grow our community of 500K+ followers." },
  { title: "Beauty Content Creator", dept: "Content", type: "Part-Time / Freelance", location: "Remote", desc: "Create tutorials, reviews, and lifestyle content featuring our products. Must have 10K+ following and a passion for Pakistani beauty." },
  { title: "Customer Experience Lead", dept: "Support", type: "Full-Time", location: "Lahore", desc: "Lead our customer support team across WhatsApp, email, and social DMs. Ensure every Leia customer has an exceptional experience." },
  { title: "Operations Coordinator", dept: "Operations", type: "Full-Time", location: "Lahore", desc: "Coordinate between warehouse, courier partners, and customer support. Manage order fulfillment and logistics for our growing order volume." },
];

const perks = [
  { icon: Heart, label: "Product Allowance", desc: "PKR 5,000/month to spend on any Leia products", color: "text-[#D6336C] bg-[#FFF0F5]" },
  { icon: Star, label: "Performance Bonus", desc: "Quarterly bonuses tied to team and personal targets", color: "text-amber-600 bg-amber-50" },
  { icon: Users, label: "Collaborative Culture", desc: "Young, passionate team obsessed with beauty", color: "text-purple-600 bg-purple-50" },
  { icon: Sparkles, label: "Growth Opportunities", desc: "Fast-growing startup with room to grow fast", color: "text-emerald-600 bg-emerald-50" },
];

function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-[#FFF0F5] via-white to-[#F9F0FF] py-20 px-5 border-b border-gray-100 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5">
            <Briefcase className="size-3.5" /> Join Our Team
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Build the Future of<br /><span className="text-[#D6336C]">Pakistani Beauty</span></h1>
          <p className="text-gray-500 text-base">We're a fast-growing beauty e-commerce brand looking for passionate people to join us.</p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-14 px-5 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Why Work at Leia?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {perks.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-xs hover:shadow-md transition-shadow">
                <div className={`size-12 rounded-2xl ${color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="size-6" />
                </div>
                <p className="text-sm font-black text-gray-900 mb-1">{label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Open Positions</h2>
          <p className="text-sm text-gray-500 mb-8">All positions are based in Lahore unless stated otherwise.</p>
          <div className="space-y-4">
            {openings.map(job => (
              <div key={job.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#D6336C]/30 transition-all group">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="bg-[#FFF0F5] text-[#D6336C] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">{job.dept}</span>
                      <span className="bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="size-3" />{job.type}</span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1"><MapPin className="size-3" />{job.location}</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{job.desc}</p>
                  </div>
                  <a
                    href="/contact"
                    className="shrink-0 flex items-center gap-2 bg-[#D6336C] hover:bg-[#c02560] text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors shadow-sm group-hover:shadow-md"
                  >
                    Apply Now <ArrowRight className="size-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#FFF0F5] border border-[#F5C6D5]/60 rounded-3xl p-8 text-center">
            <h3 className="text-lg font-black text-gray-900 mb-2">Don't see a role that fits?</h3>
            <p className="text-sm text-gray-500 mb-5">We're always looking for exceptional people. Send us your CV and tell us how you can contribute.</p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-[#D6336C] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#c02560] transition-colors shadow-md">
              Send an Open Application <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
