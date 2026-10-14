import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { siteUrl } from "@/lib/siteConfig";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service — LEIA Pakistan" },
      {
        name: "description",
        content: "Read the terms and conditions for shopping, ordering, and browsing on LEIA.",
      },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/terms-of-service` }],
  }),
  component: () => <LegalPage slug="terms-of-service" />,
});
