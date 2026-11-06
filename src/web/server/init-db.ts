import pg from 'pg';
import { DATABASE_URL, pool } from './db';
import { sembrar } from './sembrar';

/** Crea la base de datos si no existe, aplica el esquema y carga los datos de ejemplo. */
const url = new URL(DATABASE_URL);
const nombre = decodeURIComponent(url.pathname.slice(1));
const admin = new URL(DATABASE_URL);
admin.pathname = '/postgres';

try {
  const c = new pg.Client({ connectionString: admin.toString() });
  await c.connect();
  const existe = await c.query('select 1 from pg_database where datname = $1', [nombre]);
  if (!existe.rowCount) {
    await c.query(`create database "${nombre.replace(/"/g, '""')}"`);
    console.log(`Base de datos "${nombre}" creada.`);
  }
  await c.end();

  const db = await pool.connect();
  await sembrar(db);
  const { rows } = await db.query('select (select count(*) from usuario) u, (select count(*) from cuarto) c, (select count(*) from foto) f');
  db.release();
  console.log(`Listo: ${rows[0].u} usuarios, ${rows[0].c} cuartos y ${rows[0].f} fotos en "${nombre}".`);
} catch (e) {
  console.error(`No se pudo preparar la base de datos (${DATABASE_URL}).`);
  console.error('Revisa que PostgreSQL esté encendido: brew services start postgresql@18');
  console.error((e as Error).message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
