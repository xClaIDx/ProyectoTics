import type { Cuarto, Punto, Usuario } from '../types';

/** Fotos de ejemplo guardadas en public/ejemplos (funcionan sin conexión). */
const F = (nombre: string) => `/ejemplos/${nombre}.jpg`;
const FACHADAS = ['fachada-1', 'fachada-2', 'fachada-3'].map(F);
const HABITACIONES = ['habitacion-1', 'habitacion-2', 'habitacion-3'].map(F);
const BANO = F('bano-1');
const VENTANA = F('ventana-1');

export const PUNTOS: Punto[] = [
  { nombre: 'UNA Puno (Ciudad Universitaria)', lat: -15.8246, lng: -70.0163 },
  { nombre: 'Plaza de Armas de Puno', lat: -15.8402, lng: -70.0219 },
  { nombre: 'Terminal Terrestre de Puno', lat: -15.8354, lng: -70.0172 },
  { nombre: 'Mercado Central', lat: -15.8389, lng: -70.0247 },
  { nombre: 'Hospital Regional de Puno', lat: -15.8357, lng: -70.0283 },
];

export const USUARIOS_SEED: Usuario[] = [
  { id: 'u-arr-demo', nombre: 'Lucía Mamani', correo: 'demo@casascore.pe', rol: 'arrendatario', creadoEn: '2026-09-01' },
  { id: 'u-prop-demo', nombre: 'Rosa Quispe', correo: 'propietario@casascore.pe', rol: 'propietario', telefono: '51900000001', creadoEn: '2026-09-01' },
  { id: 'u-prop-2', nombre: 'Julio Condori', correo: 'julio@casascore.pe', rol: 'propietario', telefono: '51900000002', creadoEn: '2026-09-02' },
  { id: 'u-prop-3', nombre: 'Marta Apaza', correo: 'marta@casascore.pe', rol: 'propietario', telefono: '51900000003', creadoEn: '2026-09-03' },
];

