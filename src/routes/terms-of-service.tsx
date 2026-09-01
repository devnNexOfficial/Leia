import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service — LEIA Pakistan" },
      {
        name: "description",
        content:
          "Read the terms and conditions for shopping, ordering, and browsing on LEIA.",
      },
    ],
  }),
  component: () => <LegalPage slug="terms-of-service" />,
});
