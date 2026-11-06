import type { Cuarto, Pesos, Punto, Usuario } from '../types';
import { PUNTOS } from './seed';

/**
 * Acceso a datos de la web. Los cuartos, usuarios, sesiones, prioridades y favoritos viven en
 * PostgreSQL detrás de la API local (server/). Aquí se guarda una copia en memoria para que las
 * pantallas lean sin esperar; las escrituras pasan por la API y actualizan esa copia.
 * El navegador solo guarda el token de sesión, el borrador y las preferencias de quien no ingresó.
 */
const K = { sesion: 'cs_token', pesos: 'cs_pesos', punto: 'cs_punto', borrador: 'cs_borrador', favoritos: 'cs_favoritos' };

function leer<T>(clave: string, defecto: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : defecto;
  } catch {
    return defecto;
  }
}
function guardar(clave: string, valor: unknown): boolean {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

// ---- Cliente de la API
async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = leer<string | null>(K.sesion, null);
  let res: Response;
  try {
    res = await fetch(`/api${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opciones.headers },
    });
  } catch {
    throw new Error('No hay conexión con el servidor de CasaScore. Revisa que la API esté encendida (npm run dev).');
  }
  if (res.status === 204) return undefined as T;
  const cuerpo = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(cuerpo.error ?? `El servidor respondió con un error (${res.status}).`);
  return cuerpo as T;
}

let cuartos: Cuarto[] = [];
let usuarios: Usuario[] = [];
let actual: Usuario | undefined;
/** Mensaje si la API no respondió al abrir la app. */
export let errorConexion = '';

interface Me { usuario: Usuario; pesos: Pesos | null; punto: Punto | null; favoritos: string[] }
async function cargarSesion(): Promise<void> {
  try {
    const me = await api<Me>('/me');
    actual = me.usuario;
    if (me.pesos) guardar(K.pesos, me.pesos);
    if (me.punto) guardar(K.punto, me.punto);
    guardar(K.favoritos, me.favoritos);
  } catch {
    actual = undefined;
    localStorage.removeItem(K.sesion);
  }
}

export async function inicializar(): Promise<void> {
  try {
    if (leer<string | null>(K.sesion, null)) await cargarSesion();
    [usuarios, cuartos] = await Promise.all([api<Usuario[]>('/usuarios'), api<Cuarto[]>('/cuartos')]);
    errorConexion = '';
  } catch (e) {
    errorConexion = (e as Error).message;
  }
}

export async function reiniciarDatos(): Promise<void> {
  await api('/reiniciar', { method: 'POST' });
  Object.values(K).forEach((k) => localStorage.removeItem(k));
}

// ---- Cuartos
export const listarCuartos = (): Cuarto[] => cuartos;
export const obtenerCuarto = (id: string) => cuartos.find((c) => c.id === id);
export async function recargarCuartos(): Promise<void> {
  cuartos = await api<Cuarto[]>('/cuartos');
}
/** Crea o actualiza un cuarto en la base de datos y devuelve cómo quedó guardado. */
export async function guardarCuarto(c: Omit<Cuarto, 'id'> & { id?: string }): Promise<Cuarto> {
  const existe = c.id && cuartos.some((x) => x.id === c.id);
  const guardado = await api<Cuarto>(existe ? `/cuartos/${c.id}` : '/cuartos', { method: existe ? 'PUT' : 'POST', body: JSON.stringify(c) });
  cuartos = [guardado, ...cuartos.filter((x) => x.id !== guardado.id)];
  return guardado;
}

// ---- Usuarios y sesión
export const obtenerUsuario = (id: string) => usuarios.find((u) => u.id === id);
async function abrirSesion(r: { token: string; usuario: Usuario }): Promise<Usuario> {
  guardar(K.sesion, r.token);
  await cargarSesion();
  [usuarios, cuartos] = await Promise.all([api<Usuario[]>('/usuarios'), api<Cuarto[]>('/cuartos')]);
  return actual ?? r.usuario;
}
export async function registrar(u: Omit<Usuario, 'id' | 'creadoEn'>, password: string): Promise<Usuario> {
  return abrirSesion(await api('/registro', { method: 'POST', body: JSON.stringify({ ...u, password }) }));
}
export async function iniciarSesion(correo: string, password: string): Promise<Usuario> {
  return abrirSesion(await api('/sesion', { method: 'POST', body: JSON.stringify({ correo, password }) }));
}
export function cerrarSesion(): void {
  api('/sesion', { method: 'DELETE' }).catch(() => {});
  localStorage.removeItem(K.sesion);
  actual = undefined;
  cuartos = cuartos.filter((c) => c.estado === 'activo');
}
export const usuarioActual = (): Usuario | undefined => actual;

// ---- Preferencias del arrendatario (en la cuenta si ingresó; si no, en el navegador)
let temporizador: ReturnType<typeof setTimeout> | undefined;
function sincronizarPreferencias() {
  if (!actual) return;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    api('/preferencias', { method: 'PUT', body: JSON.stringify({ pesos: leerPesos(), punto: leerPunto() }) }).catch(() => {});
  }, 400);
}
export const PESOS_DEFECTO: Pesos = { precio: 4, cercania: 3, seguridad: 2, servicios: 1, bano: 2 };
export const leerPesos = () => leer<Pesos>(K.pesos, PESOS_DEFECTO);
export const guardarPesos = (p: Pesos) => { guardar(K.pesos, p); sincronizarPreferencias(); };
export const leerPunto = () => leer<Punto>(K.punto, PUNTOS[0]);
export const guardarPunto = (p: Punto) => { guardar(K.punto, p); sincronizarPreferencias(); };

// ---- Favoritos y borrador
export const leerFavoritos = () => leer<string[]>(K.favoritos, []);
export const guardarFavoritos = (f: string[]) => {
  guardar(K.favoritos, f);
  if (actual) api('/favoritos', { method: 'PUT', body: JSON.stringify({ favoritos: f }) }).catch(() => {});
};
export const leerBorrador = <T,>() => leer<T | null>(K.borrador, null);
export const guardarBorrador = (b: unknown) => guardar(K.borrador, b);
export const borrarBorrador = () => localStorage.removeItem(K.borrador);
