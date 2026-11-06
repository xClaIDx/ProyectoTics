import * as SQLite from 'expo-sqlite';
import { Property } from '../types';

const db = SQLite.openDatabaseSync('casascore_local.db');

export function initDatabase(): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      sizeSqm REAL NOT NULL,
      distanceMeters REAL NOT NULL,
      timeMinutesWalk REAL NOT NULL,
      hasNaturalLight INTEGER NOT NULL,
      securityRating REAL NOT NULL,
      water24h INTEGER NOT NULL,
      electricity24h INTEGER NOT NULL,
      internet24h INTEGER NOT NULL,
      freeEntry24h INTEGER NOT NULL,
      hasCurfew INTEGER NOT NULL,
      curfewHour INTEGER,
      allowsVisitors INTEGER NOT NULL,
      allowsCooking INTEGER NOT NULL,
      petFriendly INTEGER NOT NULL,
      declaredTransparently INTEGER NOT NULL,
      landlordVerified INTEGER NOT NULL,
      realPhotosVerified INTEGER NOT NULL,
      facadeUri TEXT NOT NULL,
      roomUri TEXT NOT NULL,
      bathroomUri TEXT NOT NULL,
      windowUri TEXT NOT NULL,
      address TEXT NOT NULL,
      zone TEXT NOT NULL
    );
  `);

  const countResult = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM properties;'
  );

  if (countResult && countResult.count === 0) {
    seedInitialProperties();
  }
}

export function resetAndSeedDatabase(): void {
  db.execSync('DROP TABLE IF EXISTS properties;');
  initDatabase();
}

export function insertProperty(property: Property): boolean {
  try {
    db.runSync(
      `INSERT INTO properties (
        id, title, price, sizeSqm, distanceMeters, timeMinutesWalk, hasNaturalLight,
        securityRating, water24h, electricity24h, internet24h, freeEntry24h,
        hasCurfew, curfewHour, allowsVisitors, allowsCooking, petFriendly, declaredTransparently,
        landlordVerified, realPhotosVerified, facadeUri, roomUri, bathroomUri, windowUri,
        address, zone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        property.id,
        property.title,
        Number(property.price),
        Number(property.sizeSqm),
        Number(property.distanceMeters),
        Number(property.timeMinutesWalk),
        property.hasNaturalLight ? 1 : 0,
        Number(property.securityRating),
        property.services24h.water ? 1 : 0,
        property.services24h.electricity ? 1 : 0,
        property.services24h.internet ? 1 : 0,
        property.restrictions.freeEntry24h ? 1 : 0,
        property.restrictions.hasCurfew ? 1 : 0,
        property.restrictions.curfewHour ?? null,
        property.restrictions.allowsVisitors ? 1 : 0,
        property.restrictions.allowsCooking ? 1 : 0,
        property.restrictions.petFriendly ? 1 : 0,
        property.restrictions.declaredTransparently ? 1 : 0,
        property.landlordVerified ? 1 : 0,
        property.realPhotosVerified ? 1 : 0,
        property.photos.facadeUri,
        property.photos.roomUri,
        property.photos.bathroomUri,
        property.photos.windowUri,
        property.address,
        property.zone,
      ]
    );
    return true;
  } catch (error) {
    console.error('Error insertProperty SQLite:', error);
    return false;
  }
}

