/**
 * Aggressive Sync Manager
 * 
 * This module provides ultra-aggressive real-time syncing:
 * - Syncs on every action (add, edit, delete)
 * - Syncs every 30 seconds in the background
 * - Syncs on page load, refresh, and settings change
 * 
 * This ensures data is ALWAYS synchronized with Supabase Cloud.
 */

import * as dataService from './data-service';

// Track if sync is in progress to prevent overlapping syncs
let isSyncing = false;
let lastSyncTime = 0;
const MIN_SYNC_INTERVAL = 1000; // Minimum 1 second between syncs

// Sync event listeners
const syncListeners: Array<(status: 'syncing' | 'success' | 'error') => void> = [];

/**
 * Add a listener for sync status changes
 */
export const addSyncListener = (
  listener: (status: 'syncing' | 'success' | 'error') => void
): void => {
  syncListeners.push(listener);
};

/**
 * Remove a sync listener
 */
export const removeSyncListener = (
  listener: (status: 'syncing' | 'success' | 'error') => void
): void => {
  const index = syncListeners.indexOf(listener);
  if (index > -1) {
    syncListeners.splice(index, 1);
  }
};

/**
 * Notify all listeners of sync status change
 */
const notifyListeners = (status: 'syncing' | 'success' | 'error'): void => {
  syncListeners.forEach(listener => {
    try {
      listener(status);
    } catch (error) {
      console.error('Error in sync listener:', error);
    }
  });
};

/**
 * Bidirectional sync: Upload local data to cloud AND download cloud data
 */
export const bidirectionalSync = async (): Promise<void> => {
  if (!dataService.isSupabaseEnabled()) {
    return; // Skip if cloud mode is disabled
  }

  // Prevent overlapping syncs
  const now = Date.now();
  if (isSyncing || (now - lastSyncTime) < MIN_SYNC_INTERVAL) {
    return;
  }

  isSyncing = true;
  lastSyncTime = now;
  notifyListeners('syncing');

  try {
    console.log('🔄 Starting bidirectional sync...');

    // Step 1: Upload local data to cloud
    await dataService.syncToSupabase();
    console.log('✅ Upload complete');

    // Step 2: Download cloud data to local
    await dataService.syncFromSupabase();
    console.log('✅ Download complete');

    // Step 3: Dispatch event to notify app of data changes
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('dataUpdated'));

    console.log('✨ Bidirectional sync successful!');
    notifyListeners('success');
  } catch (error) {
    // Log detailed error but don't crash the app
    if (error instanceof Error) {
      console.error('❌ Bidirectional sync failed:', error.message);
      
      // Check if it's a connection error
      if (error.message.includes('Cannot connect') || error.message.includes('timeout')) {
        console.warn('⚠️ Supabase server appears to be unavailable. Data will remain local until connection is restored.');
        console.warn('💡 To deploy the server, visit: https://supabase.com/dashboard/project/zqnvycenohyyyxnnelbc/functions');
      }
    } else {
      console.error('❌ Bidirectional sync failed:', error);
    }
    notifyListeners('error');
  } finally {
    isSyncing = false;
  }
};

/**
 * Quick sync: Just upload changes without full bidirectional sync
 * Used after individual operations to be faster
 */
export const quickUploadSync = async (): Promise<void> => {
  if (!dataService.isSupabaseEnabled()) {
    return;
  }

  try {
    await dataService.syncToSupabase();
  } catch (error) {
    // Silently fail for quick syncs to avoid noise
    // Full bidirectional sync will show detailed errors
    if (error instanceof Error && error.message.includes('Cannot connect')) {
      // Server not available, skip silently
      return;
    }
    console.error('Quick upload sync failed:', error);
  }
};

/**
 * Start background sync that runs every 30 seconds
 */
let backgroundSyncInterval: number | null = null;

export const startBackgroundSync = (): void => {
  // Clear any existing interval
  stopBackgroundSync();

  // Immediate initial sync
  bidirectionalSync();

  // Start interval for every 30 seconds
  backgroundSyncInterval = setInterval(() => {
    if (dataService.isSupabaseEnabled()) {
      bidirectionalSync();
    }
  }, 30000); // 30 seconds

  // Listen for manual full sync triggers (e.g., after settings save)
  const handleFullSyncTrigger = () => {
    if (dataService.isSupabaseEnabled()) {
      bidirectionalSync();
    }
  };

  window.addEventListener('triggerFullSync', handleFullSyncTrigger);

  console.log('🔁 Background sync started (every 30 seconds)');
};

/**
 * Stop background sync
 */
export const stopBackgroundSync = (): void => {
  if (backgroundSyncInterval) {
    clearInterval(backgroundSyncInterval);
    backgroundSyncInterval = null;
    
    // Remove event listener
    const handleFullSyncTrigger = () => {
      if (dataService.isSupabaseEnabled()) {
        bidirectionalSync();
      }
    };
    window.removeEventListener('triggerFullSync', handleFullSyncTrigger);
    
    console.log('⏹️ Background sync stopped');
  }
};

/**
 * Sync on page load/refresh
 */
export const syncOnLoad = async (): Promise<void> => {
  if (dataService.isSupabaseEnabled()) {
    console.log('🚀 Syncing on page load...');
    await bidirectionalSync();
  }
};

/**
 * Trigger sync after any data operation
 */
export const syncAfterOperation = async (): Promise<void> => {
  if (dataService.isSupabaseEnabled()) {
    // Use quick upload for faster response after operations
    await quickUploadSync();
  }
};
