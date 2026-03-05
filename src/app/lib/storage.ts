/**
 * ⚠️ DEPRECATED - DO NOT USE FOR DATA PERSISTENCE ⚠️
 * 
 * This file is deprecated as of Version 3.0.
 * All data operations now use Supabase cloud storage.
 * 
 * Use /src/lib/supabaseData.ts instead for all data operations.
 * 
 * This file is kept only for:
 * 1. Temporary session data (e.g., form state, UI preferences)
 * 2. Client-side caching
 * 
 * DO NOT store important application data here!
 */

const STORAGE_PREFIX = 'skyway_temp_';

// Helper to get storage key
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

// Generic storage operations - FOR TEMPORARY DATA ONLY
export function setItem<T>(key: string, value: T): void {
  console.warn('⚠️ localStorage is deprecated. Use Supabase for data persistence.');
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: getKey(key),
      newValue: JSON.stringify(value),
    }));
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
  }
}

export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(getKey(key));
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(getKey(key));
    window.dispatchEvent(new StorageEvent('storage', {
      key: getKey(key),
      newValue: null,
    }));
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
  }
}

export function clear(): void {
  try {
    // Only clear Skyway Suites temporary items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}
