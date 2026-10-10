import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user)
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary"><Lock className="h-6 w-6" /></span>
        <h1 className="mt-5 text-2xl font-bold">Necesitás iniciar sesión</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ingresá a tu cuenta de Jama para acceder a esta sección.</p>
        <Link to="/auth" className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">Ir a iniciar sesión</Link>
      </div>
    );
  return <>{children}</>;
}
