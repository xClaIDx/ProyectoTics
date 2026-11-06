import { randomBytes } from 'node:crypto';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { calcularCasaScore } from '../src/lib/scoring';
import type { Cuarto, Pesos, Punto, Rol, Usuario } from '../src/types';
import { filaACuarto, guardarCuartoDb, hashPassword, SELECT_CUARTO, UPLOADS_DIR, validarCuarto, verificarPassword } from './cuartos';
import { API_PORT, pool } from './db';
import { sembrar } from './sembrar';

type UsuarioPublico = Omit<Usuario, 'correo'> & { correo?: string };
type Req = Request & { usuario?: Usuario };

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/ejemplos', express.static(path.join(import.meta.dirname, '..', 'public', 'ejemplos')));

const PESOS_DEFECTO: Pesos = { precio: 4, cercania: 3, seguridad: 2, servicios: 1, bano: 2 };
const CLAVES: (keyof Pesos)[] = ['precio', 'cercania', 'seguridad', 'servicios', 'bano'];

class ErrorApi extends Error {
  constructor(public status: number, mensaje: string) { super(mensaje); }
}

const filaAUsuario = (r: any): Usuario => ({
  id: r.id, nombre: r.nombre, correo: r.correo, rol: r.rol, telefono: r.telefono ?? undefined, creadoEn: new Date(r.creado_en).toISOString(),
});

// ---- Sesión: token en la cabecera Authorization
app.use(async (req: Req, _res, next) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (token) {
    const { rows } = await pool.query('select u.* from sesion s join usuario u on u.id = s.usuario_id where s.token = $1', [token]);
    if (rows[0]) req.usuario = filaAUsuario(rows[0]);
  }
  next();
});
function requerirSesion(req: Req): Usuario {
  if (!req.usuario) throw new ErrorApi(401, 'Tu sesión terminó. Vuelve a ingresar.');
  return req.usuario;
}
async function crearSesion(usuarioId: string): Promise<string> {
  const token = randomBytes(24).toString('hex');
  await pool.query('insert into sesion (token, usuario_id) values ($1, $2)', [token, usuarioId]);
  return token;
}

