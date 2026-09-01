import type { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

type UtilityPageLayoutProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function UtilityPageLayout({ eyebrow, title, intro, children }: UtilityPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-gradient-to-br from-[#FFF0F5] via-white to-[#F9F0FF] border-b border-gray-100 px-5 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#D6336C]">{eyebrow}</p>
          <h1 className="mb-4 text-4xl font-black text-gray-900 md:text-5xl">{title}</h1>
          <p className="text-base text-gray-500">{intro}</p>
        </div>
      </section>
      <main className="mx-auto max-w-4xl px-5 py-14">{children}</main>
      <Footer />
    </div>
  );
}
