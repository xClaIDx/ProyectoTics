import pg from 'pg';

try {
  process.loadEnvFile();
} catch {
  // Sin archivo .env: se usan los valores por defecto.
}

/** Base local por defecto: PostgreSQL en este equipo, con tu usuario del sistema. */
export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/casascore';
export const API_PORT = Number(process.env.API_PORT ?? 3001);

export const pool = new pg.Pool({ connectionString: DATABASE_URL });
