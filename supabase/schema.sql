-- Habilitar la extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Lugares (Cafeterías / Coworkings)
CREATE TABLE lugares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'cafetería' o 'coworking'
  barrio TEXT NOT NULL,
  direccion TEXT NOT NULL,
  fotos TEXT[] DEFAULT '{}',
  rango_precios TEXT,
  wifi_score INTEGER CHECK (wifi_score >= 1 AND wifi_score <= 10),
  tiene_enchufes BOOLEAN DEFAULT FALSE,
  nivel_ruido TEXT,
  horarios TEXT,
  productos_destacados TEXT,
  resena_curada TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Usuarios
-- Extendemos la tabla auth.users que viene por defecto en Supabase
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  fecha_alta TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar un trigger para crear automáticamente un registro en public.usuarios
-- cuando un usuario se registra en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Tabla de Lugares Guardados (Favoritos)
CREATE TABLE lugares_guardados (
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  lugar_id UUID REFERENCES public.lugares(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (usuario_id, lugar_id)
);

-- 4. Tabla de Cupones
CREATE TABLE cupones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lugar_id UUID REFERENCES public.lugares(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL UNIQUE,
  descuento_aplicable TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'generado', -- 'generado', 'usado', 'vencido'
  fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_uso TIMESTAMP WITH TIME ZONE
);

-- === POLÍTICAS DE SEGURIDAD (RLS) ===
-- Habilitar RLS en todas las tablas
ALTER TABLE lugares ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE lugares_guardados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;

-- Lugares: todos pueden ver, solo admin puede modificar (por ahora dejamos admin sin definir, lectura pública)
CREATE POLICY "Lugares son visibles para todos" ON lugares FOR SELECT USING (true);

-- Usuarios: los usuarios solo pueden ver y editar su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden editar su propio perfil" ON usuarios FOR UPDATE USING (auth.uid() = id);

-- Lugares guardados: los usuarios solo ven y modifican sus propios favoritos
CREATE POLICY "Usuarios pueden ver sus favoritos" ON lugares_guardados FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden insertar sus favoritos" ON lugares_guardados FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden eliminar sus favoritos" ON lugares_guardados FOR DELETE USING (auth.uid() = usuario_id);

-- Cupones: los usuarios pueden ver y generar sus propios cupones
CREATE POLICY "Usuarios pueden ver sus cupones" ON cupones FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden generar cupones" ON cupones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
-- (Para v2: el admin/comercio podrá marcarlos como usados, temporalmente permitiremos actualización general para desarrollo o limitaremos a auth logic)
CREATE POLICY "Permitir update de estado (temporal)" ON cupones FOR UPDATE USING (true);
