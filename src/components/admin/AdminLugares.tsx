import { useEffect, useState, useMemo } from "react";
import { 
  Store, 
  Plus, 
  Edit3, 
  CheckCircle, 
  Wifi, 
  Percent, 
  AlertTriangle, 
  X, 
  Camera, 
  Clock, 
  Power 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { barrios } from "@/data/cafes";
import type { Database } from "@/types/database.types";

type Lugar = Database["public"]["Tables"]["lugares"]["Row"];
type LugarInsert = Database["public"]["Tables"]["lugares"]["Insert"];

export function AdminLugares() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [qualityFilter, setQualityFilter] = useState<"todos" | "sin_fotos" | "incompletos" | "sin_verificar">("todos");

  // Modal ABM
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLugar, setEditingLugar] = useState<Lugar | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "cafetería",
    barrio: "Palermo",
    direccion: "",
    comision_pct: 10,
    wifi_score: 8,
    tiene_enchufes: true,
    nivel_ruido: "Silencioso",
    rango_precios: "$$",
    resena_curada: "",
    horarios: "",
    productos_destacados: "",
    fotosText: "",
    activo: true,
  });

  const loadLugares = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lugares")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      if (data) setLugares(data);
    } catch (err: any) {
      toast.error(err.message || "Error cargando lugares");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLugares();
  }, []);

  // Métricas de calidad
  const metrics = useMemo(() => {
    const now = Date.now();
    const days60 = 60 * 24 * 3600 * 1000;

    const sinFotos = lugares.filter((l) => !l.fotos || l.fotos.length === 0);
    const incompletos = lugares.filter((l) => !l.horarios || !l.productos_destacados || !l.resena_curada);
    const sinVerificar = lugares.filter((l) => {
      if (!l.ultima_verificacion) return true;
      return now - new Date(l.ultima_verificacion).getTime() > days60;
    });

    return {
      sinFotosCount: sinFotos.length,
      incompletosCount: incompletos.length,
      sinVerificarCount: sinVerificar.length,
    };
  }, [lugares]);

  // Lista filtrada por chips de calidad
  const lugaresFiltrados = useMemo(() => {
    const now = Date.now();
    const days60 = 60 * 24 * 3600 * 1000;

    return lugares.filter((l) => {
      if (qualityFilter === "sin_fotos") {
        return !l.fotos || l.fotos.length === 0;
      }
      if (qualityFilter === "incompletos") {
        return !l.horarios || !l.productos_destacados || !l.resena_curada;
      }
      if (qualityFilter === "sin_verificar") {
        if (!l.ultima_verificacion) return true;
        return now - new Date(l.ultima_verificacion).getTime() > days60;
      }
      return true;
    });
  }, [lugares, qualityFilter]);

  // Toggle Activo/Inactivo
  const toggleActivo = async (lugar: Lugar) => {
    const nuevoEstado = !lugar.activo;
    try {
      const { error } = await supabase
        .from("lugares")
        .update({ activo: nuevoEstado })
        .eq("id", lugar.id);

      if (error) throw error;
      toast.success(`${lugar.nombre} ${nuevoEstado ? "activado" : "desactivado (baja lógica)"}`);
      setLugares((prev) =>
        prev.map((l) => (l.id === lugar.id ? { ...l, activo: nuevoEstado } : l))
      );
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar estado");
    }
  };

  // Marcar como verificado hoy
  const marcarVerificadoHoy = async (lugar: Lugar) => {
    const nowIso = new Date().toISOString();
    try {
      const { error } = await supabase
        .from("lugares")
        .update({ ultima_verificacion: nowIso })
        .eq("id", lugar.id);

      if (error) throw error;
      toast.success(`${lugar.nombre} verificado con fecha de hoy`);
      setLugares((prev) =>
        prev.map((l) => (l.id === lugar.id ? { ...l, ultima_verificacion: nowIso } : l))
      );
    } catch (err: any) {
      toast.error(err.message || "Error al verificar lugar");
    }
  };

  // Abrir Modal para Crear
  const handleOpenCreate = () => {
    setEditingLugar(null);
    setFormData({
      nombre: "",
      tipo: "cafetería",
      barrio: "Palermo",
      direccion: "",
      comision_pct: 10,
      wifi_score: 8,
      tiene_enchufes: true,
      nivel_ruido: "Silencioso",
      rango_precios: "$$",
      resena_curada: "",
      horarios: JSON.stringify([
        { day: "Lunes a Viernes", time: "08:00 – 20:00" },
        { day: "Sábado", time: "09:00 – 21:00" },
        { day: "Domingo", time: "10:00 – 19:00" }
      ], null, 2),
      productos_destacados: JSON.stringify([
        { item: "Flat White", price: 3800 },
        { item: "Tostado", price: 6500 }
      ], null, 2),
      fotosText: "",
      activo: true,
    });
    setModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEdit = (lugar: Lugar) => {
    setEditingLugar(lugar);
    setFormData({
      nombre: lugar.nombre || "",
      tipo: lugar.tipo || "cafetería",
      barrio: lugar.barrio || "Palermo",
      direccion: lugar.direccion || "",
      comision_pct: lugar.comision_pct ?? 10,
      wifi_score: lugar.wifi_score ?? 8,
      tiene_enchufes: lugar.tiene_enchufes ?? true,
      nivel_ruido: lugar.nivel_ruido || "Silencioso",
      rango_precios: lugar.rango_precios || "$$",
      resena_curada: lugar.resena_curada || "",
      horarios: lugar.horarios || "",
      productos_destacados: lugar.productos_destacados || "",
      fotosText: (lugar.fotos || []).join("\n"),
      activo: lugar.activo ?? true,
    });
    setModalOpen(true);
  };

  // Guardar formulario
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const fotosArray = formData.fotosText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload: LugarInsert = {
      nombre: formData.nombre.trim(),
      tipo: formData.tipo,
      barrio: formData.barrio,
      direccion: formData.direccion.trim(),
      comision_pct: Number(formData.comision_pct),
      wifi_score: Number(formData.wifi_score),
      tiene_enchufes: formData.tiene_enchufes,
      nivel_ruido: formData.nivel_ruido,
      rango_precios: formData.rango_precios,
      resena_curada: formData.resena_curada.trim(),
      horarios: formData.horarios.trim(),
      productos_destacados: formData.productos_destacados.trim(),
      fotos: fotosArray,
      activo: formData.activo,
    };

    try {
      if (editingLugar) {
        const { error } = await supabase
          .from("lugares")
          .update(payload)
          .eq("id", editingLugar.id);
        if (error) throw error;
        toast.success(`Lugar "${formData.nombre}" actualizado.`);
      } else {
        const { error } = await supabase
          .from("lugares")
          .insert(payload);
        if (error) throw error;
        toast.success(`Nuevo lugar "${formData.nombre}" creado con éxito.`);
      }

      setModalOpen(false);
      loadLugares();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el lugar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2B1F1A] dark:text-[#f3ede8]">
            Catálogo de Cafeterías & Coworkings
          </h2>
          <p className="text-sm text-[#7a6459] dark:text-[#a8958c]">
            Administración completa de fichas, pactos de comisión %, fotos y verificación de datos.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-xl bg-[#3F6551] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#335342]"
        >
          <Plus className="h-4 w-4" />
          Nuevo Lugar
        </button>
      </div>

      {/* Chips de Calidad de Datos */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setQualityFilter("todos")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            qualityFilter === "todos"
              ? "bg-[#2B1F1A] text-white dark:bg-[#f3ede8] dark:text-[#2B1F1A]"
              : "border border-[#ebdcd3] bg-white text-[#7a6459] dark:border-[#3a2c27] dark:bg-[#251d19] dark:text-[#a8958c]"
          }`}
        >
          Todos ({lugares.length})
        </button>

        <button
          onClick={() => setQualityFilter("sin_fotos")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            qualityFilter === "sin_fotos"
              ? "bg-amber-600 text-white"
              : "border border-[#ebdcd3] bg-white text-[#7a6459] dark:border-[#3a2c27] dark:bg-[#251d19] dark:text-[#a8958c]"
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          Sin fotos ({metrics.sinFotosCount})
        </button>

        <button
          onClick={() => setQualityFilter("incompletos")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            qualityFilter === "incompletos"
              ? "bg-red-600 text-white"
              : "border border-[#ebdcd3] bg-white text-[#7a6459] dark:border-[#3a2c27] dark:bg-[#251d19] dark:text-[#a8958c]"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Campos vacíos ({metrics.incompletosCount})
        </button>

        <button
          onClick={() => setQualityFilter("sin_verificar")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            qualityFilter === "sin_verificar"
              ? "bg-purple-600 text-white"
              : "border border-[#ebdcd3] bg-white text-[#7a6459] dark:border-[#3a2c27] dark:bg-[#251d19] dark:text-[#a8958c]"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Sin verificar &gt; 60d ({metrics.sinVerificarCount})
        </button>
      </div>

      {/* Tabla de Lugares */}
      <div className="overflow-hidden rounded-2xl border border-[#ebdcd3] bg-white shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#ebdcd3] bg-[#FBF8F4] text-[#7a6459] dark:border-[#3a2c27] dark:bg-[#1e1714] dark:text-[#a8958c]">
              <tr>
                <th className="px-4 py-3 font-semibold">Lugar</th>
                <th className="px-4 py-3 font-semibold">Barrio & Tipo</th>
                <th className="px-4 py-3 font-semibold">WiFi Score</th>
                <th className="px-4 py-3 font-semibold">Comisión</th>
                <th className="px-4 py-3 font-semibold">Fotos</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Última Verificación</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdcd3] dark:divide-[#3a2c27]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7a6459] dark:text-[#a8958c]">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#3F6551] border-t-transparent" />
                    <p className="mt-2">Cargando catálogo...</p>
                  </td>
                </tr>
              ) : lugaresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7a6459] dark:text-[#a8958c]">
                    No se encontraron cafeterías con el criterio seleccionado.
                  </td>
                </tr>
              ) : (
                lugaresFiltrados.map((l) => {
                  const cantFotos = l.fotos?.length || 0;
                  const verificacionDate = l.ultima_verificacion 
                    ? new Date(l.ultima_verificacion).toLocaleDateString("es-AR") 
                    : "Nunca";

                  return (
                    <tr key={l.id} className="hover:bg-[#FBF8F4]/60 dark:hover:bg-[#1f1815] transition">
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#2B1F1A] dark:text-[#f3ede8]">{l.nombre}</p>
                        <p className="text-[11px] text-[#7a6459] dark:text-[#a8958c] truncate max-w-xs">{l.direccion}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-[#2B1F1A] dark:text-[#f3ede8]">{l.barrio}</span>
                        <span className="ml-1 text-[11px] text-[#7a6459] dark:text-[#a8958c] capitalize">({l.tipo})</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#3F6551]/10 px-2 py-0.5 font-bold text-[#3F6551] dark:text-[#7ba98f]">
                          <Wifi className="h-3 w-3" />
                          {l.wifi_score}/10
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#2B1F1A] dark:text-[#f3ede8]">
                        {l.comision_pct}%
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          cantFotos === 0 ? "text-red-500 font-bold" : "text-[#7a6459] dark:text-[#a8958c]"
                        }`}>
                          <Camera className="h-3.5 w-3.5" />
                          {cantFotos} {cantFotos === 1 ? "foto" : "fotos"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActivo(l)}
                          title="Clic para cambiar estado activo"
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                            l.activo
                              ? "bg-[#3F6551]/15 text-[#3F6551] dark:text-[#7ba98f]"
                              : "bg-red-500/15 text-red-600 dark:text-red-400"
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          {l.activo ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#7a6459] dark:text-[#a8958c]">
                        {verificacionDate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => marcarVerificadoHoy(l)}
                            title="Marcar como verificado hoy"
                            className="rounded-lg border border-[#ebdcd3] px-2 py-1 text-[11px] font-medium text-[#3F6551] hover:bg-[#3F6551]/10 dark:border-[#3a2c27] dark:text-[#7ba98f]"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(l)}
                            className="rounded-lg bg-[#2B1F1A] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#413028] dark:bg-[#3a2c27] dark:hover:bg-[#4d3b34]"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ABM de Lugar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-[#ebdcd3] bg-white p-6 shadow-2xl dark:border-[#3a2c27] dark:bg-[#251d19]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd3] dark:border-[#3a2c27]">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-[#3F6551]" />
                <h3 className="text-lg font-bold text-[#2B1F1A] dark:text-[#f3ede8]">
                  {editingLugar ? `Editar Lugar: ${editingLugar.nombre}` : "Alta de Nueva Cafetería / Coworking"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#7a6459] hover:text-[#2B1F1A] dark:text-[#a8958c]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    Nombre del Lugar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  >
                    <option value="cafetería">Cafetería</option>
                    <option value="coworking">Coworking</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    Barrio en CABA *
                  </label>
                  <select
                    value={formData.barrio}
                    onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                    className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  >
                    {barrios.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    Dirección exacta *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  />
                </div>
              </div>

              {/* Parámetros de negocio */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    Comisión %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.comision_pct}
                    onChange={(e) => setFormData({ ...formData, comision_pct: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    WiFi Score (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.wifi_score}
                    onChange={(e) => setFormData({ ...formData, wifi_score: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    Nivel Ruido
                  </label>
                  <select
                    value={formData.nivel_ruido}
                    onChange={(e) => setFormData({ ...formData, nivel_ruido: e.target.value })}
                    className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  >
                    <option value="Silencioso">Silencioso</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Animado">Animado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    Precios
                  </label>
                  <select
                    value={formData.rango_precios}
                    onChange={(e) => setFormData({ ...formData, rango_precios: e.target.value })}
                    className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] px-3 py-2 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  >
                    <option value="$">$ (Económico)</option>
                    <option value="$$">$$ (Medio)</option>
                    <option value="$$$">$$$ (Premium)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tiene_enchufes}
                    onChange={(e) => setFormData({ ...formData, tiene_enchufes: e.target.checked })}
                    className="h-4 w-4 rounded accent-[#3F6551]"
                  />
                  <span>Tiene enchufes disponibles</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="h-4 w-4 rounded accent-[#3F6551]"
                  />
                  <span>Lugar activo en el explorador</span>
                </label>
              </div>

              {/* Reseña Curada */}
              <div>
                <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                  Reseña Curada por Jama (Valor Editorial)
                </label>
                <textarea
                  rows={3}
                  placeholder="Cafetería de especialidad con excelente iluminación natural, mesas amplias y café de origen colombiano..."
                  value={formData.resena_curada}
                  onChange={(e) => setFormData({ ...formData, resena_curada: e.target.value })}
                  className="w-full rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] p-3 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                />
              </div>

              {/* Fotos como URLs una por línea */}
              <div>
                <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                  Fotos (URLs de imágenes, una por línea)
                </label>
                <textarea
                  rows={3}
                  placeholder="https://images.unsplash.com/photo-1554118811...&#10;https://images.unsplash.com/photo-1445116572..."
                  value={formData.fotosText}
                  onChange={(e) => setFormData({ ...formData, fotosText: e.target.value })}
                  className="w-full font-mono text-[11px] rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] p-3 outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                />
              </div>

              {/* Horarios y Carta */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    Horarios (JSON o texto)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.horarios}
                    onChange={(e) => setFormData({ ...formData, horarios: e.target.value })}
                    className="w-full font-mono text-[11px] rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] p-3 outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7a6459] dark:text-[#a8958c] mb-1">
                    Productos Destacados / Carta
                  </label>
                  <textarea
                    rows={3}
                    value={formData.productos_destacados}
                    onChange={(e) => setFormData({ ...formData, productos_destacados: e.target.value })}
                    className="w-full font-mono text-[11px] rounded-xl border border-[#ebdcd3] bg-[#FBF8F4] p-3 outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#1a1412] dark:text-[#f3ede8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ebdcd3] dark:border-[#3a2c27]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#ebdcd3] px-4 py-2 text-xs font-semibold text-[#7a6459] hover:text-[#2B1F1A] dark:border-[#3a2c27] dark:text-[#a8958c]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#3F6551] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#335342] disabled:opacity-50"
                >
                  {saving ? "Guardando..." : editingLugar ? "Actualizar Lugar" : "Crear Lugar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
