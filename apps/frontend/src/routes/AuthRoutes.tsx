import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { LINKS } from '../lib/links';

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path={LINKS.LOGIN} element={<LoginPage />} />
    </Routes>
  );
}
