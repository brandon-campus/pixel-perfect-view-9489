# 📋 Registro de Avance — Jama

> **Propósito de este documento**: Registrar de manera continua cada avance, cambio implementado, decisiones tomadas y tareas pendientes en el proyecto Jama. De esta manera, cualquier agente o desarrollador que retome el proyecto en días o semanas posteriores tendrá contexto inmediato de en qué punto exacto nos quedamos.
>
> ⚠️ **Regla para agentes**: Cada vez que se implemente una nueva funcionalidad, refactor o cambio relevante, **actualizar este archivo** con la fecha, lo realizado y los próximos pasos.

---

## 📌 Datos Clave del Proyecto
- **Producto**: Jama — Plataforma de descubrimiento de cafeterías y coworkings work-friendly en CABA con descuentos vía cupón QR.
- **Stack**:
  - Frontend: React 19, TypeScript estricto, TanStack Start, TanStack Router (file-based), Tailwind CSS v4, Radix UI.
  - Backend / DB: Supabase (PostgreSQL, Supabase Auth, Row Level Security, RPCs de seguridad).
  - Estado Remoto: TanStack Query (React Query).
  - Componentes & Gráficos: Lucide React, Recharts, qrcode.react, Sonner.
- **Documentación de referencia**:
  - PRD completo: [`docs/prd.md`](file:///c:/Users/dell/pixel-perfect-view-9489/docs/prd.md)
  - Resumen de arquitectura: [`docs/jama_architecture_summary.md`](file:///c:/Users/dell/pixel-perfect-view-9489/docs/jama_architecture_summary.md)
  - Plan del Panel Admin: [`docs/admin_panel_implementation_plan.md`](file:///C:/Users/dell/.gemini/antigravity-ide/brain/ef031744-0773-4111-9802-4550226fedd7/admin_panel_implementation_plan.md)
  - Instrucciones de Deploy: [`docs/deploy_instructions.md`](file:///c:/Users/dell/pixel-perfect-view-9489/docs/deploy_instructions.md)

---

## 🚦 Semáforo de Estado General
- **Estado actual**: **Core v1 + Panel de Administración (`/admin`) completados al 100%. Base de datos endurecida con RLS y RPCs. Listo para cierre de detalles editoriales y deploy a producción.**
- **Conexión a Base de Datos**: ✅ Conectada a Supabase (tablas `lugares`, `usuarios`, `lugares_guardados`, `cupones`, `admins` y vista `v_cupones_admin`).
- **Seguridad**: ✅ RLS estricto en todas las tablas, RPC `canjear_cupon` seguro con `SECURITY DEFINER`, función `es_admin()`, y política insegura temporal de update desactivada.
- **Admin**: ✅ Operativo para Will (`laborastartup@gmail.com`).
- **Deploy**: 🟡 Documentado en `docs/deploy_instructions.md`, build de producción probado y pasando (`npm run build`), pendiente publicación en Vercel.

---

## 📅 Bitácora Cronológica de Avances

### [2026-10-31] Webhook del chat solo por variable de entorno + manejo de errores
- [`src/routes/chat.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/chat.tsx): se quitó la URL escrita a mano; ahora se lee únicamente de `VITE_N8N_WEBHOOK_URL` (agregada a `.env` y `.env.example` con `https://laboraacademy.app.n8n.cloud/webhook/jama`).
- La respuesta se lee exclusivamente del campo `output` (`{ "output": "..." }` o `[{ "output": "..." }]`).
- Errores diferenciados en `console.error`: variable faltante, error de red, status no-2xx (con status y cuerpo) y 200 sin `output`. Al usuario siempre se le muestra el mensaje genérico.
- Diagnóstico: el webhook de producción responde **500 `There was a problem executing the workflow`**: falla un nodo dentro del workflow de n8n (no es CORS ni la URL). Revisar en n8n → Executions.
- **Pendiente**: agregar `VITE_N8N_WEBHOOK_URL` en Vercel (Settings → Environment Variables).

### [2026-10-31] Chat `/chat` conectado al agente de n8n vía webhook
- Se eliminó el mock con regex de [`src/routes/chat.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/chat.tsx). Cada mensaje del usuario se envía por `POST` al webhook de n8n y el chat espera la respuesta del mismo webhook (Respond to Webhook) para mostrarla.
- Body enviado: `{ message, sessionId, userId, userName, userEmail }`. El `sessionId` se guarda en `sessionStorage` (sirve como memoria de conversación en n8n).
- Respuesta aceptada: JSON con `output`, `text`, `message`, `respuesta`, `reply` o `response` (también como array de items), o texto plano. Si falla, se muestra un mensaje de error amigable.
- URL configurable con `VITE_N8N_WEBHOOK_URL` (agregada a `.env.example`). Por defecto usa el webhook de **producción** `https://laboraacademy.app.n8n.cloud/webhook/jama` (antes `webhook-test`).
- **Pendiente**: el workflow de n8n debe estar **activo** para que `/webhook/jama` responda. Además, configurar CORS (Allowed Origins) en el nodo Webhook de n8n para el dominio de la app.
- **Pendiente**: el chat ya no muestra tarjetas de cafeterías; si el agente devuelve lugares, hay que definir un formato (p. ej. `cafes: [ids]`) y renderizarlas.

### [2026-10-17] Implementación Completa del Panel de Administración (`/admin`) & Hardening de DB

Se implementó de punta a punta la infraestructura de base de datos y la interfaz del Panel de Administración para operar y medir el negocio:

#### 1. Base de Datos & Seguridad (Supabase `pxvarwsgdvyauxbigsvs`)
- **Tabla de Administradores & Rol**:
  - Migración `create_admins_table_and_es_admin_function`: Creación de `public.admins` referenciando `public.usuarios(id) ON DELETE CASCADE` con RLS habilitado.
  - Función `public.es_admin()` (`SECURITY DEFINER`, `search_path = public`), con permisos revocados a `public` y `anon` y otorgados a `authenticated`.
  - Política `"Admin ve admins"` para usuarios con rol admin.
  - **Registro de Admin**: Se registró a Will (`laborastartup@gmail.com`, ID: `7e498852-536b-4f59-8038-c37dd0a0cc28`) en `public.admins`.
- **Nuevas Columnas e Índices**:
  - Migración `add_admin_columns_and_indexes`:
    - En `cupones`: `monto_compra numeric(12,2)` (check `>= 0`), `origen text` (check `in ('app','agente')`), `fecha_vencimiento timestamptz` (retrocompletada con `fecha_generacion + interval '24 hours'` y default a `now() + interval '24 hours'`).
    - En `lugares`: `comision_pct numeric(5,2)` (check 0 a 100), `activo boolean default true`, `ultima_verificacion timestamptz`.
    - Índices: `idx_cupones_lugar_id`, `idx_cupones_usuario_id`, `idx_cupones_estado`, `idx_lugares_guardados_lugar_id`.
- **Políticas RLS de Administración**:
  - Migración `admin_rls_policies`:
    - SELECT total para admin en `cupones`, `usuarios` y `lugares_guardados`.
    - SELECT, INSERT y UPDATE en `lugares` para admin (sin DELETE físico; bajas lógicas con `activo = false`).
    - Actualización de la política pública de `lugares` para mostrar exclusivamente locales con `activo = true`.
- **Endurecimiento de Cupones**:
  - Migración `harden_cupones_insert_policy`: Restricción estricta en el `INSERT` de cupones:
    `with check (auth.uid() = usuario_id and estado = 'generado' and monto_compra is null and fecha_uso is null)`.
  - Migración `disable_temp_update_policy`: Cierre de la política temporal de UPDATE en `cupones` (`qual: false, with_check: false`), eliminando mutaciones directas fuera del RPC.
- **Canje Controlado & Vista de Reportes**:
  - Migración `create_canjear_cupon_and_v_cupones_admin`:
    - Función RPC `public.canjear_cupon(p_codigo text, p_monto numeric)`: valida permisos admin (`es_admin()`), monto válido, bloqueo de fila `FOR UPDATE`, rechazo de cupones ya usados o vencidos, y actualización atómica de `estado = 'usado'`, `fecha_uso = now()`, `monto_compra = p_monto`.
    - Vista `public.v_cupones_admin` (`security_invoker = true`): Une cupones con lugares y usuarios, calculando `estado_efectivo` ('vencido' si expiró) y `comision` (`round(coalesce(monto_compra,0) * comision_pct / 100, 2)`). Permisos revocados a `anon`.
- **Hardening de Triggers**:
  - Migración `harden_handle_new_user`: Función trigger con `search_path = public` y permisos revocados a `public`, `anon` y `authenticated`.
- **Sincronización de Tipos TypeScript**:
  - Generación de tipos actualizados y guardado en [`src/types/database.types.ts`](file:///c:/Users/dell/pixel-perfect-view-9489/src/types/database.types.ts).
  - Tipado del cliente Supabase en [`src/lib/supabase.ts`](file:///c:/Users/dell/pixel-perfect-view-9489/src/lib/supabase.ts) con `createClient<Database>`.

#### 2. Interfaz & Experiencia de Usuario (`/admin`)
- **Autenticación & Enrutamiento**:
  - Detección de rol admin en [`src/lib/auth.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/lib/auth.tsx) via `supabase.rpc('es_admin')` exponiendo `isAdmin` en `useAuth()`.
  - Enlace condicional "Admin" en [`src/components/jama/Nav.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/components/jama/Nav.tsx) visible solo si `isAdmin === true`.
  - Layout [`src/components/admin/AdminLayout.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/components/admin/AdminLayout.tsx) con guard de navegación (redirección a `/` con toast si no es admin), sidebar desktop y menú móvil colapsable con estética cálida (crema, espresso, verde bosque, terracota).
- **Las 5 Secciones del Panel**:
  1. **Resumen** ([`AdminResumen.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/components/admin/AdminResumen.tsx) / [`/admin/`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/admin.index.tsx)):
     - KPIs: cupones generados, canjeados, vencidos, tasa de canje %, usuarios registrados, cafeterías activas y comisiones acumuladas.
     - Selector de rango de días (7, 30, 90 días).
     - Gráfico de líneas Recharts interactivo (generados vs. usados por día).
     - Ranking de top cafeterías por cupones usados.
     - Tarjeta "Por vencer" con cupones próximos a expirar en las siguientes 24 horas.
  2. **Cupones** ([`AdminCupones.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/components/admin/AdminCupones.tsx) / [`/admin/cupones`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/admin.cupones.tsx)):
     - Tabla conectada a `v_cupones_admin`.
     - Filtros por estado efectivo, cafetería, origen (app/agente), rango de fechas y buscador por código.
     - Botón y Modal de Canje rápido con validación de monto de compra llamando al RPC `canjear_cupon`.
     - Exportación completa de datos a archivo CSV.
  3. **Lugares** ([`AdminLugares.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/components/admin/AdminLugares.tsx) / [`/admin/lugares`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/admin.lugares.tsx)):
     - Catálogo de locales con información de comisión %, WiFi score y última verificación.
     - Toggle de activación/desactivación en un clic (bajas lógicas con `activo = false`).
     - Botón de verificación rápida con fecha de hoy.
     - Chips de calidad de datos en cabecera: *Sin fotos*, *Campos incompletos*, *Sin verificar > 60 días*.
     - Modal de alta y edición completa de datos (nombre, fotos multilínea, horarios, carta, precios, reseña curada).
  4. **Comisiones** ([`AdminComisiones.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/components/admin/AdminComisiones.tsx) / [`/admin/comisiones`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/admin.comisiones.tsx)):
     - Selector dinámico de los últimos 12 meses.
     - Tabla agrupada por cafetería: cupones usados, facturación ticket total, comisión % y comisión a liquidar.
     - Alerta visual en cupones usados sin monto registrado.
     - Totales generales acumulados al pie.
     - Botón de exportación de liquidación mensual a CSV.
  5. **Usuarios** ([`AdminUsuarios.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/components/admin/AdminUsuarios.tsx) / [`/admin/usuarios`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/admin.usuarios.tsx)):
     - Vista de solo lectura de workers registrados con fecha de alta, métricas de cupones generados/usados y favoritos guardados.
     - Buscador por nombre/email y modal con historial individual de cupones por usuario.

#### 3. Refactor y Seguridad en Rutas Existentes
- [`src/routes/panel.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/panel.tsx): Migración del canje al RPC `supabase.rpc('canjear_cupon')` y banner indicando que el canje requiere permisos de administrador.
- [`src/routes/mi-qr.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/mi-qr.tsx): Eliminada la mutación directa en base de datos `.update({ estado: 'vencido' })`; cálculo en memoria vía `estadoEfectivo`.
- Corrección de tipado estricto en [`src/data/cafes.ts`](file:///c:/Users/dell/pixel-perfect-view-9489/src/data/cafes.ts), [`src/routes/buscar.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/buscar.tsx), [`src/routes/cafeteria.$id.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/cafeteria.$id.tsx), [`src/routes/chat.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/chat.tsx), [`src/routes/favoritos.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/favoritos.tsx) e [`src/routes/index.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/index.tsx).

#### 4. Batería de Pruebas y Verificaciones Aprobadas
- `anon` ve 0 cupones y 0 usuarios en consultas directas.
- Usuario no-admin solo ve sus propios cupones (`cupones_ajenos: 0`).
- Cualquier intento de `UPDATE` directo sobre `cupones` es rechazado por RLS.
- Invocar `canjear_cupon` sin rol admin arroja error Postgres `42501 (No autorizado)`.
- Invocar `canjear_cupon` sobre cupón usado arroja excepción *"El cupón ya fue usado"*.
- Invocar `canjear_cupon` sobre cupón vencido arroja excepción *"El cupón está vencido"*.
- Canje exitoso como admin completado sobre `JAMA-DMNEF3` dejando monto y timestamp de uso.
- Typecheck (`npx tsc --noEmit`) con **0 errores**.
- Build de producción (`npm run build`) completado exitosamente en 1.89s.

---

### [2026-10-17] Diagnóstico Inicial del Proyecto & Establecimiento de Tracking
- Comparación del estado del código contra el [PRD v1](file:///c:/Users/dell/pixel-perfect-view-9489/docs/prd.md).
- Detección de rutas conectadas a Supabase y cabos sueltos iniciales.
- Creación de este documento centralizado [`docs/avance.md`](file:///c:/Users/dell/pixel-perfect-view-9489/docs/avance.md) y registro de regla de actualización en [`AGENTS.md`](file:///c:/Users/dell/pixel-perfect-view-9489/AGENTS.md).

---

### [Avance Previo] Integración con Supabase y Persistencia Real (Hito MVP)
- Definición de tablas en [`supabase/schema.sql`](file:///c:/Users/dell/pixel-perfect-view-9489/supabase/schema.sql) y datos iniciales en [`supabase/seed.sql`](file:///c:/Users/dell/pixel-perfect-view-9489/supabase/seed.sql).
- Autenticación con Supabase Auth en [`src/routes/auth.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/auth.tsx).
- Motor de cupones QR en [`src/routes/mi-qr.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/mi-qr.tsx) y panel en [`src/routes/panel.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/panel.tsx).
- Hook de favoritos [`src/lib/useFavorites.ts`](file:///c:/Users/dell/pixel-perfect-view-9489/src/lib/useFavorites.ts) y vista [`src/routes/favoritos.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/favoritos.tsx).
- Conexión de búsqueda en [`src/routes/buscar.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/buscar.tsx) e inicio en [`src/routes/index.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/index.tsx).

---

## 🧩 Estado Actual Módulo por Módulo

| Módulo | Archivos Involucrados | Estado | Notas / Pendientes |
|---|---|:---:|---|
| **Landing (`/`)** | [`src/routes/index.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/index.tsx) | ✅ Listo | Muestra las cafeterías destacadas leídas de DB. |
| **Explorador (`/buscar`)** | [`src/routes/buscar.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/buscar.tsx) | 🟡 Funcional | Filtros operativos con datos de DB. Falta mapa interactivo si se requiere para v1. |
| **Detalle (`/cafeteria/$id`)** | [`src/routes/cafeteria.$id.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/cafeteria.$id.tsx) | 🟡 Funcional | Datos de DB cargados. Falta renderizar `resena_curada`. |
| **Favoritos (`/favoritos`)** | [`src/routes/favoritos.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/favoritos.tsx), [`src/lib/useFavorites.ts`](file:///c:/Users/dell/pixel-perfect-view-9489/src/lib/useFavorites.ts) | ✅ Listo | Persistencia 100% en Supabase con optimismo de UI. |
| **Generación QR (`/mi-qr`)** | [`src/routes/mi-qr.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/mi-qr.tsx) | ✅ Listo | Genera y muestra QR con código único y cálculo de expiración en memoria. |
| **Canje en Comercio (`/panel`)** | [`src/routes/panel.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/panel.tsx) | ✅ Listo | Valida y canjea cupones con RPC `canjear_cupon`. |
| **Panel Admin (`/admin`)** | [`src/routes/admin.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/admin.tsx), [`src/components/admin/`](file:///c:/Users/dell/pixel-perfect-view-9489/src/components/admin/) | ✅ 100% Listo | 5 vistas completas (Resumen, Cupones, Lugares, Comisiones, Usuarios) con RLS y RPC. |
| **Autenticación (`/auth`)** | [`src/routes/auth.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/auth.tsx), [`src/lib/auth.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/lib/auth.tsx) | ✅ Listo | Login, registro, sesión persistente y rol admin (`es_admin`). |
| **Chat Asistente (`/chat`)** | [`src/routes/chat.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/chat.tsx) | 🟡 Conectado a n8n | POST al webhook de n8n y espera la respuesta. Falta pasar a URL de producción, CORS y render de tarjetas de lugares. |

---

## 📋 Pendientes Manuales Externos (No ejecutables por MCP)

1. **Supabase Auth (Dashboard)**:
   - Entrar al [Dashboard de Supabase](https://supabase.com/dashboard/project/pxvarwsgdvyauxbigsvs) → **Authentication** → **Protection** y activar la opción **"Leaked password protection"** (valida contraseñas comprometidas con HaveIBeenPwned).
2. **Workflow de n8n**:
   - En el nodo *"Create a row in Supabase"*, agregar el campo `origen` con el valor fijo `'agente'` para que los cupones derivados por IA se diferencien de los emitidos en la app web.
3. *(Opcional)* En el editor SQL del dashboard de Supabase, puedes ejecutar `DROP POLICY IF EXISTS "Permitir update de estado (temporal)" ON public.cupones;` si prefieres remover el nombre del listado de políticas (actualmente ya se encuentra 100% inactiva con `qual: false, with_check: false`).

---

## 🎯 Próximos Pasos Inmediatos (Next Steps)

1. **Mostrar `resena_curada` en [`cafeteria.$id.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/cafeteria.$id.tsx)**: Añadir sección destacada tipo editorial ("Reseña del equipo Jama") en la ficha del lugar.
2. **Conectar [`src/routes/chat.tsx`](file:///c:/Users/dell/pixel-perfect-view-9489/src/routes/chat.tsx) a Supabase**: Hacer que el asistente recomiende lugares basándose en la tabla `lugares`.
3. **Commit de Cambios**: Hacer commit de toda la integración en Git manteniendo la compatibilidad con Lovable.
4. **Deploy a Vercel**: Seguir la guía [`docs/deploy_instructions.md`](file:///c:/Users/dell/pixel-perfect-view-9489/docs/deploy_instructions.md) y configurar variables en el dashboard de Vercel.
5. **Backlog Futuro (V2 / Opcionales)**:
   - Mapa interactivo en `/buscar` (Leaflet / MapLibre).
   - Servidor MCP personalizado (diseñado en el plan de implementación de MCP).
   - Panel de autogestión para comercios.
