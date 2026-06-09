import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { LINKS } from '../lib/links';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { accessToken, user } = useAuthStore();

  if (!accessToken) return <Navigate to={LINKS.LOGIN} replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={LINKS.LOGIN} replace />;
  }

  return <>{children}</>;
}
