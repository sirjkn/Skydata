import { Outlet } from 'react-router';
import { ConnectionBanner } from './ConnectionBanner';

export function RootLayout() {
  return (
    <>
      <ConnectionBanner />
      <Outlet />
    </>
  );
}
