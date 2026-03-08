/**
 * Cache Manager for Skyway Suites
 * Caches static content (images, categories, settings) for faster loading
 * ALL data operations (bookings, payments, customers) go directly to DB
 */

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  CATEGORIES: 60 * 60 * 1000, // 60 minutes (categories rarely change)
  SETTINGS: 30 * 60 * 1000, // 30 minutes (settings might change occasionally)
  PROPERTIES: 30 * 60 * 1000, // 30 minutes - EXTENDED for faster loading ⚡
  FEATURES: 60 * 60 * 1000, // 60 minutes (features rarely change)
  IMAGES: 60 * 60 * 1000, // 60 minutes (images rarely change)
};

class CacheManager {
  private prefix = 'skyway_cache_';

  /**
   * Set item in cache with TTL
   */
  set(key: string, data: any, ttl: number): void {
    try {
      const cacheItem: CacheItem = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Cache set failed:', error);
      // Silently fail - app continues without cache
    }
  }

  /**
   * Get item from cache if not expired
   */
  get(key: string): any | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const cacheItem: CacheItem = JSON.parse(item);
      const now = Date.now();

      // Check if cache has expired
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  /**
   * Delete specific cache item
   */
  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Cache delete failed:', error);
    }
  }

  /**
   * Clear all cache items
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cache cleared successfully');
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { totalItems: number; totalSize: number } {
    try {
      const keys = Object.keys(localStorage);
      let totalSize = 0;
      let totalItems = 0;

      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += item.length;
            totalItems++;
          }
        }
      });

      return { totalItems, totalSize };
    } catch (error) {
      console.warn('Cache stats failed:', error);
      return { totalItems: 0, totalSize: 0 };
    }
  }

  /**
   * Invalidate cache items by pattern
   */
  invalidatePattern(pattern: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix) && key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache invalidate pattern failed:', error);
    }
  }

  /**
   * Invalidate specific cache key (alias for delete)
   */
  invalidate(key: string): void {
    this.delete(key);
  }

  /**
   * Get cache timestamp for a specific key
   */
  getCacheTimestamp(key: string): number | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const cacheItem: CacheItem = JSON.parse(item);
      return cacheItem.timestamp;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if cache exists and is valid
   */
  isValid(key: string): boolean {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return false;

      const cacheItem: CacheItem = JSON.parse(item);
      const now = Date.now();

      return now - cacheItem.timestamp <= cacheItem.ttl;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager();
export { CACHE_TTL };

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cacheManager.getStats();
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cacheManager.clearAll();
}

// Image cache helper using browser's Cache API
export const imageCache = {
  /**
   * Preload and cache images
   */
  async preloadImages(imageUrls: string[]): Promise<void> {
    if (!('caches' in window)) {
      console.warn('Cache API not supported');
      return;
    }

    try {
      const cache = await caches.open('skyway-images-v1');
      const urls = imageUrls.filter((url) => url && url.trim() !== '');

      await Promise.all(
        urls.map(async (url) => {
          try {
            const cachedResponse = await cache.match(url);
            if (!cachedResponse) {
              // Fetch and cache the image
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response);
              }
            }
          } catch (error) {
            console.warn(`Failed to cache image: ${url}`, error);
          }
        })
      );
    } catch (error) {
      console.warn('Image preload failed:', error);
    }
  },

  /**
   * Clear image cache
   */
  async clearImages(): Promise<void> {
    if (!('caches' in window)) return;

    try {
      await caches.delete('skyway-images-v1');
      console.log('Image cache cleared');
    } catch (error) {
      console.warn('Clear image cache failed:', error);
    }
  },
};