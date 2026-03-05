import { Outlet } from 'react-router-dom';
import { ConnectionBanner } from './ConnectionBanner';

export function RootLayout() {
  return (
    <>
      <ConnectionBanner />
      <Outlet />
    </>
  );
}
