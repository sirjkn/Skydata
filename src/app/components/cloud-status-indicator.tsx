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
  const [showErrorDetails, setShowErrorDetails] = useState(false);

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
        return 'Server Offline';
      default:
        return 'Cloud Mode';
    }
  };

  const getTooltipText = () => {
    switch (syncStatus) {
      case 'error':
        return 'Cannot connect to Supabase - Server may not be deployed. Data will remain local until connection is restored.';
      default:
        return `Using Supabase Cloud Storage - ${getStatusText()}`;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm text-white transition-all duration-300 ${getStatusColor()} ${syncStatus === 'error' ? 'cursor-help' : ''}`}
        title={getTooltipText()}
        onClick={() => syncStatus === 'error' && setShowErrorDetails(!showErrorDetails)}
      >
        {syncStatus === 'syncing' ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Cloud className="w-4 h-4" />
        )}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </div>
      
      {/* Error details popup */}
      {syncStatus === 'error' && showErrorDetails && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border-2 border-red-200 p-4 text-sm">
          <h4 className="font-bold text-red-900 mb-2">⚠️ Server Connection Failed</h4>
          <p className="text-gray-700 mb-3">
            The Supabase server is not responding. Your data is being stored locally and will sync automatically when the connection is restored.
          </p>
          <div className="bg-red-50 rounded p-3 mb-3">
            <p className="text-xs text-red-800 mb-2">
              <strong>Possible reasons:</strong>
            </p>
            <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
              <li>Server function not deployed</li>
              <li>Network connection issue</li>
              <li>Supabase project offline</li>
            </ul>
          </div>
          <a
            href="https://supabase.com/dashboard/project/zqnvycenohyyyxnnelbc/functions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            📋 Deploy Server Function →
          </a>
        </div>
      )}
    </div>
  );
}
