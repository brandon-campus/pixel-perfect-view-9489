# Instrucciones de Deploy a Vercel

Sigue estos pasos para publicar Jama en producción usando Vercel:

## 1. Preparar el Repositorio de GitHub
1. Si aún no lo has hecho, sube este código a un repositorio de GitHub.
   ```bash
   git add .
   git commit -m "Completado MVP de Jama"
   git push origin main
   ```

## 2. Crear el Proyecto en Vercel
1. Entra a [Vercel](https://vercel.com/) e inicia sesión (recomendable con tu cuenta de GitHub).
2. Haz clic en el botón negro **"Add New..."** y selecciona **"Project"**.
3. Busca el repositorio de GitHub donde subiste Jama y haz clic en **"Import"**.
4. En el campo "Framework Preset", Vercel debería detectar automáticamente que estás usando un framework (Vite/TanStack Start). Puedes dejarlo en **Vite** si es lo que sugiere, o de lo contrario elegir Vite.

## 3. Configurar Variables de Entorno (Importante)
Antes de hacer clic en Deploy, debes configurar las variables de entorno para que Vercel pueda comunicarse con tu base de datos de Supabase.

1. En la misma pantalla de configuración del proyecto en Vercel, busca la sección **"Environment Variables"**.
2. Añade las dos variables que tienes en tu archivo `.env`:
   - Name: `VITE_SUPABASE_URL` | Value: `https://pxvarwsgdvyauxbigsvs.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY` | Value: `(tu_anon_key_aquí)`
3. Haz clic en **"Add"** por cada una.

## 4. Despliegue Final
1. Haz clic en el botón azul **"Deploy"**.
2. Vercel comenzará a construir tu aplicación (ejecutando `npm run build`). Esto puede tardar uno o dos minutos.
3. Una vez finalizado, verás una pantalla de éxito con fuegos artificiales.
4. Vercel te proporcionará un dominio público (ej. `jama-app.vercel.app`) donde podrás ver tu aplicación en vivo.

## Notas Adicionales
- **RLS y Políticas de Supabase**: Como estamos en producción, verifica en Supabase (Sección Authentication -> Policies) que las reglas de seguridad permiten lectura a tus tablas (`lugares`, `cupones`, `lugares_guardados`). Ya lo hemos configurado antes, pero es una buena práctica.
- Cada vez que hagas un nuevo commit y push a tu rama `main` en GitHub, Vercel automáticamente hará un nuevo deploy y actualizará tu web en vivo.
