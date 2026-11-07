import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/jama/Nav";
import { barrios } from "@/data/cafes";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Heart, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar o registrarse — Jama" },
      { name: "description", content: "Creá tu cuenta en Jama para generar QRs de descuento en cafeterías." },
      { property: "og:title", content: "Ingresar — Jama" },
      { property: "og:description", content: "Accedé a tu cuenta de Jama." },
    ],
  }),
  component: AuthPage,
});

const input = "w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50";

function AuthPage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"login" | "registro">("login");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const d = new FormData(e.currentTarget);
    const email = String(d.get("email"));
    const password = String(d.get("password"));

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Credenciales incorrectas" : error.message);
    } else {
      toast.success("¡Bienvenido/a de nuevo!");
      nav({ to: "/buscar" });
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const d = new FormData(e.currentTarget);
    const name = String(d.get("name"));
    const email = String(d.get("email"));
    const password = String(d.get("password"));
    const barrio = String(d.get("barrio"));

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Cuenta creada. ¡Bienvenido/a!");
      nav({ to: "/buscar" });
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/buscar`,
      },
    });
    if (error) {
      toast.error(error.message);
    }
  };

  if (user)
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">{user.name[0]?.toUpperCase() || 'U'}</div>
        <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
        <p className="text-sm text-muted-foreground">{user.email}{user.barrio && ` · ${user.barrio}`}</p>
        
        <div className="mt-8 space-y-3">
          <Link to="/favoritos" className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition hover:border-primary/50">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
                <Heart className="h-5 w-5" />
              </div>
              <span className="font-semibold text-foreground">Mis Favoritos</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>

        <button onClick={logout} className="mt-8 w-full rounded-xl border border-border py-3 font-medium transition hover:bg-secondary">Cerrar sesión</button>
      </div>
    );

  return (
    <div className="mx-auto max-w-sm px-4 py-14">
      <div className="flex justify-center"><Logo /></div>
      <div className="mt-8 grid grid-cols-2 rounded-xl bg-secondary p-1">
        {(["login", "registro"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg py-2 text-sm font-semibold transition ${tab === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground"}`}>{t === "login" ? "Iniciar sesión" : "Registrarme"}</button>
        ))}
      </div>
      {tab === "login" ? (
        <form className="mt-6 space-y-3" onSubmit={handleLogin}>
          <input name="email" type="email" required placeholder="Email" className={input} disabled={loading} />
          <input name="password" type="password" required placeholder="Contraseña" className={input} disabled={loading} />
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-70">{loading ? "Cargando..." : "Ingresar"}</button>
          <button type="button" onClick={handleGoogleLogin} className="w-full rounded-xl border border-border bg-card py-3 font-medium hover:bg-secondary transition-colors">Iniciar sesión con Google</button>
        </form>
      ) : (
        <form className="mt-6 space-y-3" onSubmit={handleRegister}>
          <input name="name" required placeholder="Nombre" className={input} disabled={loading} />
          <input name="email" type="email" required placeholder="Email" className={input} disabled={loading} />
          <input name="password" type="password" required minLength={6} placeholder="Contraseña" className={input} disabled={loading} />
          <select name="barrio" className={input} defaultValue="Palermo" disabled={loading}>{barrios.map((b) => <option key={b}>{b}</option>)}</select>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-70">{loading ? "Creando..." : "Crear cuenta"}</button>
        </form>
      )}
    </div>
  );
}
