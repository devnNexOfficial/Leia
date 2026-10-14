import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { siteUrl } from "@/lib/siteConfig";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — LEIA Pakistan" },
      {
        name: "description",
        content:
          "Learn how LEIA protects and handles your personal data, privacy, and order information.",
      },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/privacy-policy` }],
  }),
  component: () => <LegalPage slug="privacy-policy" />,
});