/** Pesos y punto de referencia desde la consulta (?lat=&lng=&precio=4...). */
function leerConsulta(q: Request['query']): { pesos: Pesos; punto: Punto } {
  const pesos = { ...PESOS_DEFECTO };
  for (const k of CLAVES) if (q[k] !== undefined) pesos[k] = Math.min(5, Math.max(0, Number(q[k]) || 0));
  const lat = Number(q.lat), lng = Number(q.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new ErrorApi(400, 'Indica el punto de referencia con lat y lng.');
  return { pesos, punto: { nombre: String(q.nombre ?? 'Punto de referencia'), lat, lng } };
}

async function listarCuartos(usuarioId?: string): Promise<Cuarto[]> {
  const { rows } = await pool.query(`${SELECT_CUARTO} where c.estado = 'activo' or c.propietario_id = $1 order by c.creado_en desc`, [usuarioId ?? '']);
  return rows.map(filaACuarto);
}
async function obtenerCuarto(id: string, usuarioId?: string): Promise<Cuarto | undefined> {
  const { rows } = await pool.query(`${SELECT_CUARTO} where c.id = $1 and (c.estado = 'activo' or c.propietario_id = $2)`, [id, usuarioId ?? '']);
  return rows[0] ? filaACuarto(rows[0]) : undefined;
}

// ---- Estado del servidor
app.get('/api/salud', async (_req, res) => {
  const { rows } = await pool.query('select now() as hora, (select count(*) from cuarto)::int as cuartos');
  res.json({ ok: true, ...rows[0] });
});

// ---- Usuarios y sesión
app.get('/api/usuarios', async (_req, res) => {
  const { rows } = await pool.query('select id, nombre, rol, telefono, creado_en from usuario order by creado_en');
  res.json(rows.map((r): UsuarioPublico => { const u = filaAUsuario(r); delete (u as UsuarioPublico).correo; return u; }));
});

app.post('/api/registro', async (req, res) => {
  const { nombre, correo, rol, telefono, password } = req.body ?? {};
  if (typeof nombre !== 'string' || nombre.trim().length < 3) throw new ErrorApi(400, 'Escribe tu nombre completo.');
  if (typeof correo !== 'string' || !/^\S+@\S+\.\S+$/.test(correo)) throw new ErrorApi(400, 'Escribe un correo válido.');
  if (typeof password !== 'string' || password.length < 6) throw new ErrorApi(400, 'La contraseña debe tener al menos 6 caracteres.');
  if (!(['arrendatario', 'propietario'] as Rol[]).includes(rol)) throw new ErrorApi(400, 'Elige si buscas cuarto o publicas cuartos.');
  const existe = await pool.query('select 1 from usuario where lower(correo) = lower($1)', [correo]);
  if (existe.rowCount) throw new ErrorApi(409, 'Ya existe una cuenta con ese correo.');
  const id = `u-${Date.now()}-${randomBytes(3).toString('hex')}`;
  const { rows } = await pool.query(
    'insert into usuario (id, nombre, correo, rol, telefono, password_hash) values ($1,$2,$3,$4,$5,$6) returning *',
    [id, nombre.trim(), correo.trim(), rol, telefono || null, await hashPassword(password)],
  );
  res.status(201).json({ token: await crearSesion(id), usuario: filaAUsuario(rows[0]) });
});

app.post('/api/sesion', async (req, res) => {
  const { correo, password } = req.body ?? {};
  const { rows } = await pool.query('select * from usuario where lower(correo) = lower($1)', [String(correo ?? '')]);
  if (!rows[0] || !(await verificarPassword(String(password ?? ''), rows[0].password_hash))) throw new ErrorApi(401, 'Correo o contraseña incorrectos.');
  res.json({ token: await crearSesion(rows[0].id), usuario: filaAUsuario(rows[0]) });
});

app.delete('/api/sesion', async (req, res) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (token) await pool.query('delete from sesion where token = $1', [token]);
  res.status(204).end();
});

/** Usuario actual con sus prioridades, punto de referencia y favoritos. */
app.get('/api/me', async (req: Req, res) => {
  const u = requerirSesion(req);
  const pref = (await pool.query('select * from preferencia where usuario_id = $1', [u.id])).rows[0];
  const favs = await pool.query('select cuarto_id from favorito where usuario_id = $1', [u.id]);
  res.json({
    usuario: u,
    pesos: pref ? { precio: pref.peso_precio, cercania: pref.peso_cercania, seguridad: pref.peso_seguridad, servicios: pref.peso_servicios, bano: pref.peso_bano } : null,
    punto: pref?.ref_nombre ? { nombre: pref.ref_nombre, lat: pref.ref_latitud, lng: pref.ref_longitud } : null,
    favoritos: favs.rows.map((r) => r.cuarto_id),
  });
});

app.put('/api/preferencias', async (req: Req, res) => {
  const u = requerirSesion(req);
  const { pesos, punto } = req.body ?? {};
  const p: Pesos = { ...PESOS_DEFECTO };
  for (const k of CLAVES) p[k] = Math.min(5, Math.max(0, Math.round(Number(pesos?.[k] ?? p[k]) || 0)));
  const ok = punto && Number.isFinite(punto.lat) && Number.isFinite(punto.lng);
  await pool.query(
    `insert into preferencia values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     on conflict (usuario_id) do update set peso_precio=$2, peso_cercania=$3, peso_seguridad=$4, peso_servicios=$5, peso_bano=$6,
       ref_nombre=$7, ref_latitud=$8, ref_longitud=$9`,
    [u.id, p.precio, p.cercania, p.seguridad, p.servicios, p.bano, ok ? String(punto.nombre) : null, ok ? punto.lat : null, ok ? punto.lng : null],
  );
  res.status(204).end();
});

