import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useAuthStore } from '../../store/auth.store';
import { LINKS } from '../../lib/links';
import { authService } from '../../services/auth.service';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface TopbarProps {
  breadcrumbs: BreadcrumbItem[];
}

function getProfileLink(role: string) {
  switch (role) {
    case 'admin':    return LINKS.ADMIN_PROFILE;
    case 'employee': return LINKS.EMPLOYEE_PROFILE;
    case 'customer': return LINKS.CUSTOMER_PROFILE;
    default:         return null;
  }
}

export default function Topbar({ breadcrumbs }: TopbarProps) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [notifCount] = useState(1);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    navigate(LINKS.LOGIN);
  };

  const profileLink = getProfileLink(user?.role ?? '');

  const userMenuItems: MenuProps['items'] = [
    ...(profileLink ? [{
      key:   'profile',
      label: 'Profile',
    }] : []),
    { type: 'divider' as const },
    { key: 'logout', label: 'Logout', danger: true },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout')  handleLogout();
    if (key === 'profile' && profileLink) navigate(profileLink);
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.length > 10
      ? `${user.firstName} ${user.lastName}`.slice(0, 10) + '...'
      : `${user.firstName} ${user.lastName}`
    : '';

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-border flex-shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="text-text-muted hover:text-primary transition-colors"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} className="text-text-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
            <span
              className={`text-sm font-medium ${
                i === breadcrumbs.length - 1
                  ? 'text-primary'
                  : 'text-text-muted hover:text-primary cursor-pointer'
              }`}
              onClick={() => crumb.path && navigate(crumb.path)}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-text-muted hover:text-primary transition-colors">
          <Badge count={notifCount} size="small">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Badge>
        </button>

        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button className="flex items-center gap-2 hover:bg-secondary rounded-xl px-3 py-2 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(101,16,127,1)' }}
            >
              {initials}
            </div>
            <span className="text-sm font-medium text-text-main hidden sm:block">
              {displayName}
            </span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} className="text-text-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
