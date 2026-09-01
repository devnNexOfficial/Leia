import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
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
  }),
  component: () => <LegalPage slug="privacy-policy" />,
});
