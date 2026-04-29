'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

// Pages that should NOT have the sidebar (landing page)
const NO_SIDEBAR_ROUTES = ['/'];

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
