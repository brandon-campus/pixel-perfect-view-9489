import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Coffee, SendHorizontal } from "lucide-react";
import { cafes, barrios, type Cafe } from "@/data/cafes";
import { CafeCard } from "@/components/jama/CafeCard";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat con Jama — Recomendaciones con IA" },
      { name: "description", content: "Contale a Jama qué necesitás y recibí cafeterías recomendadas para trabajar en CABA." },
      { property: "og:title", content: "Chat con Jama" },
      { property: "og:description", content: "Tu asistente para encontrar dónde trabajar en Buenos Aires." },
    ],
  }),
  component: ChatPage,
});

interface Msg { role: "user" | "agent"; text: string; cafes?: Cafe[] }

function recommend(q: string): Msg {
  const t = q.toLowerCase();
  let list = [...cafes];
  const barrio = barrios.find((b) => t.includes(b.toLowerCase()));
  if (barrio) list = list.filter((c) => c.barrio === barrio);
  if (/tranquil|silenc|concentr/.test(t)) list = list.filter((c) => c.noise === "Silencioso");
  if (/wifi|rápid|rapid|internet|llamad|zoom/.test(t)) list.sort((a, b) => b.wifi - a.wifi);
  if (/enchuf|cargar|bater/.test(t)) list = list.filter((c) => c.plugs > 0);
  if (/barat|económ|econom/.test(t)) list = list.filter((c) => c.price !== "$$$");
  if (/descuent|promo/.test(t)) list = list.filter((c) => c.discount);
  if (!list.length) list = [...cafes].sort((a, b) => b.rating - a.rating);
  const top = list.slice(0, 3);
  return {
    role: "agent",
    text: `${barrio ? `En ${barrio}` : "Para vos"} encontré ${top.length} ${top.length === 1 ? "opción" : "opciones"} que encajan. ${top[0].name} es mi favorita: ${top[0].wifi} Mbps y ambiente ${top[0].noise.toLowerCase()}.`,
    cafes: top,
  };
}

const suggestions = ["Lugar tranquilo en Palermo", "WiFi rápido para llamadas", "Algo barato con enchufes", "Con descuento Jama"];

function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "agent", text: "¡Hola! Soy Jama 👋 Contame qué tipo de espacio necesitás para trabajar hoy. Podés decirme la zona, si necesitás WiFi rápido, un lugar tranquilo, o cualquier preferencia." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => { setMsgs((m) => [...m, recommend(text)]); setTyping(false); inputRef.current?.focus(); }, 900);
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem-4.5rem)] max-w-3xl flex-col md:h-[calc(100dvh-4rem)]">
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6">
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">{m.text}</div>
          </div>
        ) : (
          <div key={i} className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Coffee className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1 space-y-3">
              <p className="leading-relaxed">{m.text}</p>
              {m.cafes && (
                <div className="flex snap-x gap-3 overflow-x-auto pb-2">
                  {m.cafes.map((c) => <div key={c.id} className="w-60 shrink-0 snap-start"><CafeCard cafe={c} compact /></div>)}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/15 text-primary"><Coffee className="h-4 w-4" /></span>
            <div className="flex items-center gap-1 pt-3">{[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d * 120}ms` }} />)}</div>
          </div>
        )}
        {msgs.length === 1 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {suggestions.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground">{s}</button>)}
          </div>
        )}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border bg-background p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 focus-within:border-primary/60">
          <textarea ref={inputRef} autoFocus rows={1} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ej: Necesito un lugar tranquilo en Palermo con buen WiFi..."
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground" />
          <button type="submit" disabled={!input.trim() || typing} aria-label="Enviar"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition disabled:opacity-40">
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
