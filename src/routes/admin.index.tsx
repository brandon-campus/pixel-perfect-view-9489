import { createFileRoute } from "@tanstack/react-router";
import { AdminResumen } from "@/components/admin/AdminResumen";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Resumen — Jama Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminResumen,
});
