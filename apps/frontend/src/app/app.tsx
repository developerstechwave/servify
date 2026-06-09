import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProtectedRoute from '../routes/ProtectedRoute';
import { LINKS } from '../lib/links';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={LINKS.LOGIN} replace />} />

        <Route path={LINKS.LOGIN}    element={<LoginPage />} />
        <Route path={LINKS.REGISTER} element={<RegisterPage />} />

        <Route
          path="/super-admin/*"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <div className="p-8 text-primary font-bold text-2xl">
                Super Admin Dashboard — Coming Soon
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={LINKS.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
