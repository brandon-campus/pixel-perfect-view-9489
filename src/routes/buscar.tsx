import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cafes, barrios, type Noise, type Price } from "@/data/cafes";
import { CafeCard } from "@/components/jama/CafeCard";

export const Route = createFileRoute("/buscar")({
  head: () => ({
    meta: [
      { title: "Buscar cafeterías para trabajar — Jama" },
      { name: "description", content: "Filtrá cafeterías de CABA por barrio, WiFi, ruido, enchufes y precio." },
      { property: "og:title", content: "Buscar cafeterías — Jama" },
      { property: "og:description", content: "Filtros por WiFi, ruido, enchufes y precio en Buenos Aires." },
    ],
  }),
  component: Buscar,
});

type Speed = "basico" | "rapido" | "ultra";
const empty = { barrio: "", noise: [] as Noise[], speed: [] as Speed[], plugs: false, price: [] as Price[], open: false };

function toggle<T>(arr: T[], v: T) { return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]; }

function ChipBtn({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-secondary-foreground hover:border-primary/50"}`}>{children}</button>;
}
function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between text-sm">
      {label}
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-secondary"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Buscar() {
  const [f, setF] = useState(empty);
  const [open, setOpen] = useState(false);
  const results = useMemo(() => cafes.filter((c) => {
    if (f.barrio && c.barrio !== f.barrio) return false;
    if (f.noise.length && !f.noise.includes(c.noise)) return false;
    if (f.price.length && !f.price.includes(c.price)) return false;
    if (f.plugs && c.plugs === 0) return false;
    if (f.open && !c.openNow) return false;
    if (f.speed.length) {
      const s: Speed = c.wifi < 10 ? "basico" : c.wifi <= 50 ? "rapido" : "ultra";
      if (!f.speed.includes(s)) return false;
    }
    return true;
  }), [f]);

  const filters = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-semibold">Barrio</h4>
        <select value={f.barrio} onChange={(e) => setF({ ...f, barrio: e.target.value })} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm outline-none focus:border-primary">
          <option value="">Todos los barrios</option>
          {barrios.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold">Nivel de ruido</h4>
        <div className="flex flex-wrap gap-2">{(["Silencioso", "Moderado", "Animado"] as Noise[]).map((n) => <ChipBtn key={n} on={f.noise.includes(n)} onClick={() => setF({ ...f, noise: toggle(f.noise, n) })}>{n}</ChipBtn>)}</div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold">Velocidad de WiFi</h4>
        <div className="flex flex-wrap gap-2">
          {([["basico", "Básico <10"], ["rapido", "Rápido 10-50"], ["ultra", "Ultra >50"]] as [Speed, string][]).map(([k, l]) => <ChipBtn key={k} on={f.speed.includes(k)} onClick={() => setF({ ...f, speed: toggle(f.speed, k) })}>{l} Mbps</ChipBtn>)}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold">Precio</h4>
        <div className="flex gap-2">{(["$", "$$", "$$$"] as Price[]).map((p) => <ChipBtn key={p} on={f.price.includes(p)} onClick={() => setF({ ...f, price: toggle(f.price, p) })}>{p}</ChipBtn>)}</div>
      </div>
      <Toggle label="Con enchufes" on={f.plugs} onClick={() => setF({ ...f, plugs: !f.plugs })} />
      <Toggle label="Abierto ahora" on={f.open} onClick={() => setF({ ...f, open: !f.open })} />
      <button onClick={() => setF(empty)} className="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">Limpiar filtros</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explorar cafeterías</h1>
          <p className="text-sm text-muted-foreground">{results.length} resultados en CABA</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm md:hidden"><SlidersHorizontal className="h-4 w-4" />Filtros</button>
      </div>
      <div className="mt-6 grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-2xl border border-border bg-card p-5 md:sticky md:top-24 md:block">{filters}</aside>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => <CafeCard key={c.id} cafe={c} />)}
          {!results.length && <p className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No hay cafeterías con esos filtros. Probá limpiarlos.</p>}
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 animate-page" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">Filtros</h3><button onClick={() => setOpen(false)} aria-label="Cerrar"><X className="h-5 w-5" /></button></div>
            {filters}
            <button onClick={() => setOpen(false)} className="mt-4 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">Ver {results.length} resultados</button>
          </div>
        </div>
      )}
    </div>
  );
}
