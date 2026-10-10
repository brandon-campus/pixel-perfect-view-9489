import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, MapPin, QrCode, Search, Sparkles as _s, Wifi } from "lucide-react";
import { cafes } from "@/data/cafes";
import { CafeCard } from "@/components/jama/CafeCard";
import { Footer } from "@/components/jama/Nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jama — Tu espacio de trabajo ideal en Buenos Aires" },
      { name: "description", content: "Cafeterías work-friendly en CABA con WiFi verificado, enchufes, ruido y descuentos exclusivos. Recomendaciones con IA." },
      { property: "og:title", content: "Jama — Tu espacio de trabajo ideal" },
      { property: "og:description", content: "Encontrá cafeterías para trabajar en CABA con IA y descuentos con QR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
void _s;

const steps = [
  { icon: MessageCircle, t: "Contale a Jama qué necesitás", d: "Zona, WiFi, silencio, enchufes. Hablale como a un amigo." },
  { icon: MapPin, t: "Elegí tu cafetería ideal", d: "Datos verificados por la comunidad de workers." },
  { icon: QrCode, t: "Mostrá tu QR y disfrutá", d: "Descuentos exclusivos en cafeterías aliadas." },
];

function Index() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 md:pb-24 md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Wifi className="h-3.5 w-3.5 text-primary" /> WiFi verificado en CABA
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Tu espacio de trabajo ideal, <span className="text-primary">siempre cerca</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Encontrá cafeterías con buen WiFi, enchufes y ambiente tranquilo para trabajar. Recomendaciones personalizadas con IA.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/chat" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
              <MessageCircle className="h-5 w-5" /> Buscar con IA
            </Link>
            <Link to="/buscar" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 font-semibold transition hover:border-primary/50">
              <Search className="h-5 w-5" /> Explorar cafeterías
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-3 gap-3 rounded-3xl border border-border bg-card p-6 text-center shadow-card">
          {[["+50", "cafeterías"], ["+1000", "workers"], ["100%", "WiFi verificado"]].map(([n, l]) => (
            <div key={l}>
              <div className="text-2xl font-extrabold text-primary md:text-4xl">{n}</div>
              <div className="text-xs text-muted-foreground md:text-sm">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <h2 className="text-3xl font-bold tracking-tight">¿Cómo funciona?</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><s.icon className="h-5 w-5" /></span>
                <span className="text-sm font-bold text-muted-foreground">Paso {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Destacadas</h2>
          <Link to="/buscar" className="text-sm font-semibold text-primary">Ver todas →</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cafes.filter((c) => c.discount).slice(0, 3).map((c) => <CafeCard key={c.id} cafe={c} />)}
        </div>
      </section>
      <Footer />
    </>
  );
}
