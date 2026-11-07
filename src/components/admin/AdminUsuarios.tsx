import { useEffect, useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Heart, 
  QrCode, 
  CheckCircle2, 
  X, 
  Calendar, 
  Clock, 
  Mail, 
  ExternalLink 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Usuario = Database["public"]["Tables"]["usuarios"]["Row"];
type VCupon = Database["public"]["Views"]["v_cupones_admin"]["Row"];

interface UsuarioRow extends Usuario {
  cuponesTotal: number;
  cuponesUsados: number;
  favoritosCount: number;
}

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cupones, setCupones] = useState<VCupon[]>([]);
  const [favoritos, setFavoritos] = useState<{ usuario_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal / Drawer de detalle de cupones de usuario
  const [selectedUser, setSelectedUser] = useState<UsuarioRow | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [
          { data: uData, error: uErr },
          { data: cData, error: cErr },
          { data: fData, error: fErr },
        ] = await Promise.all([
          supabase.from("usuarios").select("*").order("fecha_alta", { ascending: false }),
          supabase.from("v_cupones_admin").select("*"),
          supabase.from("lugares_guardados").select("usuario_id"),
        ]);

        if (uErr) throw uErr;
        if (cErr) throw cErr;
        if (fErr) throw fErr;

        if (uData) setUsuarios(uData);
        if (cData) setCupones(cData);
        if (fData) setFavoritos(fData);
      } catch (err: any) {
        toast.error(err.message || "Error cargando usuarios");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cruzar datos de usuarios con cupones y favoritos
  const usuariosConMetricas = useMemo<UsuarioRow[]>(() => {
    return usuarios.map((u) => {
      const uCupones = cupones.filter((c) => c.usuario_id === u.id);
      const uUsados = uCupones.filter((c) => c.estado_efectivo === "usado").length;
      const uFavoritos = favoritos.filter((f) => f.usuario_id === u.id).length;

      return {
        ...u,
        cuponesTotal: uCupones.length,
        cuponesUsados: uUsados,
        favoritosCount: uFavoritos,
      };
    });
  }, [usuarios, cupones, favoritos]);

  // Filtrado por buscador
  const usuariosFiltrados = useMemo(() => {
    if (!search.trim()) return usuariosConMetricas;
    const q = search.toLowerCase();
    return usuariosConMetricas.filter(
      (u) => u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [usuariosConMetricas, search]);

  // Cupones del usuario seleccionado
  const cuponesUsuarioSeleccionado = useMemo(() => {
    if (!selectedUser) return [];
    return cupones.filter((c) => c.usuario_id === selectedUser.id);
  }, [selectedUser, cupones]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2B1F1A] dark:text-[#f3ede8]">
            Usuarios Registrados
          </h2>
          <p className="text-sm text-[#7a6459] dark:text-[#a8958c]">
            Comunidad de workers en Jama, historial de cupones emitidos y lugares guardados (Solo lectura).
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7a6459]" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#ebdcd3] bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#3F6551] dark:border-[#3a2c27] dark:bg-[#251d19] dark:text-[#f3ede8]"
          />
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="overflow-hidden rounded-2xl border border-[#ebdcd3] bg-white shadow-sm dark:border-[#3a2c27] dark:bg-[#251d19]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#ebdcd3] bg-[#FBF8F4] text-[#7a6459] dark:border-[#3a2c27] dark:bg-[#1e1714] dark:text-[#a8958c]">
              <tr>
                <th className="px-4 py-3 font-semibold">Worker</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Fecha de Alta</th>
                <th className="px-4 py-3 font-semibold text-center">Cupones Generados</th>
                <th className="px-4 py-3 font-semibold text-center">Cupones Canjeados</th>
                <th className="px-4 py-3 font-semibold text-center">Favoritos</th>
                <th className="px-4 py-3 font-semibold text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdcd3] dark:divide-[#3a2c27]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7a6459] dark:text-[#a8958c]">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#3F6551] border-t-transparent" />
                    <p className="mt-2">Cargando usuarios...</p>
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7a6459] dark:text-[#a8958c]">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FBF8F4]/60 dark:hover:bg-[#1f1815] transition">
                    <td className="px-4 py-3 font-bold text-[#2B1F1A] dark:text-[#f3ede8]">
                      {u.nombre}
                    </td>
                    <td className="px-4 py-3 text-[#7a6459] dark:text-[#a8958c]">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-[#7a6459] dark:text-[#a8958c]">
                      {u.fecha_alta ? new Date(u.fecha_alta).toLocaleDateString("es-AR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <QrCode className="h-3 w-3 text-[#C97B5A]" />
                        {u.cuponesTotal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[#3F6551] dark:text-[#7ba98f]">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="h-3 w-3" />
                        {u.cuponesUsados}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-[#7a6459] dark:text-[#a8958c]">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Heart className="h-3 w-3 text-red-500 fill-red-500/20" />
                        {u.favoritosCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="rounded-lg border border-[#ebdcd3] px-2.5 py-1 text-[11px] font-semibold text-[#2B1F1A] hover:bg-[#ebdcd3]/40 dark:border-[#3a2c27] dark:text-[#f3ede8]"
                      >
                        Ver Cupones
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Detalle de Cupones del Usuario */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#ebdcd3] bg-white p-6 shadow-2xl dark:border-[#3a2c27] dark:bg-[#251d19]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd3] dark:border-[#3a2c27]">
              <div>
                <h3 className="text-base font-bold text-[#2B1F1A] dark:text-[#f3ede8]">
                  Cupones de {selectedUser.nombre}
                </h3>
                <p className="text-xs text-[#7a6459] dark:text-[#a8958c]">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#7a6459] hover:text-[#2B1F1A] dark:text-[#a8958c]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
              {cuponesUsuarioSeleccionado.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#7a6459] dark:text-[#a8958c]">
                  Este usuario aún no ha generado ningún cupón.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {cuponesUsuarioSeleccionado.map((c) => {
                    const estado = c.estado_efectivo || "generado";
                    const estadoBadge = {
                      usado: "bg-[#3F6551]/15 text-[#3F6551] dark:text-[#7ba98f]",
                      generado: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                      vencido: "bg-red-500/15 text-red-600 dark:text-red-400",
                    }[estado] || "bg-gray-100 text-gray-700";

                    return (
                      <div
                        key={c.id}
                        className="rounded-xl border border-[#ebdcd3] p-3 text-xs dark:border-[#3a2c27]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#2B1F1A] dark:text-[#f3ede8]">
                            {c.codigo}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${estadoBadge}`}>
                            {estado}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[#7a6459] dark:text-[#a8958c]">
                          <span>{c.lugar_nombre} ({c.barrio})</span>
                          <span>{c.descuento_aplicable}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-[#ebdcd3]/50 pt-2 text-[11px] dark:border-[#3a2c27]/50">
                          <span>
                            Generado: {c.fecha_generacion ? new Date(c.fecha_generacion).toLocaleDateString("es-AR") : "—"}
                          </span>
                          {c.monto_compra ? (
                            <span className="font-semibold text-[#3F6551] dark:text-[#7ba98f]">
                              Ticket: ${c.monto_compra.toLocaleString("es-AR")}
                            </span>
                          ) : (
                            <span className="text-[#7a6459] dark:text-[#a8958c]">Sin consumo</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#ebdcd3] dark:border-[#3a2c27] mt-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-xl bg-[#2B1F1A] px-4 py-2 text-xs font-semibold text-white dark:bg-[#3a2c27]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
