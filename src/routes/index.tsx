import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { PressMarquee } from "@/components/site/PressMarquee";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { NewArrivalsSection } from "@/components/site/NewArrivalsSection";
import { Footer } from "@/components/site/Footer";
import heroKylie from "@/assets/hero-kylie.webp";

const ReviewsSection = lazy(() =>
  import("@/components/site/ReviewsSection").then((m) => ({ default: m.ReviewsSection })),
);
const VideoShowcaseSection = lazy(() =>
  import("@/components/site/VideoShowcaseSection").then((m) => ({
    default: m.VideoShowcaseSection,
  })),
);
const FaqSection = lazy(() =>
  import("@/components/site/FaqSection").then((m) => ({ default: m.FaqSection })),
);

import { siteConfig, siteUrl, defaultOgImage } from "@/lib/siteConfig";

const title = "LÉÏA Cosmetics — Luxury Online Beauty Store";
const description =
  "Shop 100% authentic luxury Pakistani cosmetics, foundations, serums, and lip shades from LEIA. Free express delivery and Cash on Delivery (COD) nationwide.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: siteUrl },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: siteConfig.siteName },
      { property: "og:image", content: defaultOgImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: siteConfig.social.twitter },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: defaultOgImage },
      {
        name: "keywords",
        content:
          "Pakistani cosmetics, luxury cosmetics Pakistan, online makeup Pakistan, ladies cosmetics, beauty products Pakistan, skincare",
      },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: heroKylie,
        type: "image/webp",
      },
      { rel: "canonical", href: siteUrl },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen bg-[#FFF5F8]">
      {/* Announcement Bar — above navbar */}
      <AnnouncementBar />
      {/* Navbar */}
      <Navbar />

      {/* Main Content Wrapper — Scrolls over the fixed footer */}
      <main className="relative z-10 bg-[#FFF5F8]">
        {/* 1. Hero — main banner */}
        <Hero />
        {/* 2. Brands marquee ticker */}
        <PressMarquee />
        {/* 3. New Arrivals horizontal scroll */}
        <NewArrivalsSection />
        {/* 5. Shop by category — Lips, Eyes, Face, Skincare */}
        <CategoryGrid />
        {/* 8. Customer reviews */}
        <Suspense fallback={<div className="min-h-[440px] w-full" aria-hidden="true" />}>
          <ReviewsSection />
        </Suspense>
        {/* 9. Interactive Video Reels Showcase */}
        <Suspense fallback={<div className="min-h-[480px] w-full" aria-hidden="true" />}>
          <VideoShowcaseSection />
        </Suspense>
        {/* 10. FAQ */}
        <Suspense fallback={<div className="min-h-[380px] w-full" aria-hidden="true" />}>
          <FaqSection />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
