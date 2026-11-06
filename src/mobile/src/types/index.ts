// src/mobile/src/types/index.ts

export interface PropertyPhotos {
  facadeUri: string;
  roomUri: string;
  bathroomUri: string;
  windowUri: string;
}

export interface RoomRestrictions {
  freeEntry24h: boolean;
  hasCurfew: boolean;
  curfewHour?: number;
  allowsVisitors: boolean;
  allowsCooking: boolean;
  petFriendly: boolean;
  declaredTransparently: boolean;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  sizeSqm: number;
  distanceMeters: number;
  timeMinutesWalk: number;
  hasNaturalLight: boolean;
  securityRating: number;
  services24h: {
    water: boolean;
    electricity: boolean;
    internet: boolean;
  };
  restrictions: RoomRestrictions;
  landlordVerified: boolean;
  realPhotosVerified: boolean;
  photos: PropertyPhotos;
  address: string;
  zone: string;
}

export interface UserPreferences {
  weightPrice: number;
  weightDistance: number;
  weightSecurity: number;
  weightServices: number;
}

export interface ScoreBreakdown {
  priceScore: number;
  locationScore: number;
  securityScore: number;
  servicesScore: number;
  naturalLightBonus: number;
  freeEntryBonus: number;
  restrictionPenalty: number;
  baseWeightedScore: number;
  finalScore: number;
  explanationNotes: string[];
}