import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingPage from '../../pages/LoadingPage';
import { supabase } from '../../lib/supabase';

const ProtectedRoute: React.FC = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const checkUser = async () => {
      if (session) {
        const { error } = await supabase.auth.getUser();
        if (error) {
          console.warn('Session invalid. Signing out...');
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
        }
      } else if (!isLoading) {
        // If no session after loading, set a fallback timeout
        timeout = setTimeout(() => {
          console.warn('No valid session found after timeout. Redirecting to login...');
          supabase.auth.signOut(); // just in case
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    checkUser();

    return () => clearTimeout(timeout);
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;