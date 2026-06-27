const express = require('express');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:secret@db:5432/app';

const pool = new Pool({ connectionString: DATABASE_URL });

// Postgres takes a few seconds to accept connections after the db container
// starts (dependsOn guarantees start order, not readiness), so retry on boot.
async function initDb(retries = 30) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS visits (id serial PRIMARY KEY, seen_at timestamptz DEFAULT now())`);
      console.log('database ready');
      return;
    } catch (err) {
      console.log(`waiting for database (${attempt}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('database not reachable');
}

const app = express();

// Liveness probe — does not touch the database.
app.get('/health', (_req, res) => res.json({ ok: true }));

// Proves the private network: the API reads/writes Postgres by the service name `db`.
app.get('/', async (_req, res) => {
  try {
    await pool.query('INSERT INTO visits DEFAULT VALUES');
    const { rows } = await pool.query('SELECT count(*)::int AS count FROM visits');
    res.json({ message: 'Hello from the ZeroServer Community Cloud demo', visits: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`demo api listening on ${PORT}`)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
