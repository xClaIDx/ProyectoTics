import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import type { PoolClient } from 'pg';
import { CUARTOS_SEED, USUARIOS_SEED } from '../src/data/seed';
import { guardarCuartoDb, hashPassword, UPLOADS_DIR } from './cuartos';

/** Borra y vuelve a crear las tablas, y carga los usuarios y cuartos de ejemplo (contraseña demo123). */
export async function sembrar(db: PoolClient): Promise<void> {
  const schema = await readFile(path.join(import.meta.dirname, 'schema.sql'), 'utf8');
  await db.query('begin');
  try {
    await db.query('set local client_min_messages = warning');
    await db.query(schema);
    const ph = await hashPassword('demo123');
    for (const u of USUARIOS_SEED) {
      await db.query('insert into usuario values ($1,$2,$3,$4,$5,$6,$7)', [u.id, u.nombre, u.correo, u.rol, u.telefono ?? null, ph, u.creadoEn]);
    }
    for (const c of CUARTOS_SEED) await guardarCuartoDb(db, c);
    await db.query('commit');
  } catch (e) {
    await db.query('rollback');
    throw e;
  }
  await rm(UPLOADS_DIR, { recursive: true, force: true });
}
