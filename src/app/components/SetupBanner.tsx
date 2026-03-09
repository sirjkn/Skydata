import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AlertCircle, Database, X } from 'lucide-react';
import { Button } from './ui/button';
import { fetchAuthUsers } from '../../lib/supabaseData';

export function SetupBanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Don't show banner on setup page itself
  const isOnSetupPage = location.pathname === '/setup';

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const users = await fetchAuthUsers();
      setNeedsSetup(users.length === 0);
    } catch (error) {
      // Silently handle - if using mock data, setup isn't needed
      console.warn('Setup check completed with fallback data');
      setNeedsSetup(false); // Don't show banner when using mock data
    } finally {
      setIsChecking(false);
    }
  };

  // Don't show if checking, dismissed, not needed, or on setup page
  if (isChecking || isDismissed || !needsSetup || isOnSetupPage) {
    return null;
  }

  return (
    <>
      {/* Compact Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Database Setup Required</h3>
                <p className="text-white/90 text-xs">
                  Initialize your database to start using Skyway Suites
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/setup')}
                size="sm"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
              >
                Setup Now
              </Button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Overlay (Optional - for critical setup) */}
      {/* Uncomment if you want to block the UI until setup is complete
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Skyway Suites!
            </h2>
            <p className="text-gray-600 mb-6">
              Your database needs to be initialized before you can start using the platform.
              This is a one-time setup that creates default admin and demo accounts.
            </p>
            <Button
              onClick={() => navigate('/setup')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            >
              Initialize Database
            </Button>
          </div>
        </div>
      </div>
      */}
    </>
  );
}