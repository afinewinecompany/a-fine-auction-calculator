/**
 * Protected Routes Wrapper
 *
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 *
 * Story: 2.2 - Integrated with real Zustand auth store
 * Story: 13.1 - Added AdminRoutes with role-based access control
 */

import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { routes } from './index';
import { useIsAuthenticated, useAuthLoading } from '@/features/auth/stores/authStore';
import { useAdminCheck } from '@/features/admin/hooks/useAdminCheck';

/**
 * Protected Routes Component
 *
 * Use this to wrap routes that require authentication.
 * If user is not authenticated, redirect to login page.
 */
export function ProtectedRoutes() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
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
    // Save the intended destination (including query params and hash) for after login
    const fullPath = location.pathname + location.search + location.hash;
    return <Navigate to={routes.public.login} state={{ from: fullPath }} replace />;
  }

  // Render protected child routes
  return <Outlet />;
}

/**
 * Admin Routes Component
 *
 * Use this to wrap routes that require admin role.
 * Verifies admin status via Supabase database query.
 *
 * Story: 13.1 - Create Admin Dashboard Route
 */
export function AdminRoutes() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const location = useLocation();
  const [hasShownError, setHasShownError] = useState(false);

  // Show error toast once when access is denied
  useEffect(() => {
    if (!isLoading && !adminLoading && isAuthenticated && !isAdmin && !hasShownError) {
      toast.error('Access denied. Admin privileges required.');
      setHasShownError(true);
    }
  }, [isLoading, adminLoading, isAuthenticated, isAdmin, hasShownError]);

  // Show loading state while checking auth and admin status
  if (isLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Verifying permissions...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const fullPath = location.pathname + location.search + location.hash;
    return <Navigate to={routes.public.login} state={{ from: fullPath }} replace />;
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to={routes.public.home} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
