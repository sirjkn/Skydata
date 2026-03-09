import pg from 'pg';

const { Pool } = pg;

// Neon connection configuration
const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_BJ6A0OlwtZbk@ep-young-fog-a41mknt8-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

let pool: pg.Pool | null = null;

/**
 * Get or create a singleton Neon PostgreSQL connection pool
 */
export function getNeonPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: NEON_CONNECTION_STRING,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle Neon client', err);
    });
  }

  return pool;
}

/**
 * Execute a query against Neon database
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const client = getNeonPool();
  
  try {
    const result = await client.query(text, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Neon query error:', error);
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Neon connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Neon connection failed:', error);
    return false;
  }
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
