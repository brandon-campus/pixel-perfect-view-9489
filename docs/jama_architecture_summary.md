# Jama - Resumen del Proyecto y Arquitectura (MVP)

Este documento describe la arquitectura, la base de datos, el flujo de la aplicación y el estado actual de desarrollo del MVP de **Jama** (aplicación para encontrar cafeterías work-friendly).

## 1. Stack Tecnológico
- **Frontend**: React 19 + TypeScript.
- **Framework & Enrutamiento**: TanStack Start + TanStack Router (File-based routing).
- **Estilos**: Tailwind CSS 4 + Componentes Radix UI.
- **Base de Datos & Auth**: Supabase (PostgreSQL, Row Level Security, Supabase Auth).
- **Manejo de Estado Remoto**: TanStack Query (React Query) para caché y sincronización.
- **Iconos**: Lucide React.
- **Gráficos**: Recharts.

---

## 2. Esquema de Base de Datos (Supabase)

La base de datos PostgreSQL en Supabase consta de las siguientes tablas, protegidas por políticas RLS (Row Level Security):

1. **`lugares`**: Almacena las cafeterías (nombre, dirección, wifi, enchufes, ruido, etc).
2. **`usuarios`**: Sincronizada automáticamente (mediante un trigger) cada vez que un usuario se registra en `auth.users`. Guarda datos básicos (nombre, email).
3. **`lugares_guardados`**: Tabla intermedia que maneja la relación N:M entre `usuarios` y `lugares` para la funcionalidad de Favoritos.
4. **`cupones`**: Motor central del negocio. Relaciona un usuario con un lugar y genera un código único. Rastrea el `estado` del cupón (`generado`, `usado`, `vencido`).

---

## 3. Vistas y Flujos de Usuario

### 3.1. Exploración y Búsqueda
- **Rutas**: `/` (Inicio) y `/buscar` (Explorador).
- **Descripción**: El usuario puede ver las cafeterías recomendadas o filtrar la lista completa en tiempo real. 
- **Filtros implementados**: Barrio, nivel de ruido, velocidad WiFi, precio, enchufes y disponibilidad (abierto ahora).
- **Datos**: Los datos se cargan desde la tabla `lugares` de Supabase mediante consultas al montar el componente.

### 3.2. Detalle de la Cafetería
- **Ruta**: `/cafeteria/$id`
- **Descripción**: Muestra la información en profundidad del local (mapa, menú, gráfica de ocupación, fotos y horarios).
- **Interacción**: Desde aquí, si la cafetería ofrece descuento, el usuario puede generar su código QR.

### 3.3. Funcionalidad de Favoritos (React Query)
- **Ruta**: `/favoritos`
- **Descripción**: Los usuarios logueados pueden tocar el icono del "Corazón" en cualquier tarjeta para guardarla. El estado se gestiona eficientemente mediante un hook global (`useFavorites`) que se sincroniza con `lugares_guardados` en Supabase y actualiza la UI instantáneamente usando la caché de TanStack Query.

### 3.4. Motor de Cupones (El modelo de negocio)
- **Ruta Generación**: `/mi-qr`
- **Descripción**: Cuando un usuario (logueado) quiere aplicar un descuento, se inserta un registro en la tabla `cupones`. Se genera un código alfanumérico único (ej: `JAMA-X8F2B1`). La vista renderiza el código como un **QR dinámico**. El cupón dura 24 horas y, si existe uno activo, se reutiliza.
- **Ruta Canje (Panel Comercial)**: `/panel`
- **Descripción**: El comercio tiene un Dashboard. En la pestaña "Escanear QR", ingresan el código del usuario. La aplicación consulta a Supabase. Si el cupón es válido, permite registrar el monto de la compra y actualizar el estado a `usado`, cerrando el ciclo.

### 3.5. Autenticación y Perfil
- **Ruta**: `/auth`
- **Descripción**: Registro y Log in clásico (Email + Contraseña) y preparado para Google OAuth a través de Supabase Auth. Un Context Global (`useAuth`) envuelve la aplicación, manteniendo escuchas en tiempo real sobre los cambios de sesión.

---

## 4. Estructura de Directorios Clave

```
📁 src/
 ├── 📁 components/jama/  # Componentes reutilizables (CafeCard, Nav, RequireAuth)
 ├── 📁 data/             # Tipos y datos mockeados originales
 ├── 📁 lib/              # Lógica core
 │    ├── auth.tsx        # Contexto de Autenticación
 │    ├── supabase.ts     # Cliente de Supabase
 │    └── useFavorites.ts # Hook global de gestión de favoritos (TanStack Query)
 ├── 📁 routes/           # File-based routing (Vistas de la aplicación)
 │    ├── __root.tsx      # Layout base y proveedores globales
 │    ├── index.tsx       # Landing / Home
 │    ├── buscar.tsx      # Explorador / Filtros
 │    ├── cafeteria.$id.tsx # Perfil de cafetería
 │    ├── mi-qr.tsx       # Generador de cupones para el usuario
 │    ├── panel.tsx       # Dashboard para el admin/comercio
 │    ├── favoritos.tsx   # Lista de guardados
 │    └── auth.tsx        # Login / Perfil
 └── router.tsx           # Configuración del TanStack Router
```

---

## 5. Estado Actual (MVP Finalizado)
El MVP se ha implementado con un 100% de la funcionalidad core estipulada en el PRD:
1. **Conectado a DB**: La aplicación ya no usa mocks, todos los lugares, cupones y favoritos persisten en Supabase.
2. **UI/UX Pulida**: Se incluyeron validaciones de carga (spinners/loaders), notificaciones (Toasts con Sonner) y diseño responsivo móvil/escritorio fiel al prototipo.
3. **TypeScript**: 100% estricto sin errores (se solucionaron inconvenientes de Index Signatures en Vite y Auth).
4. **Deploy Ready**: Se redactó el documento `deploy_instructions.md` detallando el paso a paso para publicarlo en Vercel.

**Próximos Pasos (Versión 2.0)**:
- Habilitar permisos comerciales para que los dueños autogestionen el perfil de su local y menús.
- Sistema de reseñas y ratings reales por parte de los usuarios.
- Implementación de webhooks para enviar mails de alerta cuando se canjee un cupón.
