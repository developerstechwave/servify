import { LINKS } from './links';

export interface NavItem {
  key:      string;
  label:    string;
  icon:     React.ReactNode;
  path?:    string;
  children?: NavItem[];
}

const icon = (d: string) => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ── SUPER ADMIN ──────────────────────────────────────────────────
export const SUPER_ADMIN_NAV: NavItem[] = [
  {
    key:   'dashboard',
    label: 'Dashboard',
    icon:  icon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10'),
    path:  LINKS.SUPER_ADMIN_DASHBOARD,
  },
  {
    key:   'organisations',
    label: 'Organizations',
    icon:  icon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10M12 3v18'),
    path:  LINKS.SUPER_ADMIN_ORGANISATIONS,
  },
  {
    key:   'invites',
    label: 'Invites',
    icon:  icon('M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'),
    path:  LINKS.SUPER_ADMIN_INVITES,
  },
];

// ── ADMIN ────────────────────────────────────────────────────────
export const ADMIN_NAV: NavItem[] = [
  {
    key:   'dashboard',
    label: 'Dashboard',
    icon:  icon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10'),
    path:  LINKS.ADMIN_DASHBOARD,
  },
  {
    key:   'subscriptions',
    label: 'Subscriptions',
    icon:  icon('M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'),
    path:  LINKS.ADMIN_SUBSCRIPTIONS,
  },
  {
    key:   'users',
    label: 'Users',
    icon:  icon('M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z'),
    children: [
      {
        key:   'customers',
        label: 'Customers',
        icon:  icon('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z'),
        path:  LINKS.ADMIN_CUSTOMERS,
      },
      {
        key:   'employees',
        label: 'Employees',
        icon:  icon('M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'),
        path:  LINKS.ADMIN_EMPLOYEES,
      },
      {
        key:   'roles',
        label: 'Roles',
        icon:  icon('M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'),
        path:  LINKS.ADMIN_ROLES,
      },
    ],
  },
  {
    key:   'crm',
    label: 'CRM',
    icon:  icon('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'),
    path:  LINKS.ADMIN_CRM,
  },
  {
    key:   'issues',
    label: 'Issues',
    icon:  icon('M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'),
    path:  LINKS.ADMIN_ISSUES,
  },
  {
    key:   'payments',
    label: 'Payments',
    icon:  icon('M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'),
    path:  LINKS.ADMIN_PAYMENTS,
  },
];

// ── EMPLOYEE ─────────────────────────────────────────────────────
export const EMPLOYEE_NAV: NavItem[] = [
  {
    key:   'dashboard',
    label: 'Dashboard',
    icon:  icon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10'),
    path:  LINKS.EMPLOYEE_DASHBOARD,
  },
  {
    key:   'my-tickets',
    label: 'My Tickets',
    icon:  icon('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'),
    path:  LINKS.EMPLOYEE_MY_TICKETS,
  },
  {
    key:   'crm',
    label: 'CRM Board',
    icon:  icon('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'),
    path:  LINKS.EMPLOYEE_CRM,
  },
  {
    key:   'customers',
    label: 'Customers',
    icon:  icon('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z'),
    path:  LINKS.EMPLOYEE_CUSTOMERS,
  },
  {
    key:   'notifications',
    label: 'Notifications',
    icon:  icon('M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'),
    path:  LINKS.EMPLOYEE_NOTIFICATIONS,
  },
];

// ── CUSTOMER ─────────────────────────────────────────────────────
export const CUSTOMER_NAV: NavItem[] = [
  {
    key:   'dashboard',
    label: 'Dashboard',
    icon:  icon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10'),
    path:  LINKS.CUSTOMER_DASHBOARD,
  },
  {
    key:   'subscriptions',
    label: 'Subscriptions',
    icon:  icon('M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'),
    path:  LINKS.CUSTOMER_SUBSCRIPTIONS,
  },
  {
    key:   'issues',
    label: 'Issues',
    icon:  icon('M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'),
    path:  LINKS.CUSTOMER_ISSUES,
  },
  {
    key:   'payments',
    label: 'Payments',
    icon:  icon('M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'),
    path:  LINKS.CUSTOMER_PAYMENTS,
  },
  {
    key:   'faqs',
    label: 'FAQs',
    icon:  icon('M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'),
    path:  LINKS.CUSTOMER_FAQS,
  },
];
