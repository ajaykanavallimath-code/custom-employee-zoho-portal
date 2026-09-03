const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const env = require('./env');

let pool = null;
let memDb = null;
let isEmulated = false;

/**
 * Initialize PostgreSQL connection pool or fallback to in-memory PostgreSQL engine
 */
async function initializeDatabase() {
  if (pool || memDb) return;

  // Try real PostgreSQL connection first
  try {
    const candidatePool = new Pool({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 2500,
      idleTimeoutMillis: 10000,
      max: 20
    });

    // Test connectivity
    const client = await candidatePool.connect();
    await client.query('SELECT 1');
    client.release();

    pool = candidatePool;
    isEmulated = false;
    console.log('✅ Connected to live PostgreSQL database at:', env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  } catch (err) {
    console.warn('⚠️  Live PostgreSQL connection unavailable (' + err.message + ').');
    console.log('ℹ️  Initializing high-fidelity in-memory PostgreSQL engine (pg-mem) for seamless standalone execution...');

    try {
      const { newDb } = require('pg-mem');
      const db = newDb({
        autoCreateForeignKeyIndices: true
      });

      // Register standard PG functions
      db.public.registerFunction({
        name: 'current_timestamp',
        args: [],
        returns: db.public.getType('timestamp with time zone'),
        implementation: () => new Date()
      });

      const pgAdapter = db.adapters.createPg();
      pool = new pgAdapter.Pool();
      memDb = db;
      isEmulated = true;
      console.log('✅ In-memory PostgreSQL engine active and ready.');
    } catch (memErr) {
      console.error('❌ Failed to initialize database adapter:', memErr);
      throw memErr;
    }
  }

  // Auto-run schema migrations
  await runMigrations();
}

/**
 * Executes schema.sql against the active database
 */
async function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema statements
      if (isEmulated && memDb) {
        // Run against pg-mem
        memDb.public.none(schemaSql);
      } else if (pool) {
        await pool.query(schemaSql);
      }
      console.log('✅ Database schema verified/migrated successfully.');
    }
  } catch (err) {
    console.error('❌ Error executing database migrations:', err.message);
    throw err;
  }
}

/**
 * Execute parameterized query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 */
async function query(text, params = []) {
  if (!pool && !memDb) {
    await initializeDatabase();
  }
  
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL === 'true') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', { text, error: error.message });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
async function getClient() {
  if (!pool && !memDb) {
    await initializeDatabase();
  }
  return await pool.connect();
}

function isUsingEmulation() {
  return isEmulated;
}

module.exports = {
  query,
  getClient,
  initializeDatabase,
  runMigrations,
  isUsingEmulation
};