function seedInitialProperties(): void {
  const seedList: Property[] = [
    {
      id: 'puno-ejemplo-01',
      title: 'Habitacion Universitaria Frente a Puerta 1',
      price: 240,
      sizeSqm: 14,
      distanceMeters: 120,
      timeMinutesWalk: 2,
      hasNaturalLight: true,
      securityRating: 4.5,
      services24h: { water: true, electricity: true, internet: true },
      restrictions: {
        freeEntry24h: true,
        hasCurfew: false,
        allowsVisitors: true,
        allowsCooking: true,
        petFriendly: false,
        declaredTransparently: true,
      },
      landlordVerified: true,
      realPhotosVerified: true,
      photos: {
        facadeUri: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
        roomUri: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
        bathroomUri: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
        windowUri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500',
      },
      address: 'Av. Floral 412',
      zone: 'Entorno UNA Puno',
    },
    {
      id: 'puno-ejemplo-02',
      title: 'Minidepartamento Independiente para Estudiante',
      price: 480,
      sizeSqm: 22,
      distanceMeters: 600,
      timeMinutesWalk: 8,
      hasNaturalLight: true,
      securityRating: 4.2,
      services24h: { water: true, electricity: true, internet: true },
      restrictions: {
        freeEntry24h: true,
        hasCurfew: false,
        allowsVisitors: true,
        allowsCooking: true,
        petFriendly: true,
        declaredTransparently: true,
      },
      landlordVerified: true,
      realPhotosVerified: true,
      photos: {
        facadeUri: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500',
        roomUri: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
        bathroomUri: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
        windowUri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500',
      },
      address: 'Jr. Los Incas 230',
      zone: 'Barrio Laykakota',
    },
    {
      id: 'puno-ejemplo-03',
      title: 'Cuarto Economico con Restriccion Oculta',
      price: 160,
      sizeSqm: 10,
      distanceMeters: 1100,
      timeMinutesWalk: 16,
      hasNaturalLight: false,
      securityRating: 3.0,
      services24h: { water: false, electricity: true, internet: false },
      restrictions: {
        freeEntry24h: false,
        hasCurfew: true,
        curfewHour: 20,
        allowsVisitors: false,
        allowsCooking: false,
        petFriendly: false,
        declaredTransparently: false,
      },
      landlordVerified: false,
      realPhotosVerified: false,
      photos: {
        facadeUri: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500',
        roomUri: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500',
        bathroomUri: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
        windowUri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500',
      },
      address: 'Jr. Cahuide 780',
      zone: 'Barrio Bellavista',
    },
    {
      id: 'puno-ejemplo-04',
      title: 'Habitacion Amplia Amoblada p/ Tesista',
      price: 320,
      sizeSqm: 18,
      distanceMeters: 380,
      timeMinutesWalk: 5,
      hasNaturalLight: true,
      securityRating: 4.8,
      services24h: { water: true, electricity: true, internet: true },
      restrictions: {
        freeEntry24h: false,
        hasCurfew: true,
        curfewHour: 23,
        allowsVisitors: true,
        allowsCooking: true,
        petFriendly: false,
        declaredTransparently: true,
      },
      landlordVerified: true,
      realPhotosVerified: true,
      photos: {
        facadeUri: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
        roomUri: 'https://images.unsplash.com/photo-1540518614846-7ede433c4b63?w=500',
        bathroomUri: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
        windowUri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500',
      },
      address: 'Av. Sesquicentenario 305',
      zone: 'Facultad de Estadistica',
    },
    {
      id: 'puno-ejemplo-05',
      title: 'Cuarto en 2do Piso sin Visitas',
      price: 200,
      sizeSqm: 12,
      distanceMeters: 800,
      timeMinutesWalk: 12,
      hasNaturalLight: true,
      securityRating: 3.5,
      services24h: { water: true, electricity: true, internet: true },
      restrictions: {
        freeEntry24h: false,
        hasCurfew: true,
        curfewHour: 21,
        allowsVisitors: false,
        allowsCooking: true,
        petFriendly: false,
        declaredTransparently: true,
      },
      landlordVerified: true,
      realPhotosVerified: false,
      photos: {
        facadeUri: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500',
        roomUri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500',
        bathroomUri: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
        windowUri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500',
      },
      address: 'Jr. Huascar 512',
      zone: 'Centro / Huascar',
    },
  ];

  for (const item of seedList) {
    insertProperty(item);
  }
}

export function getAllProperties(): Property[] {
  const rows = db.getAllSync<any>('SELECT * FROM properties;');

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    price: row.price,
    sizeSqm: row.sizeSqm,
    distanceMeters: row.distanceMeters,
    timeMinutesWalk: row.timeMinutesWalk,
    hasNaturalLight: row.hasNaturalLight === 1,
    securityRating: row.securityRating,
    services24h: {
      water: row.water24h === 1,
      electricity: row.electricity24h === 1,
      internet: row.internet24h === 1,
    },
    restrictions: {
      freeEntry24h: row.freeEntry24h === 1,
      hasCurfew: row.hasCurfew === 1,
      curfewHour: row.curfewHour !== null ? row.curfewHour : undefined,
      allowsVisitors: row.allowsVisitors === 1,
      allowsCooking: row.allowsCooking === 1,
      petFriendly: row.petFriendly === 1,
      declaredTransparently: row.declaredTransparently === 1,
    },
    landlordVerified: row.landlordVerified === 1,
    realPhotosVerified: row.realPhotosVerified === 1,
    photos: {
      facadeUri: row.facadeUri,
      roomUri: row.roomUri,
      bathroomUri: row.bathroomUri,
      windowUri: row.windowUri,
    },
    address: row.address,
    zone: row.zone,
  }));
}