/**
 * Router Configuration
 *
 * Main router setup using react-router-dom v7.
 * Configures all application routes with proper wrappers.
 *
 * Story: 2.2 - Implement Email/Password Registration (added /register route)
 * Story: 2.3 - Implement Email/Password Login (added /login route)
 */

import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { routes } from './index';
import { AuthRoutes } from './AuthRoutes';
import { ProtectedRoutes, AdminRoutes } from './ProtectedRoutes';
import { useAuthStore } from '@/features/auth/stores/authStore';

// Auth components
import { RegistrationPage } from '@/features/auth/components/RegistrationPage';
import { LoginPage } from '@/features/auth/components/LoginPage';

// Layout components
import { AppLayout } from '@/components/AppLayout';

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Error boundary fallback
 */
function ErrorFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 mb-4">Please try refreshing the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

/**
 * Placeholder component for routes not yet implemented
 */
function PlaceholderRoute({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">{name}</h1>
        <p className="text-slate-400">This route will be implemented in future stories.</p>
      </div>
    </div>
  );
}

/**
 * Router configuration
 *
 * Route structure:
 * - / (public)
 * - /login, /register (auth routes - redirects if logged in)
 * - /dashboard, /leagues, /draft, etc. (protected - requires auth)
 * - /admin/* (admin routes - requires admin role)
 *
 * Note: Currently using placeholder components. Actual page components
 * will be lazily loaded when they are refactored to use default exports
 * or when feature components are implemented in future epics.
 */
const router = createBrowserRouter([
  // Public routes
  {
    path: routes.public.home,
    element: <PlaceholderRoute name="Landing Page" />,
    errorElement: <ErrorFallback />,
  },

  // Auth routes (login, register) - redirect to dashboard if already logged in
  {
    element: <AuthRoutes />,
    children: [
      {
        path: routes.public.login,
        element: <LoginPage />,
      },
      {
        path: routes.public.register,
        element: <RegistrationPage />,
      },
    ],
  },

  // Protected routes - require authentication
  {
    element: <ProtectedRoutes />,
    children: [
      {
        // Wrap protected routes with AppLayout for consistent header/navigation
        element: <AppLayout />,
        children: [
          {
            path: routes.protected.dashboard,
            element: <PlaceholderRoute name="Dashboard" />,
          },
          {
            path: routes.protected.leagues,
            element: <PlaceholderRoute name="Leagues" />,
          },
          {
            path: routes.protected.setup,
            element: <PlaceholderRoute name="League Setup" />,
          },
          {
            path: routes.protected.draft,
            element: <PlaceholderRoute name="Draft Room" />,
          },
          {
            path: routes.protected.analysis,
            element: <PlaceholderRoute name="Post-Draft Analysis" />,
          },
        ],
      },
    ],
  },

  // Admin routes - require admin role
  {
    element: <AdminRoutes />,
    children: [
      {
        // Wrap admin routes with AppLayout for consistent header/navigation
        element: <AppLayout />,
        children: [
          {
            path: routes.admin.dashboard,
            element: <PlaceholderRoute name="Admin Dashboard" />,
          },
        ],
      },
    ],
  },

  // 404 fallback
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">404</h1>
          <p className="text-slate-400 mb-4">Page not found</p>
          <a
            href={routes.public.home}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-block"
          >
            Go Home
          </a>
        </div>
      </div>
    ),
  },
]);

/**
 * App Router Component
 *
 * Provides the router to the application.
 * Initializes auth state on mount.
 */
export function AppRouter() {
  const initialize = useAuthStore(state => state.initialize);
  const isInitialized = useAuthStore(state => state.isInitialized);

  // Initialize auth state on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading until auth is initialized
  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-slate-900 text-white border-slate-800',
        }}
      />
    </>
  );
}

// Export utilities for use elsewhere
export { LoadingFallback, ErrorFallback, PlaceholderRoute };
export default AppRouter;
