/**
 * Neon Database Direct Connection Configuration
 * Hardcoded connection settings for direct database access
 */

// Neon connection string (hardcoded)
const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_BJ6A0OlwtZbk@ep-young-fog-a41mknt8-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Parse connection details for HTTP API usage
const parseConnectionString = (connStr: string) => {
  try {
    const url = new URL(connStr.replace('postgresql://', 'https://'));
    return {
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      host: url.hostname,
      database: url.pathname.slice(1).split('?')[0],
    };
  } catch (error) {
    console.error('Error parsing connection string:', error);
    return null;
  }
};

const NEON_CONFIG = parseConnectionString(NEON_CONNECTION_STRING);

// Execute query using Neon's REST API
export async function executeNeonQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  if (!NEON_CONFIG) {
    throw new Error('Neon configuration not initialized');
  }

  // Use Neon's SQL over HTTP API
  // Format: https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}/databases/{database_name}/query
  // For direct connection, we'll use the connection string via a proxy or direct SQL execution
  
  // Since we're in a browser environment, we need to use the backend API instead
  throw new Error('Direct Neon connection not available in browser environment. Use API fallback.');
}

// Helper function to check if Neon connection is working
export async function testNeonConnection(): Promise<boolean> {
  console.log('⚠️ Direct Neon database connection not available in browser environment');
  console.log('💡 Using API and mock data fallback instead');
  return false;
}

// Export the connection string for reference
export const NEON_CONNECTION_STRING_EXPORT = NEON_CONNECTION_STRING;
export const NEON_CONFIG_EXPORT = NEON_CONFIG;