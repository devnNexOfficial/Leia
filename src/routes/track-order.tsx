import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/track-order")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});

