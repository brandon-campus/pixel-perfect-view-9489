import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { CafeCard } from "@/components/jama/CafeCard";
import type { Cafe, Noise, Price } from "@/data/cafes";
import { RequireAuth } from "@/components/jama/RequireAuth";
import { useFavorites } from "@/lib/useFavorites";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Mis Favoritos — Jama" },
      { name: "description", content: "Tus cafeterías work-friendly guardadas." },
    ],
  }),
  component: () => <RequireAuth><Favoritos /></RequireAuth>,
});

function Favoritos() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user || favorites.length === 0) {
        setCafes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.from('lugares').select('*').in('id', favorites);
      if (data && !error) {
        const mapped: Cafe[] = data.map(d => ({
          id: d.id,
          name: d.nombre,
          barrio: d.barrio,
          address: d.direccion,
          wifi: (d.wifi_score ?? 5) * 10,
          noise: (d.nivel_ruido || "Moderado") as Noise,
          price: (d.rango_precios || "$$") as Price,
          plugs: d.tiene_enchufes ? 10 : 0,
          rating: 4.5,
          occupancy: "medio",
          openNow: true,
          photos: d.fotos || [],
          hours: JSON.parse(d.horarios || "[]"),
          menu: JSON.parse(d.productos_destacados || "[]"),
          occupancyByTime: [],
        }));
        setCafes(mapped);
      }
      setLoading(false);
    }
    load();
  }, [user, favorites]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Mis Favoritos</h1>
      <p className="mt-2 text-sm text-muted-foreground">Tus cafeterías guardadas para trabajar.</p>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Cargando tus favoritos...</div>
      ) : cafes.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cafes.map((c) => <CafeCard key={c.id} cafe={c} />)}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Aún no guardaste nada</h2>
          <p className="mt-2 text-muted-foreground">Explora cafeterías y guárdalas acá para tenerlas siempre a mano.</p>
          <Link to="/buscar" className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90">
            Explorar cafeterías
          </Link>
        </div>
      )}
    </div>
  );
}
