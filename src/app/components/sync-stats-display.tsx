import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { isSupabaseEnabled } from '../lib/data-service';
import { addSyncListener, removeSyncListener } from '../lib/aggressive-sync-manager';

/**
 * SyncStatsDisplay - Shows sync statistics and activity
 * 
 * Displays useful information about sync activity:
 * - Last sync time
 * - Total syncs today
 * - Success/error counts
 * - Cloud mode status
 */
export function SyncStatsDisplay() {
  const [cloudMode, setCloudMode] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncCount, setSyncCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Check cloud mode
    setCloudMode(isSupabaseEnabled());

    // Listen for sync status changes
    const handleSyncStatus = (status: 'syncing' | 'success' | 'error') => {
      if (status === 'syncing') {
        setSyncCount(prev => prev + 1);
      } else if (status === 'success') {
        setLastSyncTime(new Date());
        setSuccessCount(prev => prev + 1);
      } else if (status === 'error') {
        setErrorCount(prev => prev + 1);
      }
    };

    addSyncListener(handleSyncStatus);

    // Check mode changes
    const checkMode = () => {
      setCloudMode(isSupabaseEnabled());
    };

    window.addEventListener('settingsChanged', checkMode);

    return () => {
      removeSyncListener(handleSyncStatus);
      window.removeEventListener('settingsChanged', checkMode);
    };
  }, []);

  if (!cloudMode) {
    return null; // Don't show stats in local mode
  }

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Sync Activity</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-900">Last Sync</span>
          </div>
          <p className="text-sm text-blue-700 font-medium">{formatTime(lastSyncTime)}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-900">Total Syncs</span>
          </div>
          <p className="text-sm text-purple-700 font-medium">{syncCount}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-900">Successful</span>
          </div>
          <p className="text-sm text-green-700 font-medium">{successCount}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-red-900">Errors</span>
          </div>
          <p className="text-sm text-red-700 font-medium">{errorCount}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          🔄 Auto-sync every 30 seconds
        </p>
      </div>
    </div>
  );
}
