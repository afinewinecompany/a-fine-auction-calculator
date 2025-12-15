/**
 * Protected Routes Wrapper
 *
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { routes } from './index';

// Placeholder for auth state - will be replaced with Zustand store in Epic 2
const useAuth = () => {
  // TODO: Replace with actual auth store
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null,
  };
};

/**
 * Protected Routes Component
 *
 * Use this to wrap routes that require authentication.
 * If user is not authenticated, redirect to login page.
 */
export function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the intended destination for after login
    return <Navigate to={routes.public.login} state={{ from: location.pathname }} replace />;
  }

  // Render protected child routes
  return <Outlet />;
}

/**
 * Admin Routes Component
 *
 * Use this to wrap routes that require admin role.
 */
export function AdminRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Verifying permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={routes.public.login} state={{ from: location.pathname }} replace />;
  }

  // TODO: Add admin role check when user roles are implemented
  // For now, deny access to admin routes
  // if (user?.role !== 'admin') {
  //   return <Navigate to={routes.protected.dashboard} replace />;
  // }

  return <Outlet />;
}

export default ProtectedRoutes;
