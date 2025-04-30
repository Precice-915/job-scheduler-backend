import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingPage from '../../pages/LoadingPage';

const PublicRoute: React.FC = () => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while session/profile is loading
  if (isLoading) {
    return <LoadingPage />;
  }

  // Allow public access to job lookup or other explicitly public pages
  const publicPaths = ['/job-lookup', '/reset-password', '/register'];
  if (publicPaths.includes(location.pathname)) {
    return <Outlet />;
  }

  // Redirect authenticated users away from login/register
  if (session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
