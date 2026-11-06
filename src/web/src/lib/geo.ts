const R = 6371000;
const rad = (g: number) => (g * Math.PI) / 180;

/** Distancia en línea recta (metros) con la fórmula de Haversine. */
export function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Tiempo a pie (minutos): recorrido 30 % más largo que la línea recta, a 80 m por minuto. */
export function minutosAPie(metros: number): number {
  return (1.3 * metros) / 80;
}

export function formatoDistancia(m: number): string {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
}
