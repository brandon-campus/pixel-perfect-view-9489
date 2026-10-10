import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Camera, LayoutDashboard, Percent, QrCode, Store, Users, DollarSign, Star } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { cafes, ars } from "@/data/cafes";
import { RequireAuth } from "@/components/jama/RequireAuth";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel de cafetería — Jama" },
      { name: "description", content: "Gestioná tu cafetería en Jama: canjeá QRs, editá tu perfil y creá descuentos." },
      { property: "og:title", content: "Panel de cafetería — Jama" },
      { property: "og:description", content: "Herramientas para cafeterías aliadas de Jama." },
    ],
  }),
  component: () => <RequireAuth><Panel /></RequireAuth>,
});

const cafe = cafes[0];
const tabs = [
  { k: "dash", l: "Dashboard", i: LayoutDashboard },
  { k: "scan", l: "Escanear QR", i: QrCode },
  { k: "perfil", l: "Mi Perfil", i: Store },
  { k: "desc", l: "Descuentos", i: Percent },
] as const;
type Tab = (typeof tabs)[number]["k"];
const field = "w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary";
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <div className={`rounded-2xl border border-border bg-card p-5 shadow-card ${className}`}>{children}</div>;

function Panel() {
  const [tab, setTab] = useState<Tab>("dash");
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
        <div className="mb-2 hidden md:block"><p className="text-xs text-muted-foreground">Panel de</p><p className="font-bold">{cafe.name}</p></div>
        {tabs.map(({ k, l, i: Icon }) => (
          <button key={k} onClick={() => setTab(k)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === k ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}><Icon className="h-4 w-4" />{l}</button>
        ))}
      </aside>
      <section className="min-w-0">{tab === "dash" ? <Dash /> : tab === "scan" ? <Scan /> : tab === "perfil" ? <Perfil /> : <Descuentos />}</section>
    </div>
  );
}

function Dash() {
  const stats = [
    { l: "Workers este mes", v: "248", i: Users },
    { l: "QR canjeados", v: "131", i: QrCode },
    { l: "Ingresos por Jama", v: ars(1845000), i: DollarSign },
    { l: "Rating promedio", v: "4.7", i: Star },
  ];
  const data = [{ s: "Sem 1", v: 42 }, { s: "Sem 2", v: 58 }, { s: "Sem 3", v: 51 }, { s: "Sem 4", v: 77 }];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => <Card key={s.l}><s.i className="h-5 w-5 text-primary" /><div className="mt-3 text-2xl font-bold">{s.v}</div><div className="text-xs text-muted-foreground">{s.l}</div></Card>)}
      </div>
      <Card>
        <h2 className="mb-4 font-semibold">Visitas por semana</h2>
        <div className="h-56"><ResponsiveContainer><BarChart data={data}><XAxis dataKey="s" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} /><Bar dataKey="v" fill="var(--primary)" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </Card>
    </div>
  );
}

function Scan() {
  const [code, setCode] = useState("");
  const [valid, setValid] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const check = (c: string) => { if (/^JAMA-[A-Z0-9]{6}$/i.test(c)) { setValid(c.toUpperCase()); toast.success("QR válido · 10% de descuento"); } else toast.error("Código inválido"); };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Escanear QR</h1>
      <button onClick={() => { setScanning(true); setTimeout(() => { setScanning(false); check("JAMA-" + Math.random().toString(36).slice(2, 8)); }, 1500); }}
        className="flex w-full flex-col items-center gap-3 rounded-3xl bg-primary py-12 font-semibold text-primary-foreground shadow-glow">
        <Camera className={`h-10 w-10 ${scanning ? "animate-pulse" : ""}`} />{scanning ? "Abriendo cámara..." : "Escanear QR"}
      </button>
      <Card>
        <h2 className="mb-3 font-semibold">Ingresar código manualmente</h2>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); check(code); }}>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="JAMA-A3F8K2" className={`${field} font-mono uppercase`} />
          <button className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">Validar</button>
        </form>
      </Card>
      {valid && (
        <Card className="border-success/40">
          <h2 className="font-semibold">Registrar consumo · <span className="font-mono text-success">{valid}</span></h2>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); toast.success("Consumo registrado"); setValid(null); setCode(""); }}>
            <input type="number" required min={1} placeholder="Monto en ARS" className={field} />
            <button className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">Registrar</button>
          </form>
        </Card>
      )}
    </div>
  );
}

function Perfil() {
  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); toast.success("Perfil actualizado"); }}>
      <h1 className="text-2xl font-bold">Mi Perfil</h1>
      <Card className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">Nombre<input defaultValue={cafe.name} className={field} /></label>
        <label className="space-y-1 text-sm">Dirección<input defaultValue={cafe.address} className={field} /></label>
        <label className="space-y-1 text-sm">WiFi (Mbps)<input type="number" defaultValue={cafe.wifi} className={field} /></label>
        <label className="space-y-1 text-sm">Nivel de ruido<select defaultValue={cafe.noise} className={field}><option>Silencioso</option><option>Moderado</option><option>Animado</option></select></label>
        <label className="space-y-1 text-sm">Enchufes<input type="number" defaultValue={cafe.plugs} className={field} /></label>
        <label className="space-y-1 text-sm">Horarios L-V<input defaultValue={cafe.hours[0].time} className={field} /></label>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Fotos</h2>
        <div className="grid grid-cols-4 gap-2">{cafe.photos.map((p) => <img key={p} src={p} alt="" className="aspect-square rounded-xl object-cover" />)}</div>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Menú</h2>
        <div className="space-y-2">{cafe.menu.map((m) => <div key={m.item} className="grid grid-cols-[1fr_120px] gap-2"><input defaultValue={m.item} className={field} /><input defaultValue={m.price} type="number" className={field} /></div>)}</div>
      </Card>
      <button className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">Guardar cambios</button>
    </form>
  );
}

function Descuentos() {
  const [list, setList] = useState([
    { p: 10, d: "10% off en toda la carta de lunes a viernes", from: "2026-10-01", to: "2026-12-31" },
    { p: 15, d: "15% off en brunch los sábados", from: "2026-10-05", to: "2026-11-30" },
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Descuentos</h1>
      <div className="space-y-3">
        {list.map((x, k) => (
          <Card key={k} className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-extrabold text-primary-foreground">{x.p}%</span>
            <div className="min-w-0"><p className="font-medium">{x.d}</p><p className="text-xs text-muted-foreground">{x.from} → {x.to}</p></div>
            <span className="ml-auto rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">Activo</span>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 font-semibold">Nuevo descuento</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => {
          e.preventDefault(); const f = new FormData(e.currentTarget);
          setList([...list, { p: Number(f.get("p")), d: String(f.get("d")), from: String(f.get("from")), to: String(f.get("to")) }]);
          e.currentTarget.reset(); toast.success("Descuento creado");
        }}>
          <input name="p" type="number" min={1} max={100} required placeholder="Porcentaje" className={field} />
          <input name="d" required placeholder="Descripción" className={field} />
          <input name="from" type="date" required className={field} />
          <input name="to" type="date" required className={field} />
          <button className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground md:col-span-2">Crear descuento</button>
        </form>
      </Card>
    </div>
  );
}
