import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement — LEIA Pakistan" },
      {
        name: "description",
        content:
          "Read LEIA's commitment to digital accessibility and user experience for all shoppers.",
      },
    ],
  }),
  component: () => <LegalPage slug="accessibility" />,
});
