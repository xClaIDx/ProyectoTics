import { Property, UserPreferences, ScoreBreakdown, RoomRestrictions } from '../types';

export function normalizePrice(price: number, minPrice = 140, maxPrice = 850): number {
  if (price <= minPrice) return 100;
  if (price >= maxPrice) return 0;
  return Math.round(((maxPrice - price) / (maxPrice - minPrice)) * 100);
}

export function normalizeLocation(distanceMeters: number, timeMinutes: number): number {
  const normDist = distanceMeters <= 50 ? 100 : distanceMeters >= 3000 ? 0 :
    Math.round(((3000 - distanceMeters) / (3000 - 50)) * 100);

  const normTime = timeMinutes <= 2 ? 100 : timeMinutes >= 40 ? 0 :
    Math.round(((40 - timeMinutes) / (40 - 2)) * 100);

  return Math.round((normDist * 0.5) + (normTime * 0.5));
}

export function normalizeSecurity(rating: number): number {
  return Math.round(Math.min(Math.max((rating / 5) * 100, 0), 100));
}

export function normalizeServices(services: { water: boolean; electricity: boolean; internet: boolean }): number {
  let score = 0;
  if (services.water) score += 40;
  if (services.electricity) score += 30;
  if (services.internet) score += 30;
  return score;
}

export function evaluateConditionAdjustments(
  restrictions: RoomRestrictions,
  hasNaturalLight: boolean,
  sizeSqm: number
): { penalty: number; bonus: number; notes: string[] } {
  let penalty = 0;
  let bonus = 0;
  const notes: string[] = [];

  if (hasNaturalLight) {
    bonus += 8;
    notes.push('Bonificacion: Iluminacion natural directa (+8 pts)');
  }

  if (restrictions.freeEntry24h) {
    bonus += 5;
    notes.push('Bonificacion: Entrada libre 24h con llave propia (+5 pts)');
  }

  if (sizeSqm >= 16) {
    bonus += 4;
    notes.push(`Bonificacion: Amplitud de habitacion (${sizeSqm} m2) (+4 pts)`);
  }

  if (restrictions.hasCurfew) {
    const hour = restrictions.curfewHour ?? 22;
    if (hour <= 20) {
      penalty += 20;
      notes.push(`Penalizacion severa: Toque de queda ${hour}:00 hrs (-20 pts)`);
    } else if (hour <= 22) {
      penalty += 12;
      notes.push(`Penalizacion: Toque de queda ${hour}:00 hrs (-12 pts)`);
    } else {
      penalty += 6;
      notes.push(`Penalizacion: Restriccion nocturna ${hour}:00 hrs (-6 pts)`);
    }
  }

  if (!restrictions.allowsVisitors) {
    penalty += 12;
    notes.push('Penalizacion: Prohibicion total de visitas (-12 pts)');
  }

  if (!restrictions.allowsCooking) {
    penalty += 8;
    notes.push('Penalizacion: Prohibicion de cocinar (-8 pts)');
  }

  if (!restrictions.declaredTransparently) {
    penalty += 25;
    notes.push('Penalizacion critica: Restricciones no declaradas en aviso (-25 pts)');
  }

  return { penalty, bonus, notes };
}

export function calculateCasaScore(property: Property, prefs: UserPreferences): ScoreBreakdown {
  const pScore = normalizePrice(property.price);
  const locScore = normalizeLocation(property.distanceMeters, property.timeMinutesWalk);
  const sScore = normalizeSecurity(property.securityRating);
  const srvScore = normalizeServices(property.services24h);

  const totalWeight = prefs.weightPrice + prefs.weightDistance + prefs.weightSecurity + prefs.weightServices;
  const factor = totalWeight > 0 ? totalWeight : 1;

  const baseWeightedScore = Math.round(
    (pScore * prefs.weightPrice +
      locScore * prefs.weightDistance +
      sScore * prefs.weightSecurity +
      srvScore * prefs.weightServices) / factor
  );

  const { penalty, bonus, notes } = evaluateConditionAdjustments(
    property.restrictions,
    property.hasNaturalLight,
    property.sizeSqm
  );

  const naturalLightBonus = property.hasNaturalLight ? 8 : 0;
  const freeEntryBonus = property.restrictions.freeEntry24h ? 5 : 0;
  const finalScore = Math.max(0, Math.min(100, baseWeightedScore + bonus - penalty));

  return {
    priceScore: pScore,
    locationScore: locScore,
    securityScore: sScore,
    servicesScore: srvScore,
    naturalLightBonus,
    freeEntryBonus,
    restrictionPenalty: penalty,
    baseWeightedScore,
    finalScore,
    explanationNotes: notes,
  };
}