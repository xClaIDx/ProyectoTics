# CasaScore Web (AlquilaPuno)

Marketplace de cuartos en alquiler para la ciudad de Puno. Cada cuarto recibe un **CASA SCORE de 0 a 100** según las prioridades del arrendatario y la distancia a su punto de referencia, con el desglose de cada punto.

## Requisitos

- **Node.js 20 o superior** y **npm**. Verifica con `node -v` y `npm -v`.
- **PostgreSQL 14 o superior** encendido en este equipo. En macOS con Homebrew: `brew services start postgresql@18`.
- Un navegador actual (Chrome, Edge, Firefox o Safari).
- Todo corre en local: las fotos de ejemplo están en `public/ejemplos`. Solo el mapa de OpenStreetMap necesita internet.

## Cómo ejecutarla

```bash
cd src/web
npm install       # solo la primera vez
npm run db:init   # crea la base "casascore", sus tablas y los datos de ejemplo
npm run dev       # API en http://localhost:3001 y web en http://localhost:5173
```

`npm run db:init` borra y vuelve a crear las tablas, así que también sirve para restablecer los datos. Por defecto usa `postgresql://localhost:5432/casascore` con tu usuario del sistema; para cambiarlo, copia `.env.example` como `.env`.

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm test` | Pruebas del motor CASA SCORE y del motor de distancia (Vitest). |
| `npm run api` | Solo la API (se reinicia al guardar cambios). |
| `npm run web` | Solo la web. |
| `npm run build` | Revisa los tipos de la web y la API, y genera la web en `dist/`. |

## API local

| Ruta | Qué hace |
|---|---|
| `GET /api/salud` | Revisa la conexión con PostgreSQL. |
| `GET /api/cuartos` · `GET /api/cuartos/:id` | Cuartos activos (y los ocultos del propietario que ingresó). |
| `POST /api/cuartos` · `PUT /api/cuartos/:id` | Publicar o editar (solo propietarios). Las fotos se guardan en `server/uploads/`. |
| `GET /api/ranking?lat=&lng=&precio=&cercania=&seguridad=&servicios=&bano=` | Ranking calculado por el motor CASA SCORE en el servidor. |
| `GET /api/cuartos/:id/puntaje?lat=&lng=...` | Desglose del puntaje de un cuarto. |
| `POST /api/registro` · `POST /api/sesion` · `DELETE /api/sesion` · `GET /api/me` | Cuentas y sesión. |
| `PUT /api/preferencias` · `PUT /api/favoritos` | Prioridades, punto de referencia y favoritos de la cuenta. |
| `POST /api/reiniciar` | Restablece los datos de ejemplo. |

Ejemplo: `curl "http://localhost:3001/api/ranking?lat=-15.8246&lng=-70.0163"` ordena los cuartos desde la UNA Puno.

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Arrendatario | demo@casascore.pe | demo123 |
| Propietario | propietario@casascore.pe | demo123 |

## Funciones

- Ranking de cuartos ordenado por CASA SCORE, precio, distancia o fecha; vista en cuadrícula o en lista.
- Punto de referencia: lugares de Puno o cualquier punto marcado en el mapa.
- Prioridades de 0 a 5 para precio, cercanía, seguridad, servicios y baño, con perfiles rápidos.
- Filtros por precio máximo, baño privado, internet, hora de llegada, visitas y cocina.
- Detalle con 4 fotos, desglose del puntaje, bonificaciones, penalizaciones, mapa y contacto por WhatsApp.
- Publicación en 5 pasos con borrador automático, fotos comprimidas y vista previa del puntaje.
- Registro por rol, favoritos, mis cuartos (editar u ocultar) y restablecimiento de datos de prueba.

## Datos

Los datos viven en PostgreSQL local (`server/schema.sql`): usuarios, sesiones, prioridades, favoritos, cuartos, servicios, condiciones y fotos, con 12 cuartos de ejemplo. Las contraseñas se guardan con scrypt. El motor CASA SCORE (`src/lib/scoring.ts` y `src/lib/geo.ts`) es el mismo en la web y en la API. El archivo `supabase/schema.sql` queda como referencia para la versión en la nube.

## Estructura

```
server/
  index.ts           API Express (rutas)
  cuartos.ts         lectura y guardado de cuartos y fotos, contraseñas
  schema.sql         tablas de PostgreSQL
  sembrar.ts         datos de ejemplo · init-db.ts crea la base
public/ejemplos/     fotos de ejemplo
src/
  lib/scoring.ts     motor CASA SCORE (y scoring.test.ts)
  lib/geo.ts         distancia (Haversine) y tiempo a pie
  data/seed.ts       cuartos, usuarios y puntos de ejemplo
  data/repo.ts       cliente de la API
  state/             estado global (usuario, prioridades, punto, favoritos)
  components/        cabecera, tarjetas, mapa, modales
  pages/             inicio, detalle, publicar, ingresar, perfil
```
