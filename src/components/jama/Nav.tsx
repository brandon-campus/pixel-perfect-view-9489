import { Link } from "@tanstack/react-router";
import { Coffee, Home, MessageCircle, QrCode, Search, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
        <Coffee className="h-4 w-4" />
      </span>
      Jama
    </Link>
  );
}

export function TopNav() {
  const { user } = useAuth();
  const cls = "text-sm text-muted-foreground transition-colors hover:text-foreground";
  const active = { className: "text-foreground font-semibold" };
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/buscar" className={cls} activeProps={active}>Buscar</Link>
          <Link to="/chat" className={cls} activeProps={active}>Chat IA</Link>
          <Link to="/mi-qr" className={cls} activeProps={active}>Mi QR</Link>
          <Link to="/panel" className={cls} activeProps={active}>Panel</Link>
          <Link to="/auth" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            {user ? user.name.split(" ")[0] : "Ingresar"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function BottomNav() {
  const items = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/buscar", icon: Search, label: "Buscar" },
    { to: "/chat", icon: MessageCircle, label: "Chat" },
    { to: "/mi-qr", icon: QrCode, label: "QR" },
    { to: "/auth", icon: User, label: "Perfil" },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground"
            activeProps={{ className: "text-primary" }}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border pb-24 pt-10 md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted-foreground">Cafeterías work-friendly en Buenos Aires.</p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/buscar" className="hover:text-foreground">Buscar</Link>
          <Link to="/chat" className="hover:text-foreground">Chat IA</Link>
          <Link to="/panel" className="hover:text-foreground">Para cafeterías</Link>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Jama · CABA</p>
      </div>
    </footer>
  );
}
