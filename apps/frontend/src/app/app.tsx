import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from '../routes/ProtectedRoute';
import { LINKS } from '../lib/links';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={LINKS.LOGIN} replace />} />

        {/* Auth */}
        <Route path={LINKS.LOGIN} element={<LoginPage />} />

        {/* Super Admin — placeholder */}
        <Route
          path="/super-admin/*"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <div className="p-8 text-primary font-bold text-2xl">Super Admin Dashboard — Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to={LINKS.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
