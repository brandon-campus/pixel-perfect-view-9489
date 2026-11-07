import { createClient } from "@supabase/supabase-js";
import { cafes } from "../src/data/cafes.js";
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Iniciando migración de datos...");
  for (const cafe of cafes) {
    const { data, error } = await supabase.from('lugares').insert({
      // Usar el 'id' actual del mock si queremos mantenerlo, pero en supabase es UUID. 
      // Mejor dejamos que Supabase genere el UUID, y solo insertamos los campos.
      // O podemos modificar el schema para que el ID sea TEXT.
      // En nuestro schema, id es UUID DEFAULT uuid_generate_v4().
      // Así que omitimos el id de cafes.
      nombre: cafe.name,
      tipo: "cafetería", // hardcoded ya que todos son cafes en el mock
      barrio: cafe.barrio,
      direccion: cafe.address,
      fotos: cafe.photos,
      rango_precios: cafe.price,
      // Mapeamos el wifi de Mbps (0-100 en el mock) a wifi_score (1-10)
      wifi_score: Math.min(10, Math.max(1, Math.round(cafe.wifi / 10))),
      tiene_enchufes: cafe.plugs > 0,
      nivel_ruido: cafe.noise,
      horarios: JSON.stringify(cafe.hours),
      productos_destacados: JSON.stringify(cafe.menu)
    }).select();

    if (error) {
      console.error(`Error insertando ${cafe.name}:`, error.message);
    } else {
      console.log(`Insertado: ${cafe.name} (${data[0].id})`);
    }
  }
  console.log("Migración terminada.");
}

main();
