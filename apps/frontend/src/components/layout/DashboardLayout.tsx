import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../../store/auth.store';
import {
  SUPER_ADMIN_NAV,
  ADMIN_NAV,
  EMPLOYEE_NAV,
  CUSTOMER_NAV,
} from '../../lib/nav.config';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function getNavItems(role: string) {
  switch (role) {
    case 'super_admin': return SUPER_ADMIN_NAV;
    case 'admin':       return ADMIN_NAV;
    case 'employee':    return EMPLOYEE_NAV;
    case 'customer':    return CUSTOMER_NAV;
    default:            return [];
  }
}

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
    path:  '/' + parts.slice(0, i + 1).join('/'),
  }));
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  const navItems   = getNavItems(user?.role ?? '');
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar navItems={navItems} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
