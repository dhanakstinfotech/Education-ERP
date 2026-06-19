import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnvFile(name) {
  const path = join(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

function resolveConnectionString() {
  const direct =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL;
  if (direct) return direct;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD;
  if (!supabaseUrl || !dbPassword) return null;

  const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) return null;

  return `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`;
}

const connectionString = resolveConnectionString();

if (!connectionString) {
  console.error('Database connection not configured.');
  console.error('');
  console.error('Add ONE of the following to your .env file:');
  console.error('  DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres');
  console.error('  SUPABASE_DB_PASSWORD=[your database password]  (uses VITE_SUPABASE_URL automatically)');
  console.error('');
  console.error('Or run the SQL manually in Supabase Dashboard → SQL Editor:');
  console.error('  supabase/migrations/20260619120000_add_arrear_fee_status.sql');
  process.exit(1);
}

const sql = readFileSync(
  join(root, 'supabase/migrations/20260619120000_add_arrear_fee_status.sql'),
  'utf8',
);

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log('Migration applied: arrear_registrations.fee_status is ready.');
  console.log('Refresh the app in your browser.');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
