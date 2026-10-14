import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { siteUrl } from "@/lib/siteConfig";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — LEIA Pakistan" },
      {
        name: "description",
        content:
          "Read about how LEIA uses cookies to improve your shopping experience and store preferences.",
      },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/cookie-policy` }],
  }),
  component: () => <LegalPage slug="cookie-policy" />,
});
