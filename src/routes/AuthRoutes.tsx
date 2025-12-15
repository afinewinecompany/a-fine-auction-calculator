/**
 * Auth Routes Wrapper
 *
 * Wraps routes that are only accessible when NOT authenticated.
 * Redirects to dashboard if user is already logged in.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { routes } from './index';

// Placeholder for auth state - will be replaced with Zustand store in Epic 2
const useAuth = () => {
  // TODO: Replace with actual auth store
  return {
    isAuthenticated: false,
    isLoading: false,
  };
};

/**
 * Auth Routes Component
 *
 * Use this to wrap login/register routes.
 * If user is already authenticated, redirect to dashboard.
 */
export function AuthRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard (or intended destination)
  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || routes.protected.dashboard;
    return <Navigate to={from} replace />;
  }

  // Render child routes (login, register)
  return <Outlet />;
}

export default AuthRoutes;
