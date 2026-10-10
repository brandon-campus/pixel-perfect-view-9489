import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/jama/Nav";
import { barrios } from "@/data/cafes";
import { useAuth } from "@/lib/auth";

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

const input = "w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-primary";

function AuthPage() {
  const { user, login, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"login" | "registro">("login");
  const done = (name: string, email: string, barrio?: string) => { login({ name, email, barrio }); toast.success(`¡Bienvenido/a, ${name.split(" ")[0]}!`); nav({ to: "/buscar" }); };

  if (user)
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">{user.name[0]}</div>
        <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
        <p className="text-sm text-muted-foreground">{user.email}{user.barrio && ` · ${user.barrio}`}</p>
        <button onClick={logout} className="mt-8 w-full rounded-xl border border-border py-3 font-medium">Cerrar sesión</button>
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
        <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); const email = String(d.get("email")); done(email.split("@")[0], email); }}>
          <input name="email" type="email" required placeholder="Email" className={input} />
          <input name="password" type="password" required placeholder="Contraseña" className={input} />
          <button className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">Ingresar</button>
          <button type="button" onClick={() => done("Worker Google", "worker@gmail.com")} className="w-full rounded-xl border border-border bg-card py-3 font-medium">Iniciar sesión con Google</button>
        </form>
      ) : (
        <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); done(String(d.get("name")), String(d.get("email")), String(d.get("barrio"))); }}>
          <input name="name" required placeholder="Nombre" className={input} />
          <input name="email" type="email" required placeholder="Email" className={input} />
          <input name="password" type="password" required minLength={6} placeholder="Contraseña" className={input} />
          <select name="barrio" className={input} defaultValue="Palermo">{barrios.map((b) => <option key={b}>{b}</option>)}</select>
          <button className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">Crear cuenta</button>
        </form>
      )}
    </div>
  );
}
