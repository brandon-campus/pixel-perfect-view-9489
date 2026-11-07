import { createFileRoute } from "@tanstack/react-router";
import { AdminUsuarios } from "@/components/admin/AdminUsuarios";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuarios — Jama Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUsuarios,
});
