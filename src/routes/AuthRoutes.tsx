/**
 * Auth Routes Wrapper
 *
 * Wraps routes that are only accessible when NOT authenticated.
 * Redirects to leagues dashboard if user is already logged in.
 *
 * Story: 2.2 - Implement Email/Password Registration
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { routes } from './index';
import { useIsAuthenticated, useAuthLoading } from '@/features/auth/stores/authStore';

/**
 * Auth Routes Component
 *
 * Use this to wrap login/register routes.
 * If user is already authenticated, redirect to leagues dashboard.
 */
export function AuthRoutes() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to leagues dashboard (or intended destination)
  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || routes.protected.leagues;
    return <Navigate to={from} replace />;
  }

  // Render child routes (login, register)
  return <Outlet />;
}

export default AuthRoutes;