app.put('/api/favoritos', async (req: Req, res) => {
  const u = requerirSesion(req);
  const ids: unknown = req.body?.favoritos;
  if (!Array.isArray(ids)) throw new ErrorApi(400, 'Envía la lista de favoritos.');
  const db = await pool.connect();
  try {
    await db.query('begin');
    await db.query('delete from favorito where usuario_id = $1', [u.id]);
    await db.query(
      'insert into favorito select $1, c.id from cuarto c where c.id = any($2::text[]) on conflict do nothing',
      [u.id, ids.map(String)],
    );
    await db.query('commit');
  } catch (e) {
    await db.query('rollback');
    throw e;
  } finally {
    db.release();
  }
  res.status(204).end();
});

// ---- Cuartos
app.get('/api/cuartos', async (req: Req, res) => {
  res.json(await listarCuartos(req.usuario?.id));
});

app.get('/api/cuartos/:id', async (req: Req, res) => {
  const c = await obtenerCuarto(String(req.params.id), req.usuario?.id);
  if (!c) throw new ErrorApi(404, 'Este cuarto no existe o fue retirado.');
  res.json(c);
});

async function guardar(req: Req, res: Response, id?: string) {
  const u = requerirSesion(req);
  if (u.rol !== 'propietario') throw new ErrorApi(403, 'Solo los propietarios pueden publicar cuartos.');
  let creadoEn = new Date().toISOString();
  if (id) {
    const actual = await pool.query('select propietario_id, creado_en from cuarto where id = $1', [id]);
    if (!actual.rowCount) throw new ErrorApi(404, 'Este cuarto no existe.');
    if (actual.rows[0].propietario_id !== u.id) throw new ErrorApi(403, 'Solo puedes editar tus propios cuartos.');
    creadoEn = new Date(actual.rows[0].creado_en).toISOString();
  }
  const c: Cuarto = { ...req.body, id: id ?? `c-${Date.now()}-${randomBytes(3).toString('hex')}`, propietarioId: u.id, creadoEn };
  const error = validarCuarto(c);
  if (error) throw new ErrorApi(400, error);
  const db = await pool.connect();
  try {
    await db.query('begin');
    await guardarCuartoDb(db, c);
    await db.query('commit');
  } catch (e) {
    await db.query('rollback');
    throw e;
  } finally {
    db.release();
  }
  res.status(id ? 200 : 201).json(await obtenerCuarto(c.id, u.id));
}
app.post('/api/cuartos', (req: Req, res) => guardar(req, res));
app.put('/api/cuartos/:id', (req: Req, res) => guardar(req, res, String(req.params.id)));

// ---- Motor CASA SCORE en el servidor
/** Ranking de cuartos activos para un punto y unas prioridades: /api/ranking?lat=-15.82&lng=-70.01&precio=4&cercania=3... */
app.get('/api/ranking', async (req, res) => {
  const { pesos, punto } = leerConsulta(req.query);
  const activos = (await listarCuartos()).filter((c) => c.estado === 'activo');
  const ranking = activos
    .map((c) => ({ id: c.id, titulo: c.titulo, precio: c.precio, desglose: calcularCasaScore(c, pesos, punto) }))
    .sort((a, b) => b.desglose.puntaje - a.desglose.puntaje);
  res.json({ punto, pesos, ranking });
});

/** Desglose del CASA SCORE de un cuarto. */
app.get('/api/cuartos/:id/puntaje', async (req: Req, res) => {
  const c = await obtenerCuarto(String(req.params.id), req.usuario?.id);
  if (!c) throw new ErrorApi(404, 'Este cuarto no existe o fue retirado.');
  const { pesos, punto } = leerConsulta(req.query);
  res.json({ id: c.id, punto, pesos, desglose: calcularCasaScore(c, pesos, punto) });
});

// ---- Datos de prueba
app.post('/api/reiniciar', async (_req, res) => {
  const db = await pool.connect();
  try {
    await sembrar(db);
  } finally {
    db.release();
  }
  res.status(204).end();
});

app.use('/api', (_req, _res, next) => next(new ErrorApi(404, 'Ruta no encontrada.')));
app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Las fotos pesan demasiado. Usa fotos más livianas.' });
  const status = err instanceof ErrorApi ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Error del servidor. Revisa la consola de la API.' : err.message });
});

app.listen(API_PORT, () => console.log(`API de CasaScore en http://localhost:${API_PORT}`));
