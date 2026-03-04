// Simple localStorage wrapper for Skyway Suites
// We'll expand this as we add features

const STORAGE_PREFIX = 'skyway_';

// Helper to get storage key
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

// Generic storage operations
export function setItem<T>(key: string, value: T): void {
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
    // Only clear Skyway Suites items
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

// We'll add specific feature storage functions as we build features
// For now, keeping it minimal and clean