type Base = Omit<Cuarto, 'id' | 'fotos' | 'estado' | 'creadoEn' | 'descripcion'> & { descripcion?: string };
const base: Base[] = [
  { propietarioId: 'u-prop-demo', titulo: 'Habitación frente a la Puerta 1 de la UNA', precio: 240, areaM2: 14, banoPrivado: true, luzNatural: true, direccion: 'Av. Floral 412', zona: 'Entorno UNA Puno', lat: -15.8252, lng: -70.0171, servicios: { agua: true, luz: true, internet: true }, seguridad: { porton: 'x', iluminacion: 'x', camara: 'x' }, condiciones: { entradaLibre24h: true, horaLlegada: null, visitas: true, cocina: true, mascotas: false, declaradas: true } },
  { propietarioId: 'u-prop-2', titulo: 'Minidepartamento independiente con cocina', precio: 480, areaM2: 22, banoPrivado: true, luzNatural: true, direccion: 'Jr. Los Incas 230', zona: 'Barrio Laykakota', lat: -15.8301, lng: -70.0150, servicios: { agua: true, luz: true, internet: true }, seguridad: { porton: 'x', rejas: 'x', iluminacion: 'x' }, condiciones: { entradaLibre24h: true, horaLlegada: null, visitas: true, cocina: true, mascotas: true, declaradas: true } },
  { propietarioId: 'u-prop-3', titulo: 'Cuarto económico cerca del Mercado', precio: 160, areaM2: 10, banoPrivado: false, luzNatural: false, direccion: 'Jr. Cahuide 780', zona: 'Barrio Bellavista', lat: -15.8370, lng: -70.0262, servicios: { agua: false, luz: true, internet: false }, seguridad: {}, condiciones: { entradaLibre24h: false, horaLlegada: 20, visitas: false, cocina: false, mascotas: false, declaradas: false } },
  { propietarioId: 'u-prop-demo', titulo: 'Habitación amplia amoblada para tesista', precio: 320, areaM2: 18, banoPrivado: true, luzNatural: true, direccion: 'Av. Sesquicentenario 305', zona: 'Facultad de Estadística', lat: -15.8269, lng: -70.0182, servicios: { agua: true, luz: true, internet: true }, seguridad: { porton: 'x', rejas: 'x', iluminacion: 'x', camara: 'x' }, condiciones: { entradaLibre24h: false, horaLlegada: 23, visitas: true, cocina: true, mascotas: false, declaradas: true } },
  { propietarioId: 'u-prop-2', titulo: 'Cuarto en segundo piso con vista al lago', precio: 200, areaM2: 12, banoPrivado: false, luzNatural: true, direccion: 'Jr. Huáscar 512', zona: 'Centro / Huáscar', lat: -15.8395, lng: -70.0205, servicios: { agua: true, luz: true, internet: true }, seguridad: { porton: 'x', iluminacion: 'x' }, condiciones: { entradaLibre24h: false, horaLlegada: 21, visitas: false, cocina: true, mascotas: false, declaradas: true } },
  { propietarioId: 'u-prop-3', titulo: 'Habitación con baño propio en Chanu Chanu', precio: 280, areaM2: 15, banoPrivado: true, luzNatural: true, direccion: 'Jr. Las Rosas 145', zona: 'Chanu Chanu', lat: -15.8215, lng: -70.0128, servicios: { agua: true, luz: true, internet: false }, seguridad: { porton: 'x', rejas: 'x' }, condiciones: { entradaLibre24h: true, horaLlegada: null, visitas: true, cocina: false, mascotas: false, declaradas: true } },
  { propietarioId: 'u-prop-demo', titulo: 'Cuarto para estudiante en Alto Puno', precio: 180, areaM2: 11, banoPrivado: false, luzNatural: true, direccion: 'Av. Circunvalación 1020', zona: 'Alto Puno', lat: -15.8180, lng: -70.0235, servicios: { agua: true, luz: true, internet: true }, seguridad: { iluminacion: 'x' }, condiciones: { entradaLibre24h: false, horaLlegada: 22, visitas: true, cocina: true, mascotas: false, declaradas: true } },
  { propietarioId: 'u-prop-2', titulo: 'Departamento compartido cerca de la Plaza', precio: 350, areaM2: 16, banoPrivado: false, luzNatural: true, direccion: 'Jr. Lima 640', zona: 'Centro histórico', lat: -15.8418, lng: -70.0230, servicios: { agua: true, luz: true, internet: true }, seguridad: { porton: 'x', camara: 'x' }, condiciones: { entradaLibre24h: true, horaLlegada: null, visitas: true, cocina: true, mascotas: true, declaradas: true } },
  { propietarioId: 'u-prop-3', titulo: 'Habitación tranquila en Salcedo', precio: 220, areaM2: 13, banoPrivado: true, luzNatural: false, direccion: 'Av. Simón Bolívar 2210', zona: 'Salcedo', lat: -15.8600, lng: -70.0170, servicios: { agua: true, luz: true, internet: false }, seguridad: { porton: 'x', rejas: 'x', iluminacion: 'x' }, condiciones: { entradaLibre24h: true, horaLlegada: null, visitas: false, cocina: true, mascotas: false, declaradas: true } },
  { propietarioId: 'u-prop-demo', titulo: 'Cuarto con terma y wifi en Independencia', precio: 260, areaM2: 14, banoPrivado: true, luzNatural: true, direccion: 'Jr. Independencia 455', zona: 'Independencia', lat: -15.8330, lng: -70.0248, servicios: { agua: true, luz: true, internet: true }, seguridad: { porton: 'x', iluminacion: 'x' }, condiciones: { entradaLibre24h: false, horaLlegada: 23, visitas: true, cocina: false, mascotas: false, declaradas: true } },
  { propietarioId: 'u-prop-2', titulo: 'Habitación familiar en Jayllihuaya', precio: 300, areaM2: 20, banoPrivado: true, luzNatural: true, direccion: 'Av. Principal s/n, Jayllihuaya', zona: 'Jayllihuaya', lat: -15.8740, lng: -70.0080, servicios: { agua: true, luz: true, internet: true }, seguridad: { porton: 'x', rejas: 'x', iluminacion: 'x', camara: 'x' }, condiciones: { entradaLibre24h: true, horaLlegada: null, visitas: true, cocina: true, mascotas: true, declaradas: true } },
  { propietarioId: 'u-prop-3', titulo: 'Cuarto simple cerca del Terminal', precio: 190, areaM2: 12, banoPrivado: false, luzNatural: true, direccion: 'Jr. Primero de Mayo 300', zona: 'Terminal Terrestre', lat: -15.8348, lng: -70.0185, servicios: { agua: true, luz: true, internet: false }, seguridad: { porton: 'x' }, condiciones: { entradaLibre24h: false, horaLlegada: 22, visitas: true, cocina: true, mascotas: false, declaradas: true } },
];

export const CUARTOS_SEED: Cuarto[] = base.map((b, i) => ({
  ...b,
  id: `c-${String(i + 1).padStart(3, '0')}`,
  descripcion: b.descripcion ?? `${b.titulo}. Ubicado en ${b.direccion}, ${b.zona}. Consulta disponibilidad y coordina una visita con el propietario.`,
  seguridad: Object.fromEntries(Object.keys(b.seguridad).map((k) => [k, FACHADAS[i % FACHADAS.length]])),
  fotos: { fachada: FACHADAS[i % FACHADAS.length], habitacion: HABITACIONES[i % HABITACIONES.length], bano: BANO, ventana: VENTANA },
  estado: 'activo',
  creadoEn: `2026-10-${String(1 + i).padStart(2, '0')}`,
}));
