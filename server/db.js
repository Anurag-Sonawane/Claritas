import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { runMigration } from './migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isPostgres = Boolean(
  env.DATABASE_URL &&
  (env.DATABASE_URL.startsWith('postgres://') || env.DATABASE_URL.startsWith('postgresql://'))
);

let pool = null;
let sqlite = null;

if (isPostgres) {
  const { Pool } = pg;
  const isSsl = env.NODE_ENV === 'production' || env.DATABASE_URL.includes('sslmode=require');
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });
} else {
  const dbPath = path.join(__dirname, 'claritas.sqlite');
  sqlite = new DatabaseSync(dbPath);
  try {
    sqlite.exec('PRAGMA foreign_keys = ON;');
    sqlite.exec('PRAGMA busy_timeout = 5000;');
    sqlite.exec('PRAGMA journal_mode = WAL;');
  } catch (err) {
    console.warn('SQLite PRAGMA notice:', err.message);
  }
}

function normalizeParams(params) {
  if (params === undefined || params === null) return [];
  if (Array.isArray(params)) return params;
  return [params];
}

function toPgQuery(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

export const dbProvider = isPostgres ? 'postgres' : 'sqlite';

export const db = {
  provider: dbProvider,

  /**
   * Query multiple rows
   * @param {string} sql 
   * @param {any[]} [params] 
   * @returns {Promise<any[]>}
   */
  async all(sql, params = []) {
    const norm = normalizeParams(params);
    if (isPostgres) {
      const res = await pool.query(toPgQuery(sql), norm);
      return res.rows;
    } else {
      return sqlite.prepare(sql).all(...norm);
    }
  },

  /**
   * Query a single row
   * @param {string} sql 
   * @param {any[]} [params] 
   * @returns {Promise<any|null>}
   */
  async get(sql, params = []) {
    const norm = normalizeParams(params);
    if (isPostgres) {
      const res = await pool.query(toPgQuery(sql), norm);
      return res.rows[0] || null;
    } else {
      return sqlite.prepare(sql).get(...norm) || null;
    }
  },

  /**
   * Execute an INSERT, UPDATE, or DELETE
   * @param {string} sql 
   * @param {any[]} [params] 
   * @returns {Promise<{ changes: number, rowCount: number, lastInsertRowid?: any }>}
   */
  async run(sql, params = []) {
    const norm = normalizeParams(params);
    if (isPostgres) {
      const res = await pool.query(toPgQuery(sql), norm);
      return {
        changes: res.rowCount || 0,
        rowCount: res.rowCount || 0,
        lastInsertRowid: res.rows?.[0]?.id || null,
      };
    } else {
      const info = sqlite.prepare(sql).run(...norm);
      return {
        changes: info.changes,
        rowCount: info.changes,
        lastInsertRowid: info.lastInsertRowid,
      };
    }
  },

  /**
   * Execute raw multi-statement SQL
   * @param {string} sql 
   * @returns {Promise<void>}
   */
  async exec(sql) {
    if (isPostgres) {
      await pool.query(sql);
    } else {
      sqlite.exec(sql);
    }
  },

  /**
   * Run operations within a transaction
   * @param {(tx: { get: Function, all: Function, run: Function }) => Promise<any>} callback 
   */
  async transaction(callback) {
    if (isPostgres) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const tx = {
          async get(sql, params = []) {
            const res = await client.query(toPgQuery(sql), normalizeParams(params));
            return res.rows[0] || null;
          },
          async all(sql, params = []) {
            const res = await client.query(toPgQuery(sql), normalizeParams(params));
            return res.rows;
          },
          async run(sql, params = []) {
            const res = await client.query(toPgQuery(sql), normalizeParams(params));
            return { changes: res.rowCount || 0, rowCount: res.rowCount || 0 };
          }
        };
        const result = await callback(tx);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      sqlite.exec('BEGIN TRANSACTION;');
      try {
        const tx = {
          get: async (sql, params = []) => sqlite.prepare(sql).get(...normalizeParams(params)) || null,
          all: async (sql, params = []) => sqlite.prepare(sql).all(...normalizeParams(params)),
          run: async (sql, params = []) => sqlite.prepare(sql).run(...normalizeParams(params)),
        };
        const result = await callback(tx);
        sqlite.exec('COMMIT;');
        return result;
      } catch (err) {
        sqlite.exec('ROLLBACK;');
        throw err;
      }
    }
  },

  /**
   * Backward-compatibility statement preparer
   */
  prepare(sql) {
    if (isPostgres) {
      return {
        all: async (...args) => db.all(sql, args.flat()),
        get: async (...args) => db.get(sql, args.flat()),
        run: async (...args) => db.run(sql, args.flat()),
      };
    } else {
      const stmt = sqlite.prepare(sql);
      return {
        all: (...args) => stmt.all(...args.flat()),
        get: (...args) => stmt.get(...args.flat()) || null,
        run: (...args) => stmt.run(...args.flat()),
      };
    }
  }
};

export async function initDatabase() {
  await runMigration();
}

export async function runTransaction(callback) {
  return db.transaction(callback);
}
