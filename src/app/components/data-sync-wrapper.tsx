import { useEffect } from 'react';
import { isSupabaseEnabled } from '../lib/data-service';
import { startBackgroundSync, stopBackgroundSync, syncOnLoad } from '../lib/aggressive-sync-manager';

/**
 * DataSyncWrapper - Aggressive Real-Time Cloud Sync Manager
 * 
 * This component:
 * - Syncs data on every page load/refresh
 * - Runs background sync every 30 seconds
 * - Monitors Supabase mode changes and reloads when toggled
 * - Ensures data is ALWAYS synchronized with the cloud
 */
export function DataSyncWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize on mount - don't reload, just set the initial mode
    const currentMode = isSupabaseEnabled();
    const lastKnownMode = sessionStorage.getItem('lastSupabaseMode');
    
    // Only set initial mode if not set yet
    if (lastKnownMode === null) {
      sessionStorage.setItem('lastSupabaseMode', String(currentMode));
    }
    
    // ===== AGGRESSIVE SYNC ON PAGE LOAD =====
    // Sync immediately when page loads
    syncOnLoad();
    
    // ===== START BACKGROUND SYNC EVERY 30 SECONDS =====
    startBackgroundSync();
    
    // Check if Supabase mode changed
    const checkForModeChange = () => {
      const currentMode = isSupabaseEnabled();
      const lastKnownMode = sessionStorage.getItem('lastSupabaseMode');
      
      if (lastKnownMode !== null && lastKnownMode !== String(currentMode)) {
        // Mode changed! Reload the page to fetch fresh data
        console.log('Supabase mode changed from', lastKnownMode, 'to', currentMode, '- reloading...');
        // Update the stored mode BEFORE reload to prevent loops
        sessionStorage.setItem('lastSupabaseMode', String(currentMode));
        window.location.reload();
      }
    };
    
    // Listen for storage changes (when settings are updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'skyway_settings') {
        checkForModeChange();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (when settings change in same tab)
    const handleCustomEvent = () => {
      checkForModeChange();
    };
    
    window.addEventListener('settingsChanged', handleCustomEvent);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsChanged', handleCustomEvent);
      stopBackgroundSync(); // Stop background sync when component unmounts
    };
  }, []);
  
  return <>{children}</>;
}
