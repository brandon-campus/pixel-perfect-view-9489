# PRD — Jama

## 1. Problema y Usuario Objetivo

- **Problema**: quienes trabajan en homeoffice (freelancers, emprendedores, remoto) pierden productividad en su casa por exceso de comodidad. Salir a trabajar a una cafetería o coworking les funciona, pero no arriesgan a probar lugares nuevos porque no saben de antemano si tienen buen wifi, cuáles son los precios, qué hay en la carta o si el ambiente es propicio para trabajar. Esa falta de información los frena y terminan sin cambiar de rutina.
- **Usuario objetivo**: freelancer, emprendedor o trabajador remoto en Ciudad Autónoma de Buenos Aires (CABA), entre 25 y 45 años, que ya probó trabajar desde afuera de su casa y sabe que le funciona, pero conoce pocos lugares y quiere decidir con información antes de ir.
- **Por qué ahora**: el modelo de negocio (comisión por cliente derivado vía cupón) está validado como formato de mercado por referencias como Morfy, que aplica el mismo esquema para el rubro gastronómico. Nadie está resolviendo específicamente el descubrimiento de espacios para trabajar con esa lente. Ya existe un prototipo visual navegable construido en Lovable y migrado a Antigravity, con diseño estilo Airbnb aplicado, listo para pasar a validación con usuarios reales y luego a desarrollo funcional.

---

## 2. Funcionalidades

### Core (v1)
- Explorador de lugares (mapa + lista) en CABA, con buscador y filtros por barrio, precio y calidad de wifi.
- Ficha de detalle por lugar: fotos, wifi, precios, carta, ambiente, horarios, reseña curada por el equipo de Jama (no reseñas abiertas de usuarios).
- Generación de cupón/QR de descuento por lugar, canjeable en el local.
- Guardado de lugares favoritos.
- Perfil básico de usuario.
- Dashboard de admin: ver qué cupones se generaron y cuáles se usaron.

### Futuras (v2+)
- Panel de carga y gestión de lugares (para no cargar contenido a mano).
- Onboarding de comercios como partners, con métricas de derivación propias.
- Reserva de mesa o espacio.
- Visualización de ocupación en tiempo real.
- Funcionalidades de comunidad/networking entre usuarios que trabajan en el mismo lugar.
- Expansión geográfica fuera de CABA.

---

## 3. Flujos de Usuario Principales

### Flujo: Descubrir y guardar un lugar
1. Usuario abre Jama y llega a Explorar (mapa + lista de lugares en CABA).
2. Usuario filtra por barrio, precio o calidad de wifi, o busca directamente.
3. Sistema muestra los lugares que matchean los filtros, con su badge de Wifi Score.
4. Usuario entra al detalle de un lugar y revisa fotos, precios, carta y ambiente.
5. Usuario guarda el lugar como favorito para volver a encontrarlo fácil.

### Flujo: Canjear un cupón de descuento
1. Usuario entra al detalle de un lugar que le interesa.
2. Usuario toca "Ver cupón de descuento".
3. Sistema genera un código QR y un código alfanumérico de respaldo.
4. Usuario va físicamente al lugar y muestra el cupón en la caja.
5. Sistema marca el cupón como usado.
6. Sistema registra la comisión correspondiente a favor de Jama.

### Flujo: Admin revisa cupones (dashboard)
1. Admin (Brandon) entra al dashboard de administración.
2. Sistema muestra el listado de cupones generados, con su estado (generado / usado / vencido) y el lugar asociado.
3. Admin filtra por lugar o por rango de fechas para ver el desempeño de cada comercio.

---

## 4. Modelo de Datos

- Tabla `lugares`: id, nombre, tipo (cafetería / coworking), barrio, dirección, fotos, rango de precios, wifi_score (1-10), tiene_enchufes (bool), nivel_ruido, horarios, carta/productos destacados, reseña curada.
- Tabla `usuarios`: id, nombre, email, lugares_guardados (relación con `lugares`), fecha de alta.
- Tabla `cupones`: id, lugar_id (FK a `lugares`), usuario_id (FK a `usuarios`, opcional si no hay registro obligatorio), código, descuento aplicable, estado (generado / usado / vencido), fecha_generación, fecha_uso.
- Tabla `comercios` *(v2, cuando exista el dashboard de partners)*: id, lugar_id (FK a `lugares`), datos de contacto, comisión pactada, métricas de derivación.
- **Relaciones**: un `lugar` tiene muchos `cupones`; un `usuario` puede guardar muchos `lugares` y generar muchos `cupones`; en v2, un `comercio` se vincula 1 a 1 con su `lugar` correspondiente.

---

## 5. Stack Técnico

- Base de datos / auth: Supabase.
- Automatizaciones: n8n — no aplica todavía en v1 (no hay flujos automatizados definidos); evaluar en v2 para notificaciones a comercios cuando se canjea un cupón.
- Deploy: Vercel.
- Control de versiones: GitHub.
- Frontend actual: prototipo generado en Lovable y migrado a Antigravity, solo con datos mock — falta conectar a Supabase para que el modelo de datos de arriba sea real.