import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import type { PoolClient } from 'pg';
import type { CaracteristicaSeguridad, Cuarto, Fotos } from '../src/types';

const scrypt = promisify(scryptCb) as (p: string, s: string, n: number) => Promise<Buffer>;

export const UPLOADS_DIR = path.join(import.meta.dirname, 'uploads');
const TIPOS_FOTO: (keyof Fotos)[] = ['fachada', 'habitacion', 'bano', 'ventana'];
const TIPOS_SEG: CaracteristicaSeguridad[] = ['porton', 'rejas', 'iluminacion', 'camara'];

// ---- Contraseñas (scrypt con sal aleatoria)
export async function hashPassword(password: string): Promise<string> {
  const sal = randomBytes(16).toString('hex');
  return `${sal}:${(await scrypt(password, sal, 32)).toString('hex')}`;
}
export async function verificarPassword(password: string, guardado: string): Promise<boolean> {
  const [sal, hash] = guardado.split(':');
  if (!sal || !hash) return false;
  const calc = await scrypt(password, sal, 32);
  return timingSafeEqual(calc, Buffer.from(hash, 'hex'));
}

// ---- Lectura
export const SELECT_CUARTO = `
  select c.*, s.agua_24h, s.luz_24h, s.internet_24h,
         k.entrada_libre_24h, k.hora_llegada, k.visitas, k.cocina, k.mascotas, k.declaradas,
         coalesce((select json_object_agg(f.tipo, f.url) from foto f where f.cuarto_id = c.id), '{}') as fotos
  from cuarto c
  left join servicios s on s.cuarto_id = c.id
  left join condiciones k on k.cuarto_id = c.id`;

export function filaACuarto(r: any): Cuarto {
  const f: Record<string, string> = r.fotos ?? {};
  return {
    id: r.id,
    propietarioId: r.propietario_id,
    titulo: r.titulo,
    descripcion: r.descripcion,
    precio: Number(r.precio),
    areaM2: Number(r.area_m2),
    banoPrivado: r.bano_privado,
    luzNatural: r.luz_natural,
    direccion: r.direccion,
    zona: r.zona,
    lat: r.latitud,
    lng: r.longitud,
    servicios: { agua: !!r.agua_24h, luz: !!r.luz_24h, internet: !!r.internet_24h },
    seguridad: Object.fromEntries(TIPOS_SEG.filter((t) => f[t]).map((t) => [t, f[t]])),
    condiciones: {
      entradaLibre24h: !!r.entrada_libre_24h,
      horaLlegada: r.hora_llegada,
      visitas: !!r.visitas,
      cocina: !!r.cocina,
      mascotas: !!r.mascotas,
      declaradas: !!r.declaradas,
    },
    fotos: { fachada: f.fachada ?? '', habitacion: f.habitacion ?? '', bano: f.bano ?? '', ventana: f.ventana ?? '' },
    estado: r.estado,
    creadoEn: new Date(r.creado_en).toISOString(),
  };
}

// ---- Validación
export function validarCuarto(c: Cuarto): string {
  if (typeof c.titulo !== 'string' || c.titulo.trim().length < 8) return 'Escribe un título de al menos 8 caracteres.';
  if (!(c.precio >= 50 && c.precio <= 3000)) return 'Ingresa un precio mensual entre S/ 50 y S/ 3,000.';
  if (!(c.areaM2 >= 4)) return 'Ingresa el área de la habitación en m².';
  if (!c.direccion?.trim() || !c.zona?.trim()) return 'Escribe la dirección y la zona.';
  if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng) || Math.abs(c.lat) > 90 || Math.abs(c.lng) > 180) return 'La ubicación del cuarto no es válida.';
  const h = c.condiciones?.horaLlegada;
  if (h !== null && !(Number.isInteger(h) && h >= 0 && h <= 23)) return 'La hora de llegada no es válida.';
  const falta = TIPOS_FOTO.find((t) => !c.fotos?.[t]);
  if (falta) return `Falta la foto: ${falta}. Las 4 fotos son obligatorias.`;
  return '';
}

// ---- Fotos: las que llegan como data URL se guardan en server/uploads
async function guardarFoto(cuartoId: string, tipo: string, url: string): Promise<string> {
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(url);
  if (!m) return url;
  await mkdir(UPLOADS_DIR, { recursive: true });
  const nombre = `${cuartoId}-${tipo}-${randomBytes(4).toString('hex')}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
  await writeFile(path.join(UPLOADS_DIR, nombre), Buffer.from(m[2], 'base64'));
  return `/uploads/${nombre}`;
}

/** Inserta o actualiza un cuarto con sus servicios, condiciones y fotos. Debe ir dentro de una transacción. */
export async function guardarCuartoDb(db: PoolClient, c: Cuarto): Promise<void> {
  await db.query(
    `insert into cuarto (id, propietario_id, titulo, descripcion, precio, area_m2, bano_privado, luz_natural, direccion, zona, latitud, longitud, estado, creado_en)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     on conflict (id) do update set titulo=$3, descripcion=$4, precio=$5, area_m2=$6, bano_privado=$7, luz_natural=$8,
       direccion=$9, zona=$10, latitud=$11, longitud=$12, estado=$13`,
    [c.id, c.propietarioId, c.titulo.trim(), c.descripcion ?? '', c.precio, c.areaM2, !!c.banoPrivado, !!c.luzNatural,
      c.direccion.trim(), c.zona.trim(), c.lat, c.lng, c.estado === 'oculto' ? 'oculto' : 'activo', c.creadoEn || new Date().toISOString()],
  );
  await db.query(
    `insert into servicios values ($1,$2,$3,$4)
     on conflict (cuarto_id) do update set agua_24h=$2, luz_24h=$3, internet_24h=$4`,
    [c.id, !!c.servicios.agua, !!c.servicios.luz, !!c.servicios.internet],
  );
  const k = c.condiciones;
  await db.query(
    `insert into condiciones values ($1,$2,$3,$4,$5,$6,$7)
     on conflict (cuarto_id) do update set entrada_libre_24h=$2, hora_llegada=$3, visitas=$4, cocina=$5, mascotas=$6, declaradas=$7`,
    [c.id, !!k.entradaLibre24h, k.horaLlegada, !!k.visitas, !!k.cocina, !!k.mascotas, !!k.declaradas],
  );

  const antes = await db.query<{ url: string }>('select url from foto where cuarto_id = $1', [c.id]);
  const nuevas: [string, string][] = [
    ...TIPOS_FOTO.map((t) => [t, c.fotos[t]] as [string, string]),
    ...TIPOS_SEG.filter((t) => c.seguridad?.[t]).map((t) => [t, c.seguridad[t]!] as [string, string]),
  ];
  await db.query('delete from foto where cuarto_id = $1', [c.id]);
  const urls: string[] = [];
  for (const [tipo, url] of nuevas) {
    const final = await guardarFoto(c.id, tipo, url);
    urls.push(final);
    await db.query('insert into foto values ($1,$2,$3)', [c.id, tipo, final]);
  }
  // Borra del disco las fotos subidas que ya no usa el cuarto.
  for (const { url } of antes.rows) {
    if (url.startsWith('/uploads/') && !urls.includes(url)) await unlink(path.join(UPLOADS_DIR, path.basename(url))).catch(() => {});
  }
}
