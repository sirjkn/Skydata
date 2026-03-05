import { useEffect } from 'react';
import { toast } from 'sonner';
import { addSyncListener, removeSyncListener } from '../lib/aggressive-sync-manager';
import { isSupabaseEnabled } from '../lib/data-service';

/**
 * SyncToastNotifier - Shows toast notifications for sync events
 * 
 * Optional component that displays toast notifications when:
 * - Sync starts (optional - can be noisy)
 * - Sync succeeds
 * - Sync fails
 * 
 * This provides additional user feedback beyond the cloud status indicator.
 */
export function SyncToastNotifier({ showSyncingToasts = false }: { showSyncingToasts?: boolean }) {
  useEffect(() => {
    if (!isSupabaseEnabled()) {
      return; // Don't show toasts in local mode
    }

    let syncToastId: string | number | undefined;

    const handleSyncStatus = (status: 'syncing' | 'success' | 'error') => {
      switch (status) {
        case 'syncing':
          if (showSyncingToasts) {
            syncToastId = toast.loading('Syncing with cloud...', {
              duration: Infinity,
            });
          }
          break;

        case 'success':
          if (syncToastId) {
            toast.dismiss(syncToastId);
          }
          // Only show success toast occasionally to avoid spam
          // You can customize this behavior
          break;

        case 'error':
          if (syncToastId) {
            toast.dismiss(syncToastId);
          }
          toast.error('Sync failed', {
            description: 'Could not sync with cloud. Check your connection.',
            duration: 4000,
          });
          break;
      }
    };

    addSyncListener(handleSyncStatus);

    return () => {
      removeSyncListener(handleSyncStatus);
      if (syncToastId) {
        toast.dismiss(syncToastId);
      }
    };
  }, [showSyncingToasts]);

  return null; // This is a utility component with no UI
}
