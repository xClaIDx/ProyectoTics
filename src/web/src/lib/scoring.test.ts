import { describe, expect, it } from 'vitest';
import { calcularCasaScore, normalizarCercania, normalizarPrecio, normalizarSeguridad, normalizarServicios, nivelSeguridad } from './scoring';
import { CUARTOS_SEED, PUNTOS } from '../data/seed';
import type { Pesos } from '../types';

const pesos: Pesos = { precio: 4, cercania: 3, seguridad: 2, servicios: 1, bano: 2 };

describe('motor CASA SCORE', () => {
  it('CP-01 precio', () => {
    expect(normalizarPrecio(140)).toBe(100);
    expect(normalizarPrecio(850)).toBe(0);
    expect(normalizarPrecio(495)).toBeCloseTo(50, 5);
  });
  it('CP-02 cercanía', () => {
    expect(normalizarCercania(50, 2)).toBe(100);
    expect(normalizarCercania(3000, 40)).toBe(0);
  });
  it('CP-03 seguridad', () => {
    expect(normalizarSeguridad(1)).toBe(20);
    expect(normalizarSeguridad(5)).toBe(100);
    expect(nivelSeguridad({ seguridad: { porton: 'f', camara: 'f' } })).toBe(3);
  });
  it('CP-04 servicios', () => {
    expect(normalizarServicios({ agua: true, luz: true, internet: false })).toBe(70);
  });
  it('CP-05 bonificaciones, penalizaciones y límites', () => {
    const malo = CUARTOS_SEED[2];
    const d = calcularCasaScore(malo, pesos, PUNTOS[0]);
    expect(d.penalizaciones.reduce((s, p) => s + p.puntos, 0)).toBe(65);
    expect(d.puntaje).toBeGreaterThanOrEqual(0);
    const bueno = calcularCasaScore(CUARTOS_SEED[1], pesos, PUNTOS[0]);
    expect(bueno.puntaje).toBeLessThanOrEqual(100);
  });
  it('CP-06 un peso en 0 no influye', () => {
    const c = CUARTOS_SEED[0];
    const solo = calcularCasaScore(c, { precio: 1, cercania: 0, seguridad: 0, servicios: 0, bano: 0 }, PUNTOS[0]);
    expect(solo.base).toBeCloseTo(normalizarPrecio(c.precio), 5);
  });
  it('CP-07 el cuarto con condiciones ocultas queda último', () => {
    const orden = CUARTOS_SEED.map((c) => ({ id: c.id, p: calcularCasaScore(c, pesos, PUNTOS[0]).puntaje })).sort((a, b) => b.p - a.p);
    expect(orden[orden.length - 1].id).toBe(CUARTOS_SEED[2].id);
  });
});
