import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { 
  startConnectionMonitoring, 
  stopConnectionMonitoring
} from '../lib/connectionStatus';

export default function App() {
  useEffect(() => {
    // Connection monitoring is automatically initialized with hard-coded credentials
    // No need to load from localStorage - credentials are hard-coded in the app
    
    // Start monitoring connection when app mounts
    startConnectionMonitoring();
    
    // Cleanup on unmount
    return () => {
      stopConnectionMonitoring();
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
