/**
 * Cached Supabase Data Layer for Skyway Suites
 * 
 * CACHING STRATEGY:
 * - Categories: Cached (30 min) - rarely change
 * - Settings: Cached (15 min) - occasionally change
 * - Properties: Cached (5 min) - update frequently
 * - Images: Cached via Cache API (60 min)
 * 
 * DIRECT DB ACCESS (NO CACHING):
 * - All write operations (create, update, delete)
 * - Bookings (real-time critical)
 * - Payments (real-time critical)
 * - Customers (real-time critical)
 * - Activity Logs (real-time critical)
 * - Auth operations (security critical)
 */

import * as supabaseData from './supabaseData';
import { cacheManager, CACHE_TTL, imageCache } from './cacheManager';

// Export cache manager for external use
export { cacheManager } from './cacheManager';

// ============================================================================
// CACHED READ OPERATIONS WITH BACKGROUND SYNC
// ============================================================================

/**
 * Fetch properties with instant cache load + background refresh
 */
export async function fetchProperties(forceRefresh = false): Promise<supabaseData.Property[]> {
  const cacheKey = 'properties';
  const cached = cacheManager.get(cacheKey);

  // Return cached data immediately if available and not forcing refresh
  if (cached && !forceRefresh) {
    console.log('📦 Properties loaded from cache (instant)');
    
    // Background refresh if cache is older than 10 minutes
    const cacheTimestamp = cacheManager.getCacheTimestamp(cacheKey);
    const ageInMinutes = cacheTimestamp ? (Date.now() - cacheTimestamp) / (1000 * 60) : 999;
    
    if (ageInMinutes > 10) {
      console.log('🔄 Background refresh triggered (cache > 10 min)');
      // Non-blocking background refresh
      supabaseData.fetchProperties()
        .then(freshData => {
          cacheManager.set(cacheKey, freshData, CACHE_TTL.PROPERTIES);
          console.log('✅ Properties refreshed in background');
        })
        .catch(err => console.warn('Background refresh failed:', err));
    }
    
    // Preload images in background
    const imageUrls: string[] = [];
    cached.forEach((prop: any) => {
      if (prop.photos) {
        const photos = typeof prop.photos === 'string' ? JSON.parse(prop.photos) : prop.photos;
        Object.values(photos).flat().forEach((url: any) => {
          if (url) imageUrls.push(url);
        });
      }
    });
    imageCache.preloadImages(imageUrls);
    
    return cached;
  }

  console.log('🌐 Fetching properties from database');
  const data = await supabaseData.fetchProperties();
  cacheManager.set(cacheKey, data, CACHE_TTL.PROPERTIES);
  
  // Preload images in background
  const imageUrls: string[] = [];
  data.forEach((prop) => {
    if (prop.photos) {
      const photos = typeof prop.photos === 'string' ? JSON.parse(prop.photos) : prop.photos;
      Object.values(photos).flat().forEach((url: any) => {
        if (url) imageUrls.push(url);
      });
    }
  });
  imageCache.preloadImages(imageUrls);
  
  return data;
}

/**
 * Fetch property by ID with caching
 */
export async function fetchPropertyById(propertyId: number): Promise<supabaseData.Property | null> {
  const cacheKey = `property_${propertyId}`;
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log(`📦 Property ${propertyId} loaded from cache`);
    
    // Preload property images in background
    if (cached.photos) {
      const photos = typeof cached.photos === 'string' ? JSON.parse(cached.photos) : cached.photos;
      const imageUrls: string[] = [];
      Object.values(photos).flat().forEach((url: any) => {
        if (url) imageUrls.push(url);
      });
      imageCache.preloadImages(imageUrls);
    }
    
    return cached;
  }

  console.log(`🌐 Fetching property ${propertyId} from database`);
  const data = await supabaseData.fetchPropertyById(propertyId);
  if (data) {
    cacheManager.set(cacheKey, data, CACHE_TTL.PROPERTIES);
    
    // Preload property images in background
    if (data.photos) {
      const photos = typeof data.photos === 'string' ? JSON.parse(data.photos) : data.photos;
      const imageUrls: string[] = [];
      Object.values(photos).flat().forEach((url: any) => {
        if (url) imageUrls.push(url);
      });
      imageCache.preloadImages(imageUrls);
    }
  }
  return data;
}

