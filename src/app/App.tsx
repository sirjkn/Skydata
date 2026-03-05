import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { DataSyncWrapper } from './components/data-sync-wrapper';
import { CloudStatusIndicator } from './components/cloud-status-indicator';

export default function App() {
  return (
    <DataSyncWrapper>
      <RouterProvider router={router} />
      <Toaster />
      <CloudStatusIndicator />
    </DataSyncWrapper>
  );
}
