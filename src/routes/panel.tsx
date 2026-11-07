import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, LayoutDashboard, Percent, QrCode, Store, Users, DollarSign, Star } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { RequireAuth } from "@/components/jama/RequireAuth";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

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

const tabs = [
  { k: "dash", l: "Dashboard", i: LayoutDashboard },
  { k: "scan", l: "Escanear QR", i: QrCode },
  { k: "perfil", l: "Mi Perfil", i: Store },
  { k: "desc", l: "Descuentos", i: Percent },
] as const;
type Tab = (typeof tabs)[number]["k"];
const field = "w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50";
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <div className={`rounded-2xl border border-border bg-card p-5 shadow-card ${className}`}>{children}</div>;

function Panel() {
  const [tab, setTab] = useState<Tab>("dash");
  
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
        <div className="mb-2 hidden md:block"><p className="text-xs text-muted-foreground">Panel de Administrador</p><p className="font-bold">Jama Partner</p></div>
        {tabs.map(({ k, l, i: Icon }) => (
          <button key={k} onClick={() => setTab(k)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === k ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}><Icon className="h-4 w-4" />{l}</button>
        ))}
      </aside>
      <section className="min-w-0">{tab === "dash" ? <Dash /> : tab === "scan" ? <Scan /> : tab === "perfil" ? <Perfil /> : <Descuentos />}</section>
    </div>
  );
}

function Dash() {
  const [statsData, setStatsData] = useState({ canjeados: 0, total: 0 });

  useEffect(() => {
    async function loadStats() {
      const { count: canjeados } = await supabase.from('cupones').select('*', { count: 'exact', head: true }).eq('estado', 'usado');
      const { count: total } = await supabase.from('cupones').select('*', { count: 'exact', head: true });
      setStatsData({ canjeados: canjeados || 0, total: total || 0 });
    }
    loadStats();
  }, []);

  const stats = [
    { l: "Workers registrados", v: "-", i: Users },
    { l: "QR canjeados", v: statsData.canjeados.toString(), i: QrCode },
    { l: "QR generados totales", v: statsData.total.toString(), i: DollarSign },
    { l: "Rating promedio", v: "-", i: Star },
  ];
  const data = [{ s: "Sem 1", v: 42 }, { s: "Sem 2", v: 58 }, { s: "Sem 3", v: 51 }, { s: "Sem 4", v: 77 }];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => <Card key={s.l}><s.i className="h-5 w-5 text-primary" /><div className="mt-3 text-2xl font-bold">{s.v}</div><div className="text-xs text-muted-foreground">{s.l}</div></Card>)}
      </div>
      <Card>
        <h2 className="mb-4 font-semibold">Visitas por semana (Mock)</h2>
        <div className="h-56"><ResponsiveContainer><BarChart data={data}><XAxis dataKey="s" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} /><Bar dataKey="v" fill="var(--primary)" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </Card>
    </div>
  );
}

function Scan() {
  const [code, setCode] = useState("");
  const [valid, setValid] = useState<any | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const check = async (c: string) => {
    setLoading(true);
    const { data, error } = await supabase.from('cupones').select('*, lugares(nombre)').eq('codigo', c.toUpperCase()).single();
    setLoading(false);
    
    if (error || !data) {
      toast.error("Código no encontrado");
      return;
    }

    if (data.estado === "usado") {
      toast.error("El cupón ya fue utilizado anteriormente");
    } else if (data.estado === "vencido") {
      toast.error("El cupón se encuentra vencido");
    } else {
      setValid(data);
      toast.success("QR válido · " + data.descuento_aplicable);
    }
  };

  const registerConsumption = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const monto = Number(formData.get("monto"));
    if (isNaN(monto) || monto <= 0) {
      toast.error("Ingresá un monto de compra válido");
      setLoading(false);
      return;
    }

    const { error } = await supabase.rpc('canjear_cupon', {
      p_codigo: valid.codigo,
      p_monto: monto,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Error al canjear el cupón");
    } else {
      toast.success("Cupón canjeado y consumo registrado correctamente");
      setValid(null);
      setCode("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Escanear QR</h1>
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
        🔒 <strong>Permisos requeridos:</strong> El canje de cupones y registro de tickets en caja requiere una sesión activa con rol de <strong>Administrador</strong>.
      </div>
      <button disabled={loading} onClick={() => { setScanning(true); setTimeout(() => { setScanning(false); toast.info("Simulación: Escribí el código manualmente abajo."); }, 1500); }}
        className="flex w-full flex-col items-center gap-3 rounded-3xl bg-primary py-12 font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
        <Camera className={`h-10 w-10 ${scanning ? "animate-pulse" : ""}`} />{scanning ? "Abriendo cámara..." : "Escanear QR"}
      </button>
      <Card>
        <h2 className="mb-3 font-semibold">Ingresar código manualmente</h2>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); check(code); }}>
          <input disabled={loading} value={code} onChange={(e) => setCode(e.target.value)} placeholder="JAMA-XXXXXX" className={`${field} font-mono uppercase`} />
          <button disabled={loading} className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Validar</button>
        </form>
      </Card>
      {valid && (
        <Card className="border-success/40">
          <h2 className="font-semibold">Cupón Válido: {valid.descuento_aplicable}</h2>
          <p className="text-sm text-muted-foreground mb-3">Lugar: {valid.lugares?.nombre}</p>
          <form className="mt-3 flex gap-2" onSubmit={registerConsumption}>
            <input name="monto" type="number" required min={1} step="0.01" placeholder="Monto total ticket (ARS)" className={field} disabled={loading} />
            <button disabled={loading} className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Marcar usado</button>
          </form>
        </Card>
      )}
    </div>
  );
}

function Perfil() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>
      <Card className="text-center py-10 text-muted-foreground">
        <p>En desarrollo (V2)</p>
        <p className="text-sm mt-2">La carga y gestión de lugares por los comercios se implementará en la próxima versión.</p>
      </Card>
    </div>
  );
}

function Descuentos() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Descuentos</h1>
      <Card className="text-center py-10 text-muted-foreground">
        <p>En desarrollo (V2)</p>
        <p className="text-sm mt-2">La creación y gestión de promociones por los comercios se implementará en la próxima versión.</p>
      </Card>
    </div>
  );
}
