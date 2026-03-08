import { Outlet } from 'react-router';
import { SetupBanner } from './SetupBanner';

export function RootLayout() {
  return (
    <>
      <SetupBanner />
      <Outlet />
    </>
  );
}