import { createFileRoute } from "@tanstack/react-router";
import { AdminLugares } from "@/components/admin/AdminLugares";

export const Route = createFileRoute("/admin/lugares")({
  head: () => ({
    meta: [
      { title: "Lugares — Jama Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLugares,
});
