/**
 * AdminRoutes Component Tests
 *
 * Tests for the admin route wrapper component that guards
 * admin-only routes with role-based access control.
 *
 * Story: 13.1 - Create Admin Dashboard Route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Mock state variables
let mockIsAuthenticated = false;
let mockIsLoading = false;
let mockIsAdmin = false;
let mockAdminLoading = false;

// Mock the auth store hooks
vi.mock('@/features/auth/stores/authStore', () => ({
  useIsAuthenticated: () => mockIsAuthenticated,
  useAuthLoading: () => mockIsLoading,
}));

// Mock the admin check hook
vi.mock('@/features/admin/hooks/useAdminCheck', () => ({
  useAdminCheck: () => ({
    isAdmin: mockIsAdmin,
    loading: mockAdminLoading,
    error: null,
  }),
}));

// Mock sonner toast
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    error: (message: string) => mockToastError(message),
  },
}));

// Import after mocking
import { AdminRoutes } from '@/routes/ProtectedRoutes';
import { routes } from '@/routes';

// Helper component to display current location
function LocationDisplay() {
  const location = useLocation();
  return (
    <div data-testid="location-display">
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="state">{JSON.stringify(location.state)}</span>
    </div>
  );
}

// Admin content component
function AdminContent() {
  return <div data-testid="admin-content">Admin Dashboard</div>;
}

// Test wrapper with router
const renderAdminRoutes = (initialEntry: string = '/admin') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        {/* Admin route */}
        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<AdminContent />} />
          <Route path="/admin/users" element={<div>Admin Users</div>} />
        </Route>
        {/* Login route for redirect testing */}
        <Route
          path={routes.public.login}
          element={
            <>
              <div data-testid="login-page">Login Page</div>
              <LocationDisplay />
            </>
          }
        />
        {/* Home route for non-admin redirect testing */}
        <Route
          path={routes.public.home}
          element={
            <>
              <div data-testid="home-page">Home Page</div>
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('AdminRoutes', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    mockIsAdmin = false;
    mockAdminLoading = false;
    mockToastError.mockClear();
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should show loading spinner when auth is loading', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;
      renderAdminRoutes();

      expect(screen.getByText('Verifying permissions...')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    it('should show loading spinner when admin check is loading', () => {
      mockIsLoading = false;
      mockIsAuthenticated = true;
      mockAdminLoading = true;
      renderAdminRoutes();

      expect(screen.getByText('Verifying permissions...')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    it('should show loading spinner with correct styling', () => {
      mockIsLoading = true;
      renderAdminRoutes();

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('border-emerald-400');
    });

    it('should show loading when both auth and admin are loading', () => {
      mockIsLoading = true;
      mockAdminLoading = true;
      mockIsAuthenticated = true;
      renderAdminRoutes();

      expect(screen.getByText('Verifying permissions...')).toBeInTheDocument();
    });
  });

  describe('Authentication Redirect', () => {
    it('should redirect to login when not authenticated', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      mockAdminLoading = false;
      renderAdminRoutes('/admin');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    it('should pass current pathname in location state.from', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      renderAdminRoutes('/admin/users');

      const stateElement = screen.getByTestId('state');
      expect(stateElement.textContent).toContain('"from":"/admin/users"');
    });

    it('should redirect to login route defined in routes config', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      renderAdminRoutes('/admin');

      const pathnameElement = screen.getByTestId('pathname');
      expect(pathnameElement.textContent).toBe(routes.public.login);
    });
  });

  describe('Admin Access Control', () => {
    it('should render admin content when user is admin', async () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      mockIsAdmin = true;
      mockAdminLoading = false;
      renderAdminRoutes();

      await waitFor(() => {
        expect(screen.getByTestId('admin-content')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should redirect non-admin authenticated user to home', async () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      mockIsAdmin = false;
      mockAdminLoading = false;
      renderAdminRoutes('/admin');

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    it('should show error toast when non-admin tries to access', async () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      mockIsAdmin = false;
      mockAdminLoading = false;
      renderAdminRoutes('/admin');

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Access denied. Admin privileges required.');
      });
    });

    it('should only show error toast once', async () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      mockIsAdmin = false;
      mockAdminLoading = false;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoutes />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
            <Route path={routes.public.home} element={<div data-testid="home">Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledTimes(1);
      });

      // Re-render shouldn't trigger another toast
      rerender(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoutes />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
            <Route path={routes.public.home} element={<div data-testid="home">Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Still only one call
      expect(mockToastError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Nested Admin Routes', () => {
    it('should render nested admin routes for admin users', async () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      mockIsAdmin = true;
      mockAdminLoading = false;
      renderAdminRoutes('/admin/users');

      await waitFor(() => {
        expect(screen.getByText('Admin Users')).toBeInTheDocument();
      });
    });
  });

  describe('State Transitions', () => {
    it('should handle transition from loading to admin', async () => {
      mockIsLoading = true;
      mockAdminLoading = true;
      mockIsAuthenticated = true;
      mockIsAdmin = false;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoutes />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
            <Route path={routes.public.home} element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Verifying permissions...')).toBeInTheDocument();

      // Update to admin
      mockIsLoading = false;
      mockAdminLoading = false;
      mockIsAdmin = true;

      rerender(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoutes />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
            <Route path={routes.public.home} element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('admin-content')).toBeInTheDocument();
      });
    });

    it('should handle transition from loading to non-admin', async () => {
      mockIsLoading = true;
      mockAdminLoading = true;
      mockIsAuthenticated = true;
      mockIsAdmin = false;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoutes />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
            <Route path={routes.public.home} element={<div data-testid="home">Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Verifying permissions...')).toBeInTheDocument();

      // Update to non-admin
      mockIsLoading = false;
      mockAdminLoading = false;
      mockIsAdmin = false;

      rerender(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoutes />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
            <Route path={routes.public.home} element={<div data-testid="home">Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('home')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should preserve query parameters when redirecting to login', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;

      render(
        <MemoryRouter initialEntries={['/admin?tab=users&filter=active']}>
          <Routes>
            <Route element={<AdminRoutes />}>
              <Route path="/admin" element={<AdminContent />} />
            </Route>
            <Route path={routes.public.login} element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      );

      const stateElement = screen.getByTestId('state');
      const state = JSON.parse(stateElement.textContent || '{}');
      expect(state.from).toBe('/admin?tab=users&filter=active');
    });

    it('should not show toast when user is loading', () => {
      mockIsAuthenticated = true;
      mockIsLoading = true;
      mockIsAdmin = false;
      mockAdminLoading = false;
      renderAdminRoutes();

      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('should not show toast when admin check is loading', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      mockIsAdmin = false;
      mockAdminLoading = true;
      renderAdminRoutes();

      expect(mockToastError).not.toHaveBeenCalled();
    });
  });
});