/**
 * Fetch categories with caching
 */
export async function fetchCategories(): Promise<supabaseData.Category[]> {
  const cacheKey = 'categories';
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log('📦 Categories loaded from cache');
    return cached;
  }

  console.log('🌐 Fetching categories from database');
  const data = await supabaseData.fetchCategories();
  cacheManager.set(cacheKey, data, CACHE_TTL.CATEGORIES);
  return data;
}

/**
 * Fetch settings with caching
 */
export async function fetchSettings(): Promise<supabaseData.Setting[]> {
  const cacheKey = 'settings';
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log('📦 Settings loaded from cache');
    return cached;
  }

  console.log('🌐 Fetching settings from database');
  const data = await supabaseData.fetchSettings();
  cacheManager.set(cacheKey, data, CACHE_TTL.SETTINGS);
  return data;
}

/**
 * Fetch setting by key with caching
 */
export async function fetchSettingByKey(category: string, key: string): Promise<supabaseData.Setting | null> {
  const cacheKey = `setting_${category}_${key}`;
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log(`📦 Setting ${category}.${key} loaded from cache`);
    return cached;
  }

  console.log(`🌐 Fetching setting ${category}.${key} from database`);
  const data = await supabaseData.fetchSettingByKey(category, key);
  if (data) {
    cacheManager.set(cacheKey, data, CACHE_TTL.SETTINGS);
  }
  return data;
}

/**
 * Fetch settings by category with caching
 */
export async function fetchSettingsByCategory(category: string): Promise<supabaseData.Setting[]> {
  const cacheKey = `settings_category_${category}`;
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log(`📦 Settings for category ${category} loaded from cache`);
    return cached;
  }

  console.log(`🌐 Fetching settings for category ${category} from database`);
  const data = await supabaseData.fetchSettingsByCategory(category);
  cacheManager.set(cacheKey, data, CACHE_TTL.SETTINGS);
  return data;
}

/**
 * Fetch menu pages with caching
 */
export async function fetchMenuPages(): Promise<supabaseData.MenuPage[]> {
  const cacheKey = 'menu_pages';
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log('📦 Menu pages loaded from cache');
    return cached;
  }

  console.log('🌐 Fetching menu pages from database');
  const data = await supabaseData.fetchMenuPages();
  cacheManager.set(cacheKey, data, CACHE_TTL.SETTINGS);
  return data;
}

/**
 * Fetch menu page by slug with caching
 */
export async function fetchMenuPageBySlug(slug: string): Promise<supabaseData.MenuPage | null> {
  const cacheKey = `menu_page_${slug}`;
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log(`📦 Menu page ${slug} loaded from cache`);
    return cached;
  }

  console.log(`🌐 Fetching menu page ${slug} from database`);
  const data = await supabaseData.fetchMenuPageBySlug(slug);
  if (data) {
    cacheManager.set(cacheKey, data, CACHE_TTL.SETTINGS);
  }
  return data;
}

/**
 * Fetch features with caching
 */
export async function fetchFeatures(): Promise<supabaseData.Feature[]> {
  const cacheKey = 'features';
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log('📦 Features loaded from cache');
    return cached;
  }

  console.log('🌐 Fetching features from database');
  const data = await supabaseData.fetchFeatures();
  cacheManager.set(cacheKey, data, CACHE_TTL.CATEGORIES);
  return data;
}

// ============================================================================
// DIRECT DB ACCESS - NO CACHING (Real-time critical data)
// ============================================================================

// Bookings - Always real-time
export const fetchBookings = supabaseData.fetchBookings;
export const fetchBookingById = supabaseData.fetchBookingById;
export const fetchBookingsByProperty = supabaseData.fetchBookingsByProperty;
export const fetchBookingsByCustomer = supabaseData.fetchBookingsByCustomer;

// Customers - Always real-time
export const fetchCustomers = supabaseData.fetchCustomers;
export const fetchCustomerById = supabaseData.fetchCustomerById;

// Payments - Always real-time
export const fetchPayments = supabaseData.fetchPayments;
export const fetchPaymentsByBooking = supabaseData.fetchPaymentsByBooking;

// Activity Logs - Always real-time
export const fetchActivityLogs = supabaseData.fetchActivityLogs;

