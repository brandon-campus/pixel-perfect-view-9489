import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AdminLayout, type AdminSection } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de Administración — Jama" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRootLayout,
});

function AdminRootLayout() {
  const location = useLocation();
  const path = location.pathname;

  let activeSection: AdminSection = "resumen";
  if (path.includes("/cupones")) activeSection = "cupones";
  else if (path.includes("/lugares")) activeSection = "lugares";
  else if (path.includes("/comisiones")) activeSection = "comisiones";
  else if (path.includes("/usuarios")) activeSection = "usuarios";

  return (
    <AdminLayout activeSection={activeSection}>
      <Outlet />
    </AdminLayout>
  );
}
