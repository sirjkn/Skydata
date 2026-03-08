import { useEffect, useState } from 'react';
import { WifiOff, AlertCircle, Loader2, Settings, X } from 'lucide-react';
import { subscribeToConnectionStatus, ConnectionStatus } from '../../lib/connectionStatus';
import { Button } from './ui/button';

export function ConnectionBanner() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: true,
    isSupabaseConnected: true,
    lastChecked: new Date()
  });
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToConnectionStatus(setStatus);
    return unsubscribe;
  }, []);

  // Reset modal visibility when status changes to disconnected
  useEffect(() => {
    if (!status.isOnline || !status.isSupabaseConnected) {
      setShowModal(true);
    }
  }, [status.isOnline, status.isSupabaseConnected]);

  // Don't show banner if everything is connected
  if (status.isOnline && status.isSupabaseConnected) {
    return null;
  }

  const handleSetupDatabase = () => {
    // Use window.location instead of navigate to avoid router context issues
    window.location.href = '/settings?tab=database';
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {!status.isOnline ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center animate-pulse">
                  <WifiOff className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">No Internet Connection</h3>
                  <p className="text-white/90 text-sm">
                    Please check your internet connection to continue using Skyway Suites
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Database Connection Error</h3>
                  <p className="text-white/90 text-sm">
                    Unable to connect to Supabase server. Please check your database settings.
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Retrying...</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay to prevent interaction */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
            {/* Close button - only for database connection error */}
            {status.isOnline && !status.isSupabaseConnected && (
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Required
            </h2>
            <p className="text-gray-600 mb-6">
              Skyway Suites requires an active internet connection and database access to function.
              All operations are disabled until connection is restored.
            </p>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 font-medium">
                {!status.isOnline 
                  ? '❌ No Internet Connection' 
                  : '❌ Database Connection Failed'}
              </p>
            </div>

            {/* Action Buttons - only show for database connection error */}
            {status.isOnline && !status.isSupabaseConnected && (
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSetupDatabase}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Set DB Connection Settings Now
                </Button>
                <Button
                  onClick={handleCloseModal}
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300 h-12"
                >
                  Close
                </Button>
              </div>
            )}

            {/* Message for internet connection error */}
            {!status.isOnline && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Please check your internet connection and try again.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
