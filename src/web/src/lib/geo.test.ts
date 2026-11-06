import { describe, expect, it } from 'vitest';
import { distanciaMetros, formatoDistancia, minutosAPie } from './geo';
import { PUNTOS } from '../data/seed';

describe('motor de distancia', () => {
  it('Haversine: mismo punto es 0 m', () => {
    expect(distanciaMetros(-15.8246, -70.0163, -15.8246, -70.0163)).toBe(0);
  });
  it('Haversine: 0.01° de latitud son unos 1,112 m', () => {
    expect(distanciaMetros(-15.83, -70.02, -15.84, -70.02)).toBeCloseTo(1111.95, 0);
  });
  it('Haversine: UNA Puno a la Plaza de Armas está entre 1.8 y 1.9 km y es simétrica', () => {
    const [una, plaza] = PUNTOS;
    const ida = distanciaMetros(una.lat, una.lng, plaza.lat, plaza.lng);
    expect(ida).toBeGreaterThan(1800);
    expect(ida).toBeLessThan(1900);
    expect(distanciaMetros(plaza.lat, plaza.lng, una.lat, una.lng)).toBeCloseTo(ida, 6);
  });
  it('tiempo a pie: 800 m en línea recta son 13 min (recorrido ×1.3 a 80 m/min)', () => {
    expect(minutosAPie(800)).toBeCloseTo(13, 6);
  });
  it('formato de distancia', () => {
    expect(formatoDistancia(327)).toBe('330 m');
    expect(formatoDistancia(1717)).toBe('1.7 km');
  });
});
