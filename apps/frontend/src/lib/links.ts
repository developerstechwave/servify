export const LINKS = {
  // Auth
  LOGIN:          '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD:  '/auth/reset-password',
  JOIN_ORG:        '/auth/join',

  // Super Admin
  SUPER_ADMIN_DASHBOARD:     '/super-admin',
  SUPER_ADMIN_ORGANISATIONS: '/super-admin/organisations',
  SUPER_ADMIN_INVITES:       '/super-admin/invites',

  // Admin
  ADMIN_DASHBOARD:           '/admin',
  ADMIN_CUSTOMERS:           '/admin/customers',
  ADMIN_EMPLOYEES:           '/admin/employees',
  ADMIN_PRODUCTS:            '/admin/products',
  ADMIN_ROLES:               '/admin/roles',
  ADMIN_CRM:                 '/admin/crm',
  ADMIN_ISSUES:              '/admin/issues',

  // Employee
  EMPLOYEE_CRM:              '/employee/crm',
  EMPLOYEE_NOTIFICATIONS:    '/employee/notifications',

  // Customer
  CUSTOMER_DASHBOARD:        '/customer',
  CUSTOMER_SUBSCRIPTIONS:    '/customer/subscriptions',
  CUSTOMER_ISSUES:           '/customer/issues',
  CUSTOMER_FAQS:             '/customer/faqs',
} as const;
