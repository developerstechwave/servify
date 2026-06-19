import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import type { NavItem } from '../../lib/nav.config';
import { ServifyLogoMark } from '../auth/AuthLogo';
import { useAuthStore } from '../../store/auth.store';

interface SidebarProps {
  navItems: NavItem[];
}

export default function Sidebar({ navItems }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuthStore();
  const isCustomer = user?.role === 'customer';

  const isActive = (path?: string) => {
    if (!path) return false;
    if (location.pathname === path) return true;
    const segments  = path.split('/').filter(Boolean);
    const last      = segments[segments.length - 1];
    const roleRoots = ['super-admin', 'admin', 'employee', 'customer'];
    if (roleRoots.includes(last)) return location.pathname === path;
    return location.pathname.startsWith(path + '/') || location.pathname === path;
  };

  const isChildActive = (item: NavItem) =>
    item.children?.some((c) => isActive(c.path)) ?? false;

  const handleClick = (item: NavItem) => {
    if (item.children) {
      setOpenDropdown(openDropdown === item.key ? null : item.key);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside
      className="flex flex-col h-screen transition-all duration-300 flex-shrink-0"
      style={{
        width:      collapsed ? '72px' : '240px',
        background: 'rgba(101, 16, 127, 1)',
      }}
    >
      {/* Logo + collapse */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ServifyLogoMark />
          {!collapsed && (
            <span className="text-white font-bold text-lg tracking-tight">Servify</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/60 hover:text-white transition-colors p-1 rounded ml-auto"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            {collapsed
              ? <path d="M9 18l6-6-6-6" />
              : <path d="M15 18l-6-6 6-6" />
            }
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-3 pt-4 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const active       = isActive(item.path) || isChildActive(item);
          const dropdownOpen = openDropdown === item.key;
          return (
            <div key={item.key}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <button
                  onClick={() => handleClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 text-left
                    ${active
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                      {item.children && (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor" strokeWidth={2}
                          className={`transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </>
                  )}
                </button>
              </Tooltip>

              {item.children && !collapsed && dropdownOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/20 pl-3">
                  {item.children.map((child) => (
                    <button
                      key={child.key}
                      onClick={() => child.path && navigate(child.path)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-xl
                        transition-all duration-200 text-left
                        ${isActive(child.path)
                          ? 'bg-white/20 text-white'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <span className="flex-shrink-0">{child.icon}</span>
                      <span className="text-sm font-medium truncate">{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Need Help — customer only */}
      {isCustomer && !collapsed && (
        <div className="px-3 pb-4">
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <p className="text-white font-semibold text-sm mb-1">Need Help?</p>
            <p className="text-white/60 text-xs mb-3">
              Is there anything our Team can assist you with today
            </p>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact support
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
