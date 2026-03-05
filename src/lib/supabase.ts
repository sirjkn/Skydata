import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Hard-coded default Supabase credentials
export const DEFAULT_SUPABASE_URL = `https://${projectId}.supabase.co`;
export const DEFAULT_SUPABASE_ANON_KEY = publicAnonKey;

let supabaseInstance: SupabaseClient | null = null;
let currentUrl: string | null = null;
let currentKey: string | null = null;

// Initialize with default credentials on module load
supabaseInstance = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
currentUrl = DEFAULT_SUPABASE_URL;
currentKey = DEFAULT_SUPABASE_ANON_KEY;

/**
 * Get or create a singleton Supabase client instance
 * This prevents multiple GoTrueClient instances warning
 * If no credentials provided, returns the default instance
 */
export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  // If credentials are provided, create/update the instance
  if (url && key) {
    // Only create a new instance if credentials actually changed
    if (!supabaseInstance || currentUrl !== url || currentKey !== key) {
      supabaseInstance = createClient(url, key);
      currentUrl = url;
      currentKey = key;
    }
    return supabaseInstance;
  }
  
  // Return existing instance (which is now initialized with defaults)
  return supabaseInstance;
}

/**
 * Clear the Supabase client instance
 * Useful when logging out or changing credentials
 */
export function clearSupabaseClient() {
  supabaseInstance = null;
  currentUrl = null;
  currentKey = null;
}
