export type Noise = "Silencioso" | "Moderado" | "Animado";
export type Price = "$" | "$$" | "$$$";
export type Occupancy = "bajo" | "medio" | "alto";

export interface Cafe {
  id: string;
  name: string;
  barrio: string;
  address: string;
  wifi: number;
  noise: Noise;
  price: Price;
  plugs: number;
  discount?: { percent: number; description: string };
  rating: number;
  occupancy: Occupancy;
  openNow: boolean;
  photos: string[];
  hours: { day: string; time: string }[];
  menu: { item: string; price: number }[];
  occupancyByTime: { franja: string; valor: number }[];
}

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;
const P = [
  u("photo-1554118811-1e0d58224f24"),
  u("photo-1521017432531-fbd92d768814"),
  u("photo-1501339847302-ac426a4a7cbb"),
  u("photo-1445116572660-236099ec97a0"),
  u("photo-1559925393-8be0ec4767c8"),
  u("photo-1453614512568-c4024d13c247"),
  u("photo-1497515114629-f71d768fd07c"),
  u("photo-1600093463592-8e36ae95ef56"),
  u("photo-1525610553991-2bede1a236e2"),
  u("photo-1511920170033-f8396924c348"),
];
const photos = (i: number) => [P[i % 10], P[(i + 3) % 10], P[(i + 6) % 10], P[(i + 8) % 10]];

const hours = (open = "08:00", close = "20:00") => [
  { day: "Lunes a Viernes", time: `${open} – ${close}` },
  { day: "Sábado", time: "09:00 – 21:00" },
  { day: "Domingo", time: "10:00 – 19:00" },
];
const menu = (m: number) => [
  { item: "Espresso", price: Math.round(2200 * m) },
  { item: "Café con leche", price: Math.round(3200 * m) },
  { item: "Flat white", price: Math.round(3800 * m) },
  { item: "Medialunas (x2)", price: Math.round(2400 * m) },
  { item: "Tostado de jamón y queso", price: Math.round(6500 * m) },
  { item: "Limonada con menta", price: Math.round(4200 * m) },
];
const occ = (a: number, b: number, c: number, d: number) => [
  { franja: "Mañana", valor: a },
  { franja: "Mediodía", valor: b },
  { franja: "Tarde", valor: c },
  { franja: "Noche", valor: d },
];

export const cafes: Cafe[] = [
  { id: "cafe-palermo", name: "Café Palermo", barrio: "Palermo", address: "Honduras 4800", wifi: 45, noise: "Silencioso", price: "$$", plugs: 18, discount: { percent: 10, description: "10% off en toda la carta de lunes a viernes" }, rating: 4.7, occupancy: "medio", openNow: true, photos: photos(0), hours: hours(), menu: menu(1), occupancyByTime: occ(40, 75, 60, 25) },
  { id: "coffee-store-recoleta", name: "The Coffee Store Recoleta", barrio: "Recoleta", address: "Av. Callao 1500", wifi: 30, noise: "Moderado", price: "$$$", plugs: 10, rating: 4.4, occupancy: "alto", openNow: true, photos: photos(1), hours: hours("07:30", "21:00"), menu: menu(1.3), occupancyByTime: occ(70, 90, 80, 40) },
  { id: "lattente", name: "Lattente", barrio: "Villa Crespo", address: "Thames 1891", wifi: 60, noise: "Silencioso", price: "$$", plugs: 22, discount: { percent: 15, description: "15% off en cafés de especialidad" }, rating: 4.9, occupancy: "bajo", openNow: true, photos: photos(2), hours: hours(), menu: menu(1.05), occupancyByTime: occ(30, 55, 45, 15) },
  { id: "birkin", name: "Birkin Coffee", barrio: "Belgrano", address: "Av. Cabildo 2100", wifi: 25, noise: "Animado", price: "$", plugs: 0, rating: 4.1, occupancy: "alto", openNow: false, photos: photos(3), hours: hours("09:00", "19:00"), menu: menu(0.8), occupancyByTime: occ(60, 95, 85, 50) },
  { id: "cuervo", name: "Cuervo Café", barrio: "Colegiales", address: "Federico Lacroze 2650", wifi: 50, noise: "Silencioso", price: "$$", plugs: 15, discount: { percent: 10, description: "10% off + refill de filtrado gratis" }, rating: 4.8, occupancy: "bajo", openNow: true, photos: photos(4), hours: hours(), menu: menu(1), occupancyByTime: occ(35, 60, 50, 20) },
  { id: "origenes", name: "Orígenes", barrio: "San Telmo", address: "Defensa 900", wifi: 35, noise: "Moderado", price: "$", plugs: 8, rating: 4.3, occupancy: "medio", openNow: true, photos: photos(5), hours: hours("08:30", "20:00"), menu: menu(0.85), occupancyByTime: occ(45, 70, 65, 30) },
  { id: "lab", name: "LAB Coffee", barrio: "Palermo", address: "Humboldt 1542", wifi: 80, noise: "Silencioso", price: "$$$", plugs: 30, discount: { percent: 20, description: "20% off en tu primera visita del día" }, rating: 4.9, occupancy: "medio", openNow: true, photos: photos(6), hours: hours("07:00", "21:00"), menu: menu(1.35), occupancyByTime: occ(50, 80, 70, 35) },
  { id: "full-city", name: "Full City Coffee", barrio: "Núñez", address: "Av. del Libertador 7200", wifi: 40, noise: "Moderado", price: "$$", plugs: 12, rating: 4.5, occupancy: "bajo", openNow: false, photos: photos(7), hours: hours(), menu: menu(1.1), occupancyByTime: occ(30, 65, 55, 20) },
  { id: "caballito-roasters", name: "Caballito Roasters", barrio: "Caballito", address: "Av. Rivadavia 5100", wifi: 8, noise: "Animado", price: "$", plugs: 4, rating: 4.0, occupancy: "medio", openNow: true, photos: photos(8), hours: hours(), menu: menu(0.75), occupancyByTime: occ(55, 85, 60, 30) },
];

export const barrios = ["Palermo", "Recoleta", "Belgrano", "San Telmo", "Colegiales", "Núñez", "Villa Crespo", "Caballito"];

export const getCafe = (id: string) => cafes.find((c) => c.id === id);
export const ars = (n: number) => `$${n.toLocaleString("es-AR")}`;
