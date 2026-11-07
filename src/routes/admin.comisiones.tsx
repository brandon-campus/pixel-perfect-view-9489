import { createFileRoute } from "@tanstack/react-router";
import { AdminComisiones } from "@/components/admin/AdminComisiones";

export const Route = createFileRoute("/admin/comisiones")({
  head: () => ({
    meta: [
      { title: "Comisiones — Jama Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminComisiones,
});
