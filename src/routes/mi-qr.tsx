import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clock } from "lucide-react";
import { RequireAuth } from "@/components/jama/RequireAuth";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/mi-qr")({
  validateSearch: (s: Record<string, unknown>): { cafe?: string | undefined } => ({
    cafe: typeof s['cafe'] === "string" ? s['cafe'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mi QR de descuento — Jama" },
      { name: "description", content: "Mostrá tu código QR de Jama en la cafetería y obtené tu descuento." },
      { property: "og:title", content: "Mi QR — Jama" },
      { property: "og:description", content: "Tu código de descuento en cafeterías aliadas." },
    ],
  }),
  component: () => <RequireAuth><MiQR /></RequireAuth>,
});

interface QR { id: string; codigo: string; lugar_id: string; fecha_generacion: string; estado: string; lugares: { nombre: string; descuento_aplicable?: string } }
const gen = () => "JAMA-" + Math.random().toString(36).slice(2, 8).toUpperCase();

function MiQR() {
  const { cafe } = Route.useSearch();
  const { user } = useAuth();
  const [qr, setQr] = useState<QR | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    async function loadOrCreateQR() {
      setLoading(true);
      try {
        // Primero buscar si hay un cupón generado (activo) para este usuario y café
        let query = supabase.from('cupones').select('*, lugares(nombre)').eq('usuario_id', user!.id).eq('estado', 'generado');
        if (cafe) {
          query = query.eq('lugar_id', cafe);
        }
        
        const { data: existingQrs, error: fetchError } = await query.order('fecha_generacion', { ascending: false }).limit(1);
        
        if (fetchError) throw fetchError;

        if (existingQrs && existingQrs.length > 0) {
          setQr(existingQrs[0] as unknown as QR);
        } else if (cafe) {
          // Crear nuevo cupón si venimos de la pantalla de una cafetería
          const codigo = gen();
          const { data: newQr, error: insertError } = await supabase.from('cupones').insert({
            lugar_id: cafe,
            usuario_id: user!.id,
            codigo,
            descuento_aplicable: "15% OFF", // Esto podría venir de la DB del lugar en V2
          }).select('*, lugares(nombre)').single();

          if (insertError) throw insertError;
          setQr(newQr as unknown as QR);
        } else {
          // No hay cupón activo y no hay id de café para generar uno
          setErrorMsg("No tienes ningún descuento activo. Explora cafeterías para generar uno.");
        }
      } catch (err: any) {
        console.error("Error cargando QR:", err);
        setErrorMsg("Error cargando el cupón. " + err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrCreateQR();

    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [cafe, user]);

  if (loading) return <div className="py-20 text-center text-muted-foreground">Cargando cupón...</div>;
  if (errorMsg || !qr) return <div className="py-20 text-center text-muted-foreground">{errorMsg}</div>;

  const createdAt = new Date(qr.fecha_generacion).getTime();
  const expires = createdAt + 864e5; // 24hs
  const left = Math.max(0, expires - now);
  
  const estadoEfectivo = (left === 0 && qr.estado === 'generado') ? 'vencido' : qr.estado;

  const hms = [left / 36e5, (left / 6e4) % 60, (left / 1e3) % 60].map((v) => String(Math.floor(v)).padStart(2, "0")).join(":");
  const badge = { generado: "bg-success/15 text-success", usado: "bg-secondary text-muted-foreground", vencido: "bg-destructive/15 text-destructive" }[estadoEfectivo] || "bg-secondary";

  const renew = async () => {
    if (!cafe) return;
    setLoading(true);
    const codigo = gen();
    const { data: newQr } = await supabase.from('cupones').insert({
      lugar_id: qr.lugar_id,
      usuario_id: user!.id,
      codigo,
      descuento_aplicable: "15% OFF",
    }).select('*, lugares(nombre)').single();
    if (newQr) setQr(newQr as unknown as QR);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">Tu descuento</p>
      <h1 className="mt-1 text-2xl font-bold">15% de descuento en <span className="text-primary">{qr.lugares?.nombre}</span></h1>
      <div className="mx-auto mt-8 w-fit rounded-3xl bg-foreground p-5 shadow-glow">
        <QRCodeSVG value={qr.codigo} size={220} bgColor="transparent" fgColor="currentColor" className="text-background" />
      </div>
      <div className="mt-6 font-mono text-2xl font-bold tracking-widest">{qr.codigo}</div>
      <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${badge}`}>{qr.estado}</span>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" /> Válido por 24 horas · <span className="font-mono text-foreground">{hms}</span>
      </div>
      <p className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm">Mostrá este código al mozo o cajero para obtener tu descuento.</p>
      <button onClick={renew} disabled={qr.estado === "generado"} className="mt-4 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-40">Generar nuevo QR</button>
    </div>
  );
}
