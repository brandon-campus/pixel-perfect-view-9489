import { Link } from "@tanstack/react-router";
import { Plug, Star, Volume1, Volume2, VolumeX, Wifi } from "lucide-react";
import type { Cafe, Noise } from "@/data/cafes";

export const NoiseIcon = ({ noise, className = "h-3.5 w-3.5" }: { noise: Noise; className?: string }) =>
  noise === "Silencioso" ? <VolumeX className={className} /> : noise === "Moderado" ? <Volume1 className={className} /> : <Volume2 className={className} />;

export const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{children}</span>
);

const occColor = { bajo: "bg-success", medio: "bg-warning", alto: "bg-destructive" };

export function CafeCard({ cafe, compact = false }: { cafe: Cafe; compact?: boolean }) {
  return (
    <Link to="/cafeteria/$id" params={{ id: cafe.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:border-primary/40">
      <div className="relative">
        <img src={cafe.photos[0]} alt={cafe.name} loading="lazy" className={`${compact ? "h-32" : "h-44"} w-full object-cover transition duration-500 group-hover:scale-105`} />
        {cafe.discount && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-glow">
            -{cafe.discount.percent}% Jama
          </span>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold leading-tight">{cafe.name}</h3>
            <p className="text-sm text-muted-foreground">{cafe.barrio}</p>
          </div>
          {!compact && (
            <span className="flex items-center gap-1 text-sm font-medium"><Star className="h-4 w-4 fill-warning text-warning" />{cafe.rating}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip><Wifi className="h-3.5 w-3.5 text-primary" />{cafe.wifi} Mbps</Chip>
          <Chip><NoiseIcon noise={cafe.noise} />{cafe.noise}</Chip>
          <Chip>{cafe.price}</Chip>
          {!compact && cafe.plugs > 0 && <Chip><Plug className="h-3.5 w-3.5" />Enchufes</Chip>}
        </div>
        {!compact && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${occColor[cafe.occupancy]}`} />
            Ocupación {cafe.occupancy}
            {cafe.openNow ? <span className="ml-auto text-success">Abierto</span> : <span className="ml-auto">Cerrado</span>}
          </div>
        )}
        {compact && <span className="block rounded-xl bg-primary py-2 text-center text-sm font-semibold text-primary-foreground">Ver perfil</span>}
      </div>
    </Link>
  );
}
