import type { Ajuste, Cuarto, Desglose, Pesos, Punto } from '../types';
import { distanciaMetros, minutosAPie } from './geo';

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

/** Precio: 100 si es S/ 140 o menos y 0 si es S/ 850 o más. */
export function normalizarPrecio(p: number): number {
  return clamp((100 * (850 - p)) / (850 - 140));
}

/** Cercanía: 50 % distancia (50 a 3,000 m) y 50 % tiempo a pie (2 a 40 min). */
export function normalizarCercania(d: number, t: number): number {
  const nd = clamp((100 * (3000 - d)) / (3000 - 50));
  const nt = clamp((100 * (40 - t)) / (40 - 2));
  return 0.5 * nd + 0.5 * nt;
}

/** Seguridad: 1 punto base más 1 por cada característica declarada con foto (máximo 5). */
export function nivelSeguridad(c: Pick<Cuarto, 'seguridad'>): number {
  const conFoto = Object.values(c.seguridad).filter(Boolean).length;
  return Math.min(5, 1 + conFoto);
}
export function normalizarSeguridad(nivel: number): number {
  return clamp((nivel / 5) * 100);
}

/** Servicios 24 h: agua 40, luz 30 e internet 30. */
export function normalizarServicios(s: Cuarto['servicios']): number {
  return (s.agua ? 40 : 0) + (s.luz ? 30 : 0) + (s.internet ? 30 : 0);
}

/** Baño: privado 100 y compartido 0. */
export function normalizarBano(privado: boolean): number {
  return privado ? 100 : 0;
}

export function bonificaciones(c: Cuarto): Ajuste[] {
  const b: Ajuste[] = [];
  if (c.luzNatural) b.push({ etiqueta: 'Ventana con luz natural directa', puntos: 8 });
  if (c.condiciones.entradaLibre24h) b.push({ etiqueta: 'Entrada libre 24 h con llave propia', puntos: 5 });
  if (c.areaM2 >= 16) b.push({ etiqueta: `Habitación de ${c.areaM2} m² (16 m² o más)`, puntos: 4 });
  return b;
}

export function penalizaciones(c: Cuarto): Ajuste[] {
  const p: Ajuste[] = [];
  const h = c.condiciones.horaLlegada;
  if (h !== null) {
    if (h <= 20) p.push({ etiqueta: `Hora de llegada hasta las ${h}:00`, puntos: 20 });
    else if (h <= 22) p.push({ etiqueta: `Hora de llegada a las ${h}:00`, puntos: 12 });
    else p.push({ etiqueta: `Hora de llegada a las ${h}:00`, puntos: 6 });
  }
  if (!c.condiciones.visitas) p.push({ etiqueta: 'No se permiten visitas', puntos: 12 });
  if (!c.condiciones.cocina) p.push({ etiqueta: 'No se permite cocinar', puntos: 8 });
  if (!c.condiciones.declaradas) p.push({ etiqueta: 'Condiciones no declaradas en el anuncio', puntos: 25 });
  return p;
}

/** CASA SCORE = min(100, max(0, Σ wᵢNᵢ / Σ wᵢ + B − P)). */
export function calcularCasaScore(c: Cuarto, pesos: Pesos, punto: Punto): Desglose {
  const distancia = distanciaMetros(c.lat, c.lng, punto.lat, punto.lng);
  const minutos = minutosAPie(distancia);
  const n: Pesos = {
    precio: normalizarPrecio(c.precio),
    cercania: normalizarCercania(distancia, minutos),
    seguridad: normalizarSeguridad(nivelSeguridad(c)),
    servicios: normalizarServicios(c.servicios),
    bano: normalizarBano(c.banoPrivado),
  };
  const claves = Object.keys(n) as (keyof Pesos)[];
  const sumaPesos = claves.reduce((s, k) => s + pesos[k], 0);
  const base = sumaPesos > 0 ? claves.reduce((s, k) => s + pesos[k] * n[k], 0) / sumaPesos : 0;
  const bon = bonificaciones(c);
  const pen = penalizaciones(c);
  const total = base + bon.reduce((s, x) => s + x.puntos, 0) - pen.reduce((s, x) => s + x.puntos, 0);
  return {
    distancia,
    minutos,
    normalizados: n,
    base,
    bonificaciones: bon,
    penalizaciones: pen,
    puntaje: Math.round(clamp(total)),
  };
}

export function colorPuntaje(p: number): 'alto' | 'medio' | 'bajo' {
  return p >= 80 ? 'alto' : p >= 50 ? 'medio' : 'bajo';
}
