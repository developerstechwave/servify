import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage             from '../pages/auth/LoginPage';
import RegisterPage          from '../pages/auth/RegisterPage';
import JoinPage              from '../pages/auth/JoinPage';
import ProtectedRoute        from '../routes/ProtectedRoute';
import DashboardLayout       from '../components/layout/DashboardLayout';
import SuperAdminDashboard   from '../pages/super-admin/SuperAdminDashboard';
import InvitesPage           from '../pages/super-admin/InvitesPage';
import InviteDetailPage      from '../pages/super-admin/InviteDetailPage';
import OrganisationsPage     from '../pages/super-admin/OrganisationsPage';
import AdminDashboard        from '../pages/admin/AdminDashboard';
import AdminInvitesPage      from '../pages/admin/AdminInvitesPage';
import AdminInviteDetailPage from '../pages/admin/AdminInviteDetailPage';
import ProfilePage           from '../pages/profile/ProfilePage';
import { LINKS } from '../lib/links';

const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
      <p className="text-text-muted">Coming soon</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={LINKS.LOGIN} replace />} />
        <Route path={LINKS.LOGIN}    element={<LoginPage />} />
        <Route path={LINKS.REGISTER} element={<RegisterPage />} />
        <Route path={LINKS.JOIN_ORG} element={<JoinPage />} />

        {/* Super Admin */}
        <Route path="/super-admin/*" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout>
              <Routes>
                <Route index                element={<SuperAdminDashboard />} />
                <Route path="organisations" element={<OrganisationsPage />} />
                <Route path="invites"       element={<InvitesPage />} />
                <Route path="invites/:id"   element={<InviteDetailPage />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <Routes>
                <Route index                  element={<AdminDashboard />} />
                <Route path="profile"         element={<ProfilePage />} />
                <Route path="invites"         element={<AdminInvitesPage />} />
                <Route path="invites/:id"     element={<AdminInviteDetailPage />} />
                <Route path="subscriptions"   element={<ComingSoon title="Subscriptions" />} />
                <Route path="users/customers" element={<ComingSoon title="Customers" />} />
                <Route path="users/employees" element={<ComingSoon title="Employees" />} />
                <Route path="users/roles"     element={<ComingSoon title="Roles" />} />
                <Route path="crm"             element={<ComingSoon title="CRM" />} />
                <Route path="issues"          element={<ComingSoon title="Issues" />} />
                <Route path="payments"        element={<ComingSoon title="Payments" />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Employee */}
        <Route path="/employee/*" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <DashboardLayout>
              <Routes>
                <Route index                element={<ComingSoon title="Employee Dashboard" />} />
                <Route path="profile"       element={<ProfilePage />} />
                <Route path="tickets"       element={<ComingSoon title="My Tickets" />} />
                <Route path="crm"           element={<ComingSoon title="CRM Board" />} />
                <Route path="customers"     element={<ComingSoon title="Customers" />} />
                <Route path="notifications" element={<ComingSoon title="Notifications" />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Customer */}
        <Route path="/customer/*" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <DashboardLayout>
              <Routes>
                <Route index                element={<ComingSoon title="Customer Dashboard" />} />
                <Route path="profile"       element={<ProfilePage />} />
                <Route path="subscriptions" element={<ComingSoon title="Subscriptions" />} />
                <Route path="issues"        element={<ComingSoon title="Issues" />} />
                <Route path="payments"      element={<ComingSoon title="Payments" />} />
                <Route path="faqs"          element={<ComingSoon title="FAQs" />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={LINKS.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