// Auth Users - Always real-time (security critical)
export const fetchAuthUsers = supabaseData.fetchAuthUsers;
export const fetchAuthUserByEmail = supabaseData.fetchAuthUserByEmail;

// ============================================================================
// WRITE OPERATIONS - ALWAYS DIRECT TO DB + CACHE INVALIDATION
// ============================================================================

/**
 * Create property - Invalidate cache after
 */
export async function createProperty(property: Omit<supabaseData.Property, 'property_id' | 'created_at' | 'updated_at'>): Promise<supabaseData.Property> {
  console.log('🌐 Creating property in database');
  const data = await supabaseData.createProperty(property);
  
  // Invalidate properties cache
  cacheManager.delete('properties');
  console.log('🗑️ Properties cache invalidated');
  
  return data;
}

/**
 * Update property - Invalidate cache after
 */
export async function updateProperty(propertyId: number, updates: Partial<supabaseData.Property>): Promise<supabaseData.Property> {
  console.log(`🌐 Updating property ${propertyId} in database`);
  const data = await supabaseData.updateProperty(propertyId, updates);
  
  // Invalidate property caches
  cacheManager.delete('properties');
  cacheManager.delete(`property_${propertyId}`);
  console.log('🗑️ Property cache invalidated');
  
  return data;
}

/**
 * Delete property - Invalidate cache after
 */
export async function deleteProperty(propertyId: number): Promise<void> {
  console.log(`🌐 Deleting property ${propertyId} from database`);
  await supabaseData.deleteProperty(propertyId);
  
  // Invalidate property caches
  cacheManager.delete('properties');
  cacheManager.delete(`property_${propertyId}`);
  console.log('🗑️ Property cache invalidated');
}

/**
 * Create category - Invalidate cache after
 */
export async function createCategory(category: Omit<supabaseData.Category, 'category_id' | 'created_at' | 'updated_at'>): Promise<supabaseData.Category> {
  console.log('🌐 Creating category in database');
  const data = await supabaseData.createCategory(category);
  
  // Invalidate categories cache
  cacheManager.delete('categories');
  console.log('🗑️ Categories cache invalidated');
  
  return data;
}

/**
 * Delete category - Invalidate cache after
 */
export async function deleteCategory(categoryId: number): Promise<void> {
  console.log(`🌐 Deleting category ${categoryId} from database`);
  await supabaseData.deleteCategory(categoryId);
  
  // Invalidate categories cache
  cacheManager.delete('categories');
  console.log('🗑️ Categories cache invalidated');
}

/**
 * Create feature - Invalidate cache after
 */
export async function createFeature(feature: Omit<supabaseData.Feature, 'feature_id' | 'created_at' | 'updated_at'>): Promise<supabaseData.Feature> {
  console.log('🌐 Creating feature in database');
  const data = await supabaseData.createFeature(feature);
  
  // Invalidate features cache
  cacheManager.delete('features');
  console.log('🗑️ Features cache invalidated');
  
  return data;
}

/**
 * Delete feature - Invalidate cache after
 */
export async function deleteFeature(featureId: number): Promise<void> {
  console.log(`🌐 Deleting feature ${featureId} from database`);
  await supabaseData.deleteFeature(featureId);
  
  // Invalidate features cache
  cacheManager.delete('features');
  console.log('🗑️ Features cache invalidated');
}

/**
 * Update setting - Invalidate cache after
 */
export async function updateSetting(settingId: number, value: string): Promise<supabaseData.Setting> {
  console.log(`🌐 Updating setting ${settingId} in database`);
  const data = await supabaseData.updateSetting(settingId, value);
  
  // Invalidate settings caches
  cacheManager.invalidatePattern('setting');
  console.log('🗑️ Settings cache invalidated');
  
  return data;
}

/**
 * Upsert setting - Invalidate cache after
 */
export async function upsertSetting(category: string, key: string, value: string, type: string = 'json'): Promise<supabaseData.Setting> {
  console.log(`🌐 Upserting setting ${category}.${key} in database`);
  const data = await supabaseData.upsertSetting(category, key, value, type);
  
  // Invalidate settings caches
  cacheManager.invalidatePattern('setting');
  console.log('🗑️ Settings cache invalidated');
  
  return data;
}

/**
 * Delete setting - Invalidate cache after
 */
