import { useEffect, useState } from 'react';
import { subscribeToConnectionStatus, type ConnectionStatus } from '../../lib/connectionStatus';
import { AlertCircle, WifiOff, Wifi } from 'lucide-react';

export function ConnectionStatusBanner() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    isSupabaseConnected: false,
    lastChecked: new Date()
  });

  useEffect(() => {
    const unsubscribe = subscribeToConnectionStatus((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Don't show banner if everything is connected
  if (status.isOnline && status.isSupabaseConnected) {
    return null;
  }

  return (
    <div className="bg-red-600 text-white py-2 px-4 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <WifiOff className="w-5 h-5" />
        <span className="font-semibold">
          {!status.isOnline 
            ? 'No Internet Connection - All operations are disabled'
            : 'Cannot connect to database - Please check your internet connection'
          }
        </span>
        <AlertCircle className="w-5 h-5" />
      </div>
    </div>
  );
}

export function ConnectionStatusIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    isSupabaseConnected: false,
    lastChecked: new Date()
  });

  useEffect(() => {
    const unsubscribe = subscribeToConnectionStatus((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isFullyConnected = status.isOnline && status.isSupabaseConnected;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        isFullyConnected ? 'bg-green-500' : 'bg-red-500'
      } animate-pulse`} />
      <span className={`text-xs font-medium ${
        isFullyConnected ? 'text-green-700' : 'text-red-700'
      }`}>
        {isFullyConnected ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
