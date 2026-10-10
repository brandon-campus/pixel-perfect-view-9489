import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Plug, Star, Tag, Wifi } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { getCafe, ars } from "@/data/cafes";
import { NoiseIcon } from "@/components/jama/CafeCard";

export const Route = createFileRoute("/cafeteria/$id")({
  loader: ({ params }) => {
    const cafe = getCafe(params.id);
    if (!cafe) throw notFound();
    return { cafe };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Cafetería no encontrada — Jama" }, { name: "robots", content: "noindex" }] };
    const c = loaderData.cafe;
    const d = `${c.name} en ${c.barrio}: WiFi ${c.wifi} Mbps, ambiente ${c.noise.toLowerCase()}, ${c.plugs} enchufes.`;
    return {
      meta: [
        { title: `${c.name} — ${c.barrio} | Jama` },
        { name: "description", content: d },
        { property: "og:title", content: `${c.name} — Jama` },
        { property: "og:description", content: d },
        { property: "og:image", content: c.photos[0] },
        { name: "twitter:image", content: c.photos[0] },
      ],
    };
  },
  notFoundComponent: () => <div className="p-10 text-center">Cafetería no encontrada. <Link to="/buscar" className="text-primary">Volver</Link></div>,
  component: Perfil,
});

function Perfil() {
  const { cafe: c } = Route.useLoaderData();
  const [i, setI] = useState(0);
  const n = c.photos.length;
  const metrics = [
    { icon: <Wifi className="h-5 w-5" />, label: "WiFi", value: `${c.wifi} Mbps` },
    { icon: <NoiseIcon noise={c.noise} className="h-5 w-5" />, label: "Ruido", value: c.noise },
    { icon: <Plug className="h-5 w-5" />, label: "Enchufes", value: c.plugs ? `${c.plugs}` : "No" },
    { icon: <Tag className="h-5 w-5" />, label: "Precio", value: c.price },
  ];
  return (
    <div className="mx-auto max-w-4xl pb-24 md:px-4 md:py-6">
      <div className="relative overflow-hidden md:rounded-3xl">
        <img src={c.photos[i]} alt={c.name} className="h-64 w-full object-cover md:h-96" />
        <button onClick={() => setI((i - 1 + n) % n)} aria-label="Anterior" className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/70 backdrop-blur"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => setI((i + 1) % n)} aria-label="Siguiente" className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/70 backdrop-blur"><ChevronRight className="h-5 w-5" /></button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">{c.photos.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-1.5 bg-foreground/60"}`} />)}</div>
      </div>

      <div className="space-y-8 px-4 pt-6 md:px-0">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{c.name}</h1>
            <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"><Star className="h-4 w-4 fill-warning text-warning" />{c.rating}</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" />{c.address}, {c.barrio}</p>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {metrics.map((m) => (
            <div key={m.label} className="min-w-[130px] rounded-2xl border border-border bg-card p-4 shadow-card">
              <span className="text-primary">{m.icon}</span>
              <div className="mt-3 text-lg font-bold">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>

        {c.discount && (
          <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-glow">
            <div className="text-sm font-semibold uppercase tracking-wider opacity-80">Descuento Jama</div>
            <div className="mt-1 text-5xl font-extrabold">{c.discount.percent}% OFF</div>
            <p className="mt-2 opacity-90">{c.discount.description}</p>
            <Link to="/mi-qr" search={{ cafe: c.id }} className="mt-5 inline-flex rounded-xl bg-background px-5 py-3 font-semibold text-foreground">Generar mi QR</Link>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-primary" />Horarios</h2>
            {c.hours.map((h) => <div key={h.day} className="flex justify-between border-b border-border py-2 text-sm last:border-0"><span className="text-muted-foreground">{h.day}</span><span>{h.time}</span></div>)}
          </section>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 font-semibold">Ocupación estimada</h2>
            <div className="h-44">
              <ResponsiveContainer>
                <BarChart data={c.occupancyByTime}>
                  <XAxis dataKey="franja" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Bar dataKey="valor" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold">Menú destacado</h2>
          {c.menu.map((m) => <div key={m.item} className="flex justify-between border-b border-border py-2.5 text-sm last:border-0"><span>{m.item}</span><span className="font-medium">{ars(m.price)}</span></div>)}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border">
          <iframe title="Mapa" className="h-64 w-full" loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${c.address}, ${c.barrio}, Buenos Aires`)}&z=15&output=embed`} />
        </section>

        <section className="rounded-2xl border border-dashed border-border p-6 text-center">
          <h2 className="font-semibold">Reseñas</h2>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </section>
      </div>

      {c.discount && (
        <div className="fixed inset-x-0 bottom-[4.5rem] z-30 px-4 md:hidden">
          <Link to="/mi-qr" search={{ cafe: c.id }} className="block rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground shadow-glow">Obtener descuento · {c.discount.percent}%</Link>
        </div>
      )}
    </div>
  );
}
