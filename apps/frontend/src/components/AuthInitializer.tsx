import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

interface Props {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: Props) {
  const [loading, setLoading] = useState(true);

  const setAuth = useAuthStore((state) => state.setAuth);

  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        // Get a fresh access token using the
        // HTTP-only refresh_token cookie.
        const { data } = await axios.post(
          '/api/auth/refresh',
          {},
          {
            withCredentials: true,
          },
        );

        if (!mounted) return;

        // Get the current user.
        const meResponse = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
          withCredentials: true,
        });

        if (!mounted) return;

        setAuth(data.accessToken, meResponse.data);
      } catch {
        if (!mounted) return;

        clearAuth();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [setAuth, clearAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
