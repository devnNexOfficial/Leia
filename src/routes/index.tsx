import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { PressMarquee } from "@/components/site/PressMarquee";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { NewArrivalsSection } from "@/components/site/NewArrivalsSection";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { VideoShowcaseSection } from "@/components/site/VideoShowcaseSection";
import { FaqSection } from "@/components/site/FaqSection";
import { Footer } from "@/components/site/Footer";

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
    links: [{ rel: "canonical", href: siteUrl }],
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
        <ReviewsSection />
        {/* 9. Interactive Video Reels Showcase */}
        <VideoShowcaseSection />
        {/* 10. FAQ */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
