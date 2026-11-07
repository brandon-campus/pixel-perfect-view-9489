import { type ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  QrCode, 
  Store, 
  DollarSign, 
  Users, 
  ArrowLeft, 
  Menu, 
  X, 
  ShieldCheck,
  Coffee
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export type AdminSection = "resumen" | "cupones" | "lugares" | "comisiones" | "usuarios";

interface Props {
  children: ReactNode;
  activeSection: AdminSection;
}

const navItems = [
  { key: "resumen" as AdminSection, label: "Resumen", to: "/admin", icon: LayoutDashboard },
  { key: "cupones" as AdminSection, label: "Cupones", to: "/admin/cupones", icon: QrCode },
  { key: "lugares" as AdminSection, label: "Lugares", to: "/admin/lugares", icon: Store },
  { key: "comisiones" as AdminSection, label: "Comisiones", to: "/admin/comisiones", icon: DollarSign },
  { key: "usuarios" as AdminSection, label: "Usuarios", to: "/admin/usuarios", icon: Users },
];

export function AdminLayout({ children, activeSection }: Props) {
  const { user, isAdmin, ready } = useAuth();
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (ready) {
      if (!user || !isAdmin) {
        toast.error("Acceso restringido: requiere sesión de administrador.");
        nav({ to: "/" });
      }
    }
  }, [user, isAdmin, ready, nav]);

  if (!ready || !user || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Verificando credenciales de administrador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#2B1F1A] dark:bg-[#1a1412] dark:text-[#f3ede8]">
      {/* Barra superior de administración */}
      <header className="sticky top-0 z-30 border-b border-[#ebdcd3] bg-[#FBF8F4]/90 backdrop-blur-md dark:border-[#3a2c27] dark:bg-[#1a1412]/90">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#ebdcd3] text-[#2B1F1A] md:hidden dark:border-[#3a2c27] dark:text-[#f3ede8]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#3F6551] text-white shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#3F6551] dark:text-[#7ba98f]">
                  Jama Admin
                </span>
                <h1 className="text-sm font-semibold text-[#2B1F1A] dark:text-[#f3ede8] leading-none">
                  Panel de Operaciones
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl border border-[#ebdcd3] bg-white/60 px-3 py-1.5 text-xs font-medium text-[#2B1F1A] transition hover:bg-white dark:border-[#3a2c27] dark:bg-[#251d19] dark:text-[#f3ede8]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a la App</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar en escritorio */}
        <aside className="hidden w-64 shrink-0 border-r border-[#ebdcd3] p-5 md:block dark:border-[#3a2c27] min-h-[calc(100vh-3.5rem)]">
          <div className="mb-6 rounded-2xl bg-[#efe4dc] p-3.5 dark:bg-[#281f1b]">
            <p className="text-[11px] font-medium text-[#7a6459] dark:text-[#a8958c]">Administrador activo</p>
            <p className="font-semibold text-sm truncate text-[#2B1F1A] dark:text-[#f3ede8]">{user.name}</p>
            <p className="text-xs truncate text-[#7a6459] dark:text-[#a8958c]">{user.email}</p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#3F6551] text-white shadow-sm font-semibold"
                      : "text-[#614e45] hover:bg-[#ebdcd3]/60 hover:text-[#2B1F1A] dark:text-[#c4b5ad] dark:hover:bg-[#2e231f] dark:hover:text-[#f3ede8]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-2xl border border-dashed border-[#ebdcd3] p-3.5 text-xs text-[#7a6459] dark:border-[#3a2c27] dark:text-[#a8958c]">
            <p className="font-semibold text-[#2B1F1A] dark:text-[#f3ede8] mb-1">Entorno Seguro</p>
            <p>Acceso verificado vía Supabase RLS y función <code>es_admin()</code>.</p>
          </div>
        </aside>

        {/* Menú móvil desplegable */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-14 z-20 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 border-r border-[#ebdcd3] bg-[#FBF8F4] p-5 shadow-xl dark:border-[#3a2c27] dark:bg-[#1a1412] h-full" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 rounded-xl bg-[#efe4dc] p-3 text-xs dark:bg-[#281f1b]">
                <p className="font-semibold text-[#2B1F1A] dark:text-[#f3ede8]">{user.name}</p>
                <p className="text-[#7a6459] dark:text-[#a8958c] truncate">{user.email}</p>
              </div>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;
                  return (
                    <Link
                      key={item.key}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                        isActive
                          ? "bg-[#3F6551] text-white font-semibold"
                          : "text-[#614e45] hover:bg-[#ebdcd3]/60 dark:text-[#c4b5ad]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Área principal de contenido */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
