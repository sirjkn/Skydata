import { Outlet } from 'react-router';
import { ConnectionBanner } from './ConnectionBanner';
import { SetupBanner } from './SetupBanner';

export function RootLayout() {
  return (
    <>
      <ConnectionBanner />
      <SetupBanner />
      <Outlet />
    </>
  );
}