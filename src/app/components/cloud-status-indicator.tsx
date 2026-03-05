import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { isSupabaseEnabled } from '../lib/data-service';
import { addSyncListener, removeSyncListener } from '../lib/aggressive-sync-manager';

/**
 * CloudStatusIndicator - Shows current storage mode and sync status
 * 
 * Displays a badge indicating:
 * - Cloud storage (Supabase) or local storage
 * - Real-time sync status (syncing, success, error)
 * - Background sync every 5 seconds
 */
export function CloudStatusIndicator() {
  const [cloudMode, setCloudMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Check initial state
    setCloudMode(isSupabaseEnabled());

    // Listen for settings changes
    const checkMode = () => {
      setCloudMode(isSupabaseEnabled());
    };

    window.addEventListener('settingsChanged', checkMode);
    window.addEventListener('storage', checkMode);

    // Listen for sync status changes
    const handleSyncStatus = (status: 'syncing' | 'success' | 'error') => {
      setSyncStatus(status);
      
      // Auto-clear success/error status after 2 seconds
      if (status === 'success' || status === 'error') {
        setTimeout(() => {
          setSyncStatus('idle');
        }, 2000);
      }
    };

    addSyncListener(handleSyncStatus);

    return () => {
      window.removeEventListener('settingsChanged', checkMode);
      window.removeEventListener('storage', checkMode);
      removeSyncListener(handleSyncStatus);
    };
  }, []);

  if (!cloudMode) {
    // Local mode - show simple indicator
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm bg-gray-500/90 text-white"
          title="Using Local Storage"
        >
          <CloudOff className="w-4 h-4" />
          <span className="text-xs font-medium">Local Mode</span>
        </div>
      </div>
    );
  }

  // Cloud mode - show with sync status
  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'bg-blue-500/90';
      case 'success':
        return 'bg-green-500/90';
      case 'error':
        return 'bg-red-500/90';
      default:
        return 'bg-green-500/90';
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced!';
      case 'error':
        return 'Sync Error';
      default:
        return 'Cloud Mode';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm text-white transition-all duration-300 ${getStatusColor()}`}
        title={`Using Supabase Cloud Storage - ${getStatusText()}`}
      >
        {syncStatus === 'syncing' ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Cloud className="w-4 h-4" />
        )}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </div>
    </div>
  );
}
