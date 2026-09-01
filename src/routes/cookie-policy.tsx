import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
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
  }),
  component: () => <LegalPage slug="cookie-policy" />,
});
