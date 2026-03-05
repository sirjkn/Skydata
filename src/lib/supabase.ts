import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create a singleton Supabase client instance
 * This prevents multiple GoTrueClient instances warning
 */
export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  // If credentials are provided, create/update the instance
  if (url && key) {
    // Only create a new instance if URL or key changed
    if (!supabaseInstance || 
        (supabaseInstance as any).supabaseUrl !== url || 
        (supabaseInstance as any).supabaseKey !== key) {
      supabaseInstance = createClient(url, key);
    }
    return supabaseInstance;
  }
  
  // Return existing instance if available
  return supabaseInstance;
}

/**
 * Clear the Supabase client instance
 * Useful when logging out or changing credentials
 */
export function clearSupabaseClient() {
  supabaseInstance = null;
}
