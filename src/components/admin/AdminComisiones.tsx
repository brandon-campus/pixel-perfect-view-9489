import { useEffect, useState, useMemo } from "react";
import { 
  DollarSign, 
  Download, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Store 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type VCupon = Database["public"]["Views"]["v_cupones_admin"]["Row"];

interface LiquidacionLugar {
  lugar_id: string;
  lugar_nombre: string;
  barrio: string;
  comision_pct: number;
  cupones_usados: number;
  monto_total: number;
  comision_total: number;
  cupones_sin_monto: number;
}

export function AdminComisiones() {
  const [cupones, setCupones] = useState<VCupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Generador de los últimos 12 meses
  const monthsList = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;
      const label = d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      list.push({ key, label: capitalizedLabel });
      d.setMonth(d.getMonth() - 1);
    }
    return list;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(monthsList[0]?.key || "2026-10");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("v_cupones_admin")
          .select("*")
          .eq("estado_efectivo", "usado");

        if (error) throw error;
        if (data) setCupones(data);
      } catch (err: any) {
        toast.error(err.message || "Error cargando cupones para comisiones");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cupones canjeados en el mes seleccionado
  const cuponesMes = useMemo(() => {
    return cupones.filter((c) => {
      if (!c.fecha_uso) return false;
      return c.fecha_uso.startsWith(selectedMonth);
    });
  }, [cupones, selectedMonth]);

  // Agrupación por lugar
  const liquidacionPorLugar = useMemo(() => {
    const map: Record<string, LiquidacionLugar> = {};

    cuponesMes.forEach((c) => {
      const id = c.lugar_id || "sin_lugar";
      if (!map[id]) {
        map[id] = {
          lugar_id: id,
          lugar_nombre: c.lugar_nombre || "Cafetería sin nombre",
          barrio: c.barrio || "CABA",
          comision_pct: c.comision_pct ?? 0,
          cupones_usados: 0,
          monto_total: 0,
          comision_total: 0,
          cupones_sin_monto: 0,
        };
      }

      map[id].cupones_usados += 1;
      const monto = c.monto_compra || 0;
      map[id].monto_total += monto;
      map[id].comision_total += c.comision || 0;

      if (!c.monto_compra || c.monto_compra <= 0) {
        map[id].cupones_sin_monto += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.comision_total - a.comision_total);
  }, [cuponesMes]);

  // Totales generales
  const totales = useMemo(() => {
    return liquidacionPorLugar.reduce(
      (acc, item) => {
        acc.cupones += item.cupones_usados;
        acc.monto += item.monto_total;
        acc.comision += item.comision_total;
        acc.sinMonto += item.cupones_sin_monto;
        return acc;
      },
      { cupones: 0, monto: 0, comision: 0, sinMonto: 0 }
    );
  }, [liquidacionPorLugar]);

  // Exportar a CSV
  const exportarCSV = () => {
    if (liquidacionPorLugar.length === 0) {
      toast.info("No hay liquidaciones para exportar en este mes");
      return;
    }

    const headers = [
      "Lugar",
      "Barrio",
      "Cupones Canjeados",
      "Facturación Total (ARS)",
      "Comisión Pactada (%)",
      "Comisión a Cobrar (ARS)",
      "Cupones sin Monto",
    ];

    const rows = liquidacionPorLugar.map((item) => [
      `"${item.lugar_nombre}"`,
      `"${item.barrio}"`,
      item.cupones_usados,
      item.monto_total.toFixed(2),
      item.comision_pct,
      item.comision_total.toFixed(2),
      item.cupones_sin_monto,
    ]);

    // Fila total al pie
    rows.push([
      `"TOTAL GENERAL"`,
      `"CABA"`,
      totales.cupones,
      totales.monto.toFixed(2),
      `"—"`,
      totales.comision.toFixed(2),
      totales.sinMonto,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `liquidacion_comisiones_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Liquidación exportada exitosamente en CSV");
  };

  const selectedMonthLabel = monthsList.find((m) => m.key === selectedMonth)?.label || selectedMonth;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2B1F1A] dark:text-[#f3ede8]">
            Liquidación de Comisiones
          </h2>
          <p className="text-sm text-[#7a6459] dark:text-[#a8958c]">
            Cálculo mensual de comisión por cafetería basado en tickets canjeados y porcentajes pactados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Mes */}
          <div className="flex items-center gap-2 rounded-xl border border-[#ebdcd3] bg-white px-3 py-1.5 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
            <Calendar className="h-4 w-4 text-[#7a6459]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#2B1F1A] outline-none dark:text-[#f3ede8]"
            >
              {monthsList.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={exportarCSV}
            className="flex items-center gap-1.5 rounded-xl bg-[#3F6551] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#335342]"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen del Mes */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-4 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <span className="text-xs text-[#7a6459] dark:text-[#a8958c]">Cupones Canjeados en {selectedMonthLabel}</span>
          <p className="mt-2 text-2xl font-extrabold text-[#2B1F1A] dark:text-[#f3ede8]">{totales.cupones}</p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">en {liquidacionPorLugar.length} cafeterías</span>
        </div>

        <div className="rounded-2xl border border-[#ebdcd3] bg-white p-4 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
          <span className="text-xs text-[#7a6459] dark:text-[#a8958c]">Facturación Total Declarada</span>
          <p className="mt-2 text-2xl font-extrabold text-[#2B1F1A] dark:text-[#f3ede8]">
            ${totales.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">tickets registrados</span>
        </div>

        <div className="rounded-2xl border border-[#ebdcd3] bg-gradient-to-br from-[#3F6551]/15 to-[#3F6551]/5 p-4 shadow-sm dark:border-[#3a2c27] dark:from-[#3F6551]/25">
          <span className="text-xs font-semibold text-[#3F6551] dark:text-[#7ba98f]">Comisión Total a Cobrar</span>
          <p className="mt-2 text-2xl font-black text-[#3F6551] dark:text-[#7ba98f]">
            ${totales.comision.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">ingresos brutos Jama</span>
        </div>
      </div>

      {/* Advertencia si hay cupones sin monto */}
      {totales.sinMonto > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>Atención:</strong> Se detectaron <strong>{totales.sinMonto}</strong> cupones canjeados sin monto de compra registrado. La comisión sobre ellos figura en $0.00.
          </span>
        </div>
      )}

      {/* Tabla de Liquidación */}
      <div className="overflow-hidden rounded-2xl border border-[#ebdcd3] bg-white shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#ebdcd3] bg-[#FBF8F4] text-[#7a6459] dark:border-[#3a2c27] dark:bg-[#1e1714] dark:text-[#a8958c]">
              <tr>
                <th className="px-4 py-3 font-semibold">Cafetería</th>
                <th className="px-4 py-3 font-semibold">Barrio</th>
                <th className="px-4 py-3 font-semibold text-center">Cupones Usados</th>
                <th className="px-4 py-3 font-semibold">Facturación Total</th>
                <th className="px-4 py-3 font-semibold text-center">Comisión %</th>
                <th className="px-4 py-3 font-semibold text-right">Comisión a Cobrar</th>
                <th className="px-4 py-3 font-semibold text-center">Alertas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdcd3] dark:divide-[#3a2c27]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7a6459] dark:text-[#a8958c]">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#3F6551] border-t-transparent" />
                    <p className="mt-2">Calculando liquidaciones del período...</p>
                  </td>
                </tr>
              ) : liquidacionPorLugar.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7a6459] dark:text-[#a8958c]">
                    No se registraron cupones canjeados en {selectedMonthLabel}.
                  </td>
                </tr>
              ) : (
                liquidacionPorLugar.map((item) => (
                  <tr key={item.lugar_id} className="hover:bg-[#FBF8F4]/60 dark:hover:bg-[#1f1815] transition">
                    <td className="px-4 py-3 font-bold text-[#2B1F1A] dark:text-[#f3ede8]">
                      {item.lugar_nombre}
                    </td>
                    <td className="px-4 py-3 text-[#7a6459] dark:text-[#a8958c]">
                      {item.barrio}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {item.cupones_usados}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ${item.monto_total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[#2B1F1A] dark:text-[#f3ede8]">
                      {item.comision_pct}%
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#3F6551] dark:text-[#7ba98f]">
                      ${item.comision_total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.cupones_sin_monto > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          {item.cupones_sin_monto} sin monto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#3F6551] dark:text-[#7ba98f]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {liquidacionPorLugar.length > 0 && (
              <tfoot className="border-t-2 border-[#ebdcd3] bg-[#FBF8F4] font-bold text-[#2B1F1A] dark:border-[#3a2c27] dark:bg-[#1e1714] dark:text-[#f3ede8]">
                <tr>
                  <td className="px-4 py-3">TOTALES</td>
                  <td className="px-4 py-3 text-[#7a6459] dark:text-[#a8958c]">CABA</td>
                  <td className="px-4 py-3 text-center">{totales.cupones}</td>
                  <td className="px-4 py-3">
                    ${totales.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">—</td>
                  <td className="px-4 py-3 text-right text-base text-[#3F6551] dark:text-[#7ba98f]">
                    ${totales.comision.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-[#7a6459] dark:text-[#a8958c]">
                    {totales.sinMonto > 0 ? `${totales.sinMonto} pendientes` : "Todo OK"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