export async function deleteSetting(category: string, key: string): Promise<void> {
  console.log(`🌐 Deleting setting ${category}.${key} from database`);
  await supabaseData.deleteSetting(category, key);
  
  // Invalidate settings caches
  cacheManager.invalidatePattern('setting');
  console.log('🗑️ Settings cache invalidated');
}

/**
 * Create menu page - Invalidate cache after
 */
export async function createMenuPage(page: Omit<supabaseData.MenuPage, 'page_id' | 'created_at' | 'updated_at'>): Promise<supabaseData.MenuPage> {
  console.log('🌐 Creating menu page in database');
  const data = await supabaseData.createMenuPage(page);
  
  // Invalidate menu pages cache
  cacheManager.delete('menu_pages');
  console.log('🗑️ Menu pages cache invalidated');
  
  return data;
}

/**
 * Update menu page - Invalidate cache after
 */
export async function updateMenuPage(pageId: number, updates: Partial<supabaseData.MenuPage>): Promise<supabaseData.MenuPage> {
  console.log(`🌐 Updating menu page ${pageId} in database`);
  const data = await supabaseData.updateMenuPage(pageId, updates);
  
  // Invalidate menu pages cache
  cacheManager.delete('menu_pages');
  cacheManager.invalidatePattern('menu_page_');
  console.log('🗑️ Menu pages cache invalidated');
  
  return data;
}

/**
 * Delete menu page - Invalidate cache after
 */
export async function deleteMenuPage(pageId: number): Promise<void> {
  console.log(`🌐 Deleting menu page ${pageId} from database`);
  await supabaseData.deleteMenuPage(pageId);
  
  // Invalidate menu pages cache
  cacheManager.delete('menu_pages');
  cacheManager.invalidatePattern('menu_page_');
  console.log('🗑️ Menu pages cache invalidated');
}

// All booking write operations - Direct to DB
export const createBooking = supabaseData.createBooking;
export const updateBooking = supabaseData.updateBooking;
export const deleteBooking = supabaseData.deleteBooking;

// All customer write operations - Direct to DB
export const createCustomer = supabaseData.createCustomer;
export const updateCustomer = supabaseData.updateCustomer;
export const deleteCustomer = supabaseData.deleteCustomer;

// All payment write operations - Direct to DB
export const createPayment = supabaseData.createPayment;
export const deletePayment = supabaseData.deletePayment;

// Activity logs - Direct to DB
export const createActivityLog = supabaseData.createActivityLog;
export const deleteActivityLogs = supabaseData.deleteActivityLogs;

// Clear all operations - Direct to DB
export const clearAllProperties = supabaseData.clearAllProperties;
export const clearAllCustomers = supabaseData.clearAllCustomers;
export const clearAllBookings = supabaseData.clearAllBookings;
export const clearAllPayments = supabaseData.clearAllPayments;

// Auth operations - Direct to DB (security critical)
export const createAuthUser = supabaseData.createAuthUser;
export const updateAuthUser = supabaseData.updateAuthUser;
export const deleteAuthUser = supabaseData.deleteAuthUser;
export const updateAuthUserLastLogin = supabaseData.updateAuthUserLastLogin;

// Property views increment - Direct to DB
export const incrementPropertyViews = supabaseData.incrementPropertyViews;

// ============================================================================
// CACHE MANAGEMENT UTILITIES
// ============================================================================

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cacheManager.clearAll();
  imageCache.clearImages();
  console.log('✅ All cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cacheManager.getStats();
}

/**
 * Manually refresh specific cache
 */
export async function refreshCache(type: 'properties' | 'categories' | 'settings' | 'all'): Promise<void> {
  console.log(`🔄 Refreshing ${type} cache...`);
  
  switch (type) {
    case 'properties':
      cacheManager.delete('properties');
      cacheManager.invalidatePattern('property_');
      await fetchProperties();
      break;
    case 'categories':
      cacheManager.delete('categories');
      await fetchCategories();
      break;
    case 'settings':
      cacheManager.invalidatePattern('setting');
      await fetchSettings();
      break;
    case 'all':
      clearAllCache();
      await Promise.all([
        fetchProperties(),
        fetchCategories(),
        fetchSettings(),
      ]);
      break;
  }
  
  console.log('✅ Cache refreshed');
}