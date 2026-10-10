import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clock } from "lucide-react";
import { cafes, getCafe } from "@/data/cafes";
import { RequireAuth } from "@/components/jama/RequireAuth";

export const Route = createFileRoute("/mi-qr")({
  validateSearch: (s: Record<string, unknown>): { cafe?: string } => ({ cafe: typeof s.cafe === "string" ? s.cafe : undefined }),
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

interface QR { code: string; cafeId: string; expires: number; status: "Activo" | "Canjeado" | "Expirado" }
const KEY = "jama-qr";
const gen = () => "JAMA-" + Math.random().toString(36).slice(2, 8).toUpperCase();

function MiQR() {
  const { cafe } = Route.useSearch();
  const [qr, setQr] = useState<QR | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    let q: QR | null = raw ? JSON.parse(raw) : null;
    if (q && q.status === "Activo" && q.expires < Date.now()) q = { ...q, status: "Expirado" };
    if (!q || (cafe && q.cafeId !== cafe && q.status !== "Activo")) {
      q = { code: gen(), cafeId: cafe ?? cafes.find((c) => c.discount)!.id, expires: Date.now() + 864e5, status: "Activo" };
    }
    localStorage.setItem(KEY, JSON.stringify(q));
    setQr(q);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [cafe]);

  if (!qr) return null;
  const c = getCafe(qr.cafeId)!;
  const left = Math.max(0, qr.expires - now);
  const hms = [left / 36e5, (left / 6e4) % 60, (left / 1e3) % 60].map((v) => String(Math.floor(v)).padStart(2, "0")).join(":");
  const badge = { Activo: "bg-success/15 text-success", Canjeado: "bg-secondary text-muted-foreground", Expirado: "bg-destructive/15 text-destructive" }[qr.status];
  const renew = () => {
    const q: QR = { code: gen(), cafeId: qr.cafeId, expires: Date.now() + 864e5, status: "Activo" };
    localStorage.setItem(KEY, JSON.stringify(q)); setQr(q);
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">Tu descuento</p>
      <h1 className="mt-1 text-2xl font-bold">{c.discount?.percent ?? 10}% de descuento en <span className="text-primary">{c.name}</span></h1>
      <div className="mx-auto mt-8 w-fit rounded-3xl bg-foreground p-5 shadow-glow">
        <QRCodeSVG value={qr.code} size={220} bgColor="transparent" fgColor="currentColor" className="text-background" />
      </div>
      <div className="mt-6 font-mono text-2xl font-bold tracking-widest">{qr.code}</div>
      <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{qr.status}</span>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" /> Válido por 24 horas · <span className="font-mono text-foreground">{hms}</span>
      </div>
      <p className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm">Mostrá este código al mozo o cajero para obtener tu descuento.</p>
      <button onClick={renew} disabled={qr.status === "Activo"} className="mt-4 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-40">Generar nuevo QR</button>
    </div>
  );
}
