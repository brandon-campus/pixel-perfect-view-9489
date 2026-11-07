import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Download, 
  QrCode, 
  Filter, 
  CheckCircle2, 
  Clock, 
  X, 
  Store, 
  Bot, 
  Smartphone,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type VCupon = Database["public"]["Views"]["v_cupones_admin"]["Row"];

export function AdminCupones() {
  const [cupones, setCupones] = useState<VCupon[]>([]);
  const [lugares, setLugares] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchCode, setSearchCode] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroLugar, setFiltroLugar] = useState<string>("todos");
  const [filtroOrigen, setFiltroOrigen] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Modal de Canje
  const [canjeModalOpen, setCanjeModalOpen] = useState(false);
  const [codigoParaCanje, setCodigoParaCanje] = useState("");
  const [montoParaCanje, setMontoParaCanje] = useState("");
  const [canjeando, setCanjeando] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: cuponesData, error: cErr }, { data: lugaresData }] = await Promise.all([
        supabase.from("v_cupones_admin").select("*").order("fecha_generacion", { ascending: false }),
        supabase.from("lugares").select("id, nombre").order("nombre"),
      ]);

      if (cErr) throw cErr;
      if (cuponesData) setCupones(cuponesData);
      if (lugaresData) setLugares(lugaresData);
    } catch (err: any) {
      toast.error(err.message || "Error cargando cupones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado de la lista
  const cuponesFiltrados = useMemo(() => {
    return cupones.filter((c) => {
      if (searchCode && !c.codigo?.toLowerCase().includes(searchCode.toLowerCase().trim())) {
        return false;
      }
      if (filtroEstado !== "todos" && c.estado_efectivo !== filtroEstado) {
        return false;
      }
      if (filtroLugar !== "todos" && c.lugar_id !== filtroLugar) {
        return false;
      }
      if (filtroOrigen !== "todos" && c.origen !== filtroOrigen) {
        return false;
      }
      if (fechaDesde && c.fecha_generacion && new Date(c.fecha_generacion) < new Date(fechaDesde)) {
        return false;
      }
      if (fechaHasta && c.fecha_generacion) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        if (new Date(c.fecha_generacion) > hasta) return false;
      }
      return true;
    });
  }, [cupones, searchCode, filtroEstado, filtroLugar, filtroOrigen, fechaDesde, fechaHasta]);

  // Ejecución de Canje con RPC
  const handleCanjear = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = Number(montoParaCanje);
    if (!codigoParaCanje.trim()) {
      toast.error("El código no puede estar vacío");
      return;
    }
    if (isNaN(monto) || monto <= 0) {
      toast.error("Ingresá un monto de compra válido (mayor a 0)");
      return;
    }

    setCanjeando(true);
    try {
      const { data, error } = await supabase.rpc("canjear_cupon", {
        p_codigo: codigoParaCanje.trim().toUpperCase(),
        p_monto: monto,
      });

      if (error) throw error;

      toast.success(`¡Cupón ${codigoParaCanje.toUpperCase()} canjeado con éxito!`);
      setCanjeModalOpen(false);
      setCodigoParaCanje("");
      setMontoParaCanje("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Error al procesar el canje");
    } finally {
      setCanjeando(false);
    }
  };

  // Exportar a CSV
  const exportarCSV = () => {
    if (cuponesFiltrados.length === 0) {
      toast.info("No hay cupones para exportar con los filtros actuales");
      return;
    }

    const headers = [
      "Código",
      "Lugar",
      "Barrio",
      "Usuario Nombre",
      "Usuario Email",
      "Descuento",
      "Estado Efectivo",
      "Monto Compra (ARS)",
      "Comisión Pct",
      "Comisión (ARS)",
      "Origen",
      "Fecha Generación",
      "Fecha Uso",
      "Fecha Vencimiento",
    ];

    const rows = cuponesFiltrados.map((c) => [
      `"${c.codigo || ""}"`,
      `"${c.lugar_nombre || ""}"`,
      `"${c.barrio || ""}"`,
      `"${c.usuario_nombre || ""}"`,
      `"${c.usuario_email || ""}"`,
      `"${c.descuento_aplicable || ""}"`,
      `"${c.estado_efectivo || ""}"`,
      c.monto_compra ?? "",
      c.comision_pct ?? "",
      c.comision ?? "",
      `"${c.origen || "app"}"`,
      `"${c.fecha_generacion || ""}"`,
      `"${c.fecha_uso || ""}"`,
      `"${c.fecha_vencimiento || ""}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cupones_jama_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Archivo CSV generado y descargado");
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y acciones principales */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2B1F1A] dark:text-[#f3ede8]">
            Gestión de Cupones
          </h2>
          <p className="text-sm text-[#7a6459] dark:text-[#a8958c]">
            Consulta de la vista segura <code>v_cupones_admin</code>, filtros y canje manual en caja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setCodigoParaCanje("");
              setMontoParaCanje("");
              setCanjeModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#3F6551] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#335342]"
          >
            <QrCode className="h-4 w-4" />
            Canjear Cupón
          </button>

          <button
            onClick={exportarCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[#ebdcd3] bg-white px-3.5 py-2 text-xs font-medium text-[#2B1F1A] transition hover:bg-[#ebdcd3]/40 dark:border-[#3a2c27] dark:bg-[#251d19] dark:text-[#f3ede8]"
          >
            <Download className="h-4 w-4 text-[#7a6459]" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="rounded-2xl border border-[#ebdcd3] bg-white p-4 shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19] space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {/* Buscador de código */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7a6459]" />
            <input
              type="text"
              placeholder="Buscar por código (ej: JAMA-)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
            />
          </div>

          {/* Estado */}
          <div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
            >
              <option value="todos">Todos los estados</option>
              <option value="generado">Generados (activos)</option>
              <option value="usado">Usados (canjeados)</option>
              <option value="vencido">Vencidos</option>
            </select>
          </div>

          {/* Lugar */}
          <div>
            <select
              value={filtroLugar}
              onChange={(e) => setFiltroLugar(e.target.value)}
              className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
            >
              <option value="todos">Todas las cafeterías</option>
              {lugares.map((l) => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
          </div>

          {/* Origen */}
          <div>
            <select
              value={filtroOrigen}
              onChange={(e) => setFiltroOrigen(e.target.value)}
              className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
            >
              <option value="todos">Todos los orígenes</option>
              <option value="app">App (Worker)</option>
              <option value="agente">Agente IA</option>
            </select>
          </div>

          {/* Limpiar filtros */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setSearchCode("");
                setFiltroEstado("todos");
                setFiltroLugar("todos");
                setFiltroOrigen("todos");
                setFechaDesde("");
                setFechaHasta("");
              }}
              className="w-full rounded-xl border border-dashed border-[#ebdcd3] px-3 py-2 text-xs text-[#7a6459] hover:text-[#2B1F1A] dark:border-[#3a2c27] dark:text-[#a8958c]"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Fechas */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#7a6459] dark:text-[#a8958c]">
          <span>Rango de fecha:</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="rounded-lg border border-[#ebdcd3] bg-[#FBF8F4] px-2 py-1 text-xs outline-none dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
          />
          <span>hasta</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="rounded-lg border border-[#ebdcd3] bg-[#FBF8F4] px-2 py-1 text-xs outline-none dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
          />
          <span className="ml-auto font-medium text-[#2B1F1A] dark:text-[#f3ede8]">
            {cuponesFiltrados.length} {cuponesFiltrados.length === 1 ? "resultado" : "resultados"}
          </span>
        </div>
      </div>

      {/* Tabla de cupones */}
      <div className="overflow-hidden rounded-2xl border border-[#ebdcd3] bg-white shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#ebdcd3] bg-[#FBF8F4] text-[#7a6459] dark:border-[#3a2c27] dark:bg-[#1e1714] dark:text-[#a8958c]">
              <tr>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Lugar & Barrio</th>
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Origen</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Monto Ticket</th>
                <th className="px-4 py-3 font-semibold">Comisión</th>
                <th className="px-4 py-3 font-semibold">Generado</th>
                <th className="px-4 py-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdcd3] dark:divide-[#3a2c27]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#7a6459] dark:text-[#a8958c]">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#3F6551] border-t-transparent" />
                    <p className="mt-2">Cargando cupones desde v_cupones_admin...</p>
                  </td>
                </tr>
              ) : cuponesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#7a6459] dark:text-[#a8958c]">
                    No se encontraron cupones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                cuponesFiltrados.map((c) => {
                  const estado = c.estado_efectivo || "generado";
                  const estadoBadge = {
                    usado: "bg-[#3F6551]/15 text-[#3F6551] dark:text-[#7ba98f]",
                    generado: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                    vencido: "bg-red-500/15 text-red-600 dark:text-red-400",
                  }[estado] || "bg-gray-100 text-gray-700";

                  return (
                    <tr key={c.id} className="hover:bg-[#FBF8F4]/60 dark:hover:bg-[#1f1815] transition">
                      <td className="px-4 py-3 font-mono font-bold text-[#2B1F1A] dark:text-[#f3ede8]">
                        {c.codigo}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#2B1F1A] dark:text-[#f3ede8]">{c.lugar_nombre}</p>
                        <p className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">{c.barrio}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#2B1F1A] dark:text-[#f3ede8]">{c.usuario_nombre || "—"}</p>
                        <p className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">{c.usuario_email || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          c.origen === "agente" 
                            ? "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                            : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                        }`}>
                          {c.origen === "agente" ? <Bot className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                          {c.origen || "app"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 font-semibold text-[11px] capitalize ${estadoBadge}`}>
                          {estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {c.monto_compra ? `$${c.monto_compra.toLocaleString("es-AR")}` : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#3F6551] dark:text-[#7ba98f]">
                        {c.comision ? `$${c.comision.toLocaleString("es-AR")}` : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#7a6459] dark:text-[#a8958c]">
                        {c.fecha_generacion ? new Date(c.fecha_generacion).toLocaleDateString("es-AR") : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {estado === "generado" ? (
                          <button
                            onClick={() => {
                              setCodigoParaCanje(c.codigo || "");
                              setMontoParaCanje("");
                              setCanjeModalOpen(true);
                            }}
                            className="rounded-lg bg-[#3F6551] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#335342]"
                          >
                            Canjear
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#7a6459] dark:text-[#a8958c]">
                            {estado === "usado" ? "Completado" : "Expirado"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Canje */}
      {canjeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#ebdcd3] bg-white p-6 shadow-2xl dark:border-[#3a2c27] dark:bg-[#251d19]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd3] dark:border-[#3a2c27]">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-[#3F6551]" />
                <h3 className="text-lg font-bold text-[#2B1F1A] dark:text-[#f3ede8]">
                  Canjear Cupón (Operación Admin)
                </h3>
              </div>
              <button
                onClick={() => setCanjeModalOpen(false)}
                className="text-[#7a6459] hover:text-[#2B1F1A] dark:text-[#a8958c]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCanjear} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                  Código del Cupón
                </label>
                <input
                  type="text"
                  required
                  placeholder="JAMA-XXXXXX"
                  value={codigoParaCanje}
                  onChange={(e) => setCodigoParaCanje(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-4 py-2.5 font-mono text-sm uppercase outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                  Monto Total de Compra (ARS)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="Ej: 8500"
                  value={montoParaCanje}
                  onChange={(e) => setMontoParaCanje(e.target.value)}
                  className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-4 py-2.5 text-sm outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                />
                <p className="mt-1 text-[11px] text-[#7a6459] dark:text-[#a8958c]">
                  Este monto se guardará en <code>monto_compra</code> y calculará la comisión del local.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCanjeModalOpen(false)}
                  className="rounded-xl border border-[#ebdcd3] px-4 py-2 text-xs font-semibold text-[#7a6459] hover:text-[#2B1F1A] dark:border-[#3a2c27] dark:text-[#a8958c]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={canjeando}
                  className="flex items-center gap-1.5 rounded-xl bg-[#3F6551] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#335342] disabled:opacity-50"
                >
                  {canjeando ? "Procesando RPC..." : "Confirmar Canje"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
