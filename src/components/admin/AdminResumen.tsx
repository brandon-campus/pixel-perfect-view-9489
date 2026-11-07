import { useEffect, useState, useMemo } from "react";
import { 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Percent, 
  Users, 
  Store, 
  DollarSign, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type VCupon = Database["public"]["Views"]["v_cupones_admin"]["Row"];

export function AdminResumen() {
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);
  const [cupones, setCupones] = useState<VCupon[]>([]);
  const [usuariosCount, setUsuariosCount] = useState(0);
  const [lugaresActivosCount, setLugaresActivosCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [
          { data: cuponesData },
          { count: uCount },
          { count: lCount },
        ] = await Promise.all([
          supabase.from("v_cupones_admin").select("*"),
          supabase.from("usuarios").select("*", { count: "exact", head: true }),
          supabase.from("lugares").select("*", { count: "exact", head: true }).eq("activo", true),
        ]);

        if (cuponesData) setCupones(cuponesData);
        if (uCount !== null) setUsuariosCount(uCount);
        if (lCount !== null) setLugaresActivosCount(lCount);
      } catch (err) {
        console.error("Error cargando métricas resumen:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cupones filtrados por rango de días
  const cuponesEnRango = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeDays);
    return cupones.filter((c) => {
      const fecha = c.fecha_generacion ? new Date(c.fecha_generacion) : new Date();
      return fecha >= cutoff;
    });
  }, [cupones, rangeDays]);

  // Cálculos de KPIs
  const generados = cuponesEnRango.length;
  const usados = cuponesEnRango.filter((c) => c.estado_efectivo === "usado").length;
  const vencidos = cuponesEnRango.filter((c) => c.estado_efectivo === "vencido").length;
  const tasaCanje = generados > 0 ? ((usados / generados) * 100).toFixed(1) : "0.0";
  const comisionAcumulada = cuponesEnRango
    .filter((c) => c.estado_efectivo === "usado")
    .reduce((acc, c) => acc + (c.comision || 0), 0);

  // Cupones por vencer en las próximas 24 horas
  const porVencer = useMemo(() => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 3600 * 1000);
    return cupones.filter((c) => {
      if (c.estado_efectivo !== "generado" || !c.fecha_vencimiento) return false;
      const vDate = new Date(c.fecha_vencimiento);
      return vDate > now && vDate <= in24h;
    });
  }, [cupones]);

  // Ranking de lugares por cupones usados
  const rankingLugares = useMemo(() => {
    const counts: Record<string, { nombre: string; usados: number }> = {};
    cuponesEnRango
      .filter((c) => c.estado_efectivo === "usado")
      .forEach((c) => {
        const id = c.lugar_id || "desconocido";
        const nombre = c.lugar_nombre || "Cafetería sin nombre";
        if (!counts[id]) counts[id] = { nombre, usados: 0 };
        counts[id].usados += 1;
      });
    return Object.values(counts).sort((a, b) => b.usados - a.usados).slice(0, 5);
  }, [cuponesEnRango]);

  // Datos para el gráfico de líneas (generados vs usados por día)
  const chartData = useMemo(() => {
    const daysMap: Record<string, { fecha: string; generados: number; usados: number }> = {};
    const now = new Date();

    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0] || "";
      const label = d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
      if (key) {
        daysMap[key] = { fecha: label, generados: 0, usados: 0 };
      }
    }

    cuponesEnRango.forEach((c) => {
      if (c.fecha_generacion) {
        const k = c.fecha_generacion.split("T")[0];
        if (k && daysMap[k]) daysMap[k].generados += 1;
      }
      if (c.estado_efectivo === "usado" && c.fecha_uso) {
        const k = c.fecha_uso.split("T")[0];
        if (k && daysMap[k]) daysMap[k].usados += 1;
      }
    });

    return Object.values(daysMap);
  }, [cuponesEnRango, rangeDays]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#3F6551] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado y filtro de rango */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2B1F1A] dark:text-[#f3ede8]">
            Resumen General
          </h2>
          <p className="text-sm text-[#7a6459] dark:text-[#a8958c]">
            Rendimiento comercial y métricas de derivación en CABA.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-[#ebdcd3] bg-white p-1 dark:border-[#3a2c27] dark:bg-[#251d19]">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setRangeDays(days)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                rangeDays === days
                  ? "bg-[#3F6551] text-white shadow-sm"
                  : "text-[#7a6459] hover:text-[#2B1F1A] dark:text-[#a8958c] dark:hover:text-[#f3ede8]"
              }`}
            >
              {days} días
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-4 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <div className="flex items-center justify-between text-xs text-[#7a6459] dark:text-[#a8958c]">
            <span>Generados</span>
            <QrCode className="h-4 w-4 text-[#C97B5A]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#2B1F1A] dark:text-[#f3ede8]">{generados}</p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">últimos {rangeDays}d</span>
        </div>

        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-4 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <div className="flex items-center justify-between text-xs text-[#7a6459] dark:text-[#a8958c]">
            <span>Canjeados</span>
            <CheckCircle2 className="h-4 w-4 text-[#3F6551]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#3F6551] dark:text-[#7ba98f]">{usados}</p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">confirmados en caja</span>
        </div>

        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-4 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <div className="flex items-center justify-between text-xs text-[#7a6459] dark:text-[#a8958c]">
            <span>Vencidos</span>
            <Clock className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#2B1F1A] dark:text-[#f3ede8]">{vencidos}</p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">sin canjear (+24h)</span>
        </div>

        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-4 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <div className="flex items-center justify-between text-xs text-[#7a6459] dark:text-[#a8958c]">
            <span>Tasa Canje</span>
            <Percent className="h-4 w-4 text-[#3F6551]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#2B1F1A] dark:text-[#f3ede8]">{tasaCanje}%</p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">conversión a local</span>
        </div>

        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-4 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <div className="flex items-center justify-between text-xs text-[#7a6459] dark:text-[#a8958c]">
            <span>Usuarios</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#2B1F1A] dark:text-[#f3ede8]">{usuariosCount}</p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">cuentas registradas</span>
        </div>

        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-4 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <div className="flex items-center justify-between text-xs text-[#7a6459] dark:text-[#a8958c]">
            <span>Cafeterías</span>
            <Store className="h-4 w-4 text-[#C97B5A]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#2B1F1A] dark:text-[#f3ede8]">{lugaresActivosCount}</p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">locales activos</span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#ebdcd3] bg-gradient-to-br from-[#3F6551]/10 to-[#3F6551]/5 p-4 shadow-sm dark:border-[#3a2c27] dark:from-[#3F6551]/20">
          <div className="flex items-center justify-between text-xs text-[#3F6551] dark:text-[#7ba98f]">
            <span className="font-semibold">Comisión Total</span>
            <DollarSign className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#3F6551] dark:text-[#7ba98f]">
            ${comisionAcumulada.toLocaleString("es-AR")}
          </p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">a liquidar período</span>
        </div>
      </div>

      {/* Gráfico de evolución temporal */}
      <div className="rounded-2xl border border-[#ebdcd3] bg-white p-5 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#2B1F1A] dark:text-[#f3ede8] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#3F6551]" />
              Evolución de Cupones: Generados vs. Usados
            </h3>
            <p className="text-xs text-[#7a6459] dark:text-[#a8958c]">
              Actividad diaria en el período seleccionado.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-[#C97B5A]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C97B5A]" /> Generados
            </span>
            <span className="flex items-center gap-1.5 text-[#3F6551]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3F6551]" /> Usados
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.every((d) => d.generados === 0 && d.usados === 0) ? (
            <div className="flex h-full items-center justify-center text-sm text-[#7a6459] dark:text-[#a8958c]">
              Sin actividad registrada en este período ({rangeDays} días).
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#2B1F1A", 
                    borderRadius: "0.75rem", 
                    border: "none", 
                    color: "#fff",
                    fontSize: "12px"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="generados" 
                  stroke="#C97B5A" 
                  strokeWidth={2.5} 
                  dot={{ r: 3 }}
                  name="Generados"
                />
                <Line 
                  type="monotone" 
                  dataKey="usados" 
                  stroke="#3F6551" 
                  strokeWidth={2.5} 
                  dot={{ r: 3 }}
                  name="Usados"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Ranking de Lugares & Alerta de Cupones por Vencer */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ranking */}
        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-5 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <h3 className="font-bold text-[#2B1F1A] dark:text-[#f3ede8] flex items-center gap-2 mb-3">
            <Store className="h-4 w-4 text-[#C97B5A]" />
            Ranking de Cafeterías por Cupones Usados
          </h3>
          {rankingLugares.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#7a6459] dark:text-[#a8958c]">
              Aún no hay canjes registrados en este período.
            </p>
          ) : (
            <div className="space-y-3">
              {rankingLugares.map((item, idx) => {
                const max = rankingLugares[0]?.usados || 1;
                const pct = Math.round((item.usados / max) * 100);
                return (
                  <div key={item.nombre} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>#{idx + 1} {item.nombre}</span>
                      <span className="text-[#3F6551] dark:text-[#7ba98f]">{item.usados} canjes</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#ebdcd3]/40 dark:bg-[#3a2c27]">
                      <div 
                        className="h-full rounded-full bg-[#3F6551]" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cupones por vencer */}
        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-5 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <h3 className="font-bold text-[#2B1F1A] dark:text-[#f3ede8] flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Por Vencer (Próximas 24 Horas)
          </h3>
          {porVencer.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#7a6459] dark:text-[#a8958c]">
              No hay cupones activos próximos a vencer en las siguientes 24 horas.
            </p>
          ) : (
            <div className="divide-y divide-[#ebdcd3] dark:divide-[#3a2c27] max-h-56 overflow-y-auto">
              {porVencer.map((c) => {
                const expires = c.fecha_vencimiento ? new Date(c.fecha_vencimiento) : new Date();
                const diffHours = Math.max(0, Math.round((expires.getTime() - Date.now()) / (3600 * 1000)));
                return (
                  <div key={c.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <p className="font-mono font-bold text-[#2B1F1A] dark:text-[#f3ede8]">{c.codigo}</p>
                      <p className="text-[#7a6459] dark:text-[#a8958c]">{c.lugar_nombre}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                        Vence en ~{diffHours}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
