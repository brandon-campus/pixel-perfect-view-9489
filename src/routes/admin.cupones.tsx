import { createFileRoute } from "@tanstack/react-router";
import { AdminCupones } from "@/components/admin/AdminCupones";

export const Route = createFileRoute("/admin/cupones")({
  head: () => ({
    meta: [
      { title: "Cupones — Jama Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCupones,
});
