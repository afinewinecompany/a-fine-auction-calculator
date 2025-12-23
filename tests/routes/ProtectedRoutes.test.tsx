/**
 * ProtectedRoutes Component Tests
 *
 * Tests for the protected route wrapper component that guards
 * authenticated-only routes.
 *
 * Story: 2.7 - Implement Protected Routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Mock the auth store hooks
let mockIsAuthenticated = false;
let mockIsLoading = false;

vi.mock('@/features/auth/stores/authStore', () => ({
  useIsAuthenticated: () => mockIsAuthenticated,
  useAuthLoading: () => mockIsLoading,
}));

// Import after mocking
import { ProtectedRoutes, AdminRoutes } from '@/routes/ProtectedRoutes';
import { routes } from '@/routes';

// Helper component to display current location (for testing redirects)
function LocationDisplay() {
  const location = useLocation();
  return (
    <div data-testid="location-display">
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="state">{JSON.stringify(location.state)}</span>
    </div>
  );
}

// Protected content component
function ProtectedContent() {
  return <div data-testid="protected-content">Protected Content</div>;
}

// Test wrapper with router
const renderWithRouter = (
  initialEntry: string = '/protected',
  component: React.ReactNode = <ProtectedRoutes />
) => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        {/* Protected route */}
        <Route element={component}>
          <Route path="/protected" element={<ProtectedContent />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/leagues" element={<div>Leagues</div>} />
          <Route path="/draft/:leagueId" element={<div>Draft Room</div>} />
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
        {/* Dashboard route for admin redirect testing */}
        <Route
          path={routes.protected.dashboard}
          element={<div data-testid="dashboard-page">Dashboard Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoutes', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when auth is loading', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;
      renderWithRouter();

      // Check for loading spinner
      expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
      // Should not show protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      // Should not redirect to login
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should show loading spinner with correct styling', () => {
      mockIsLoading = true;
      renderWithRouter();

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('border-emerald-400');
    });

    it('should show loading state even when authenticated', () => {
      mockIsLoading = true;
      mockIsAuthenticated = true;
      renderWithRouter();

      expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Redirect', () => {
    it('should redirect to login when not authenticated', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      renderWithRouter('/protected');

      // Should show login page
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      // Should not show protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should pass current pathname in location state.from', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      renderWithRouter('/protected');

      // Check the state passed to login page
      const stateElement = screen.getByTestId('state');
      expect(stateElement.textContent).toContain('"from":"/protected"');
    });

    it('should preserve deep path in state.from', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      renderWithRouter('/draft/league-123');

      const stateElement = screen.getByTestId('state');
      expect(stateElement.textContent).toContain('"from":"/draft/league-123"');
    });

    it('should redirect to login route defined in routes config', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      renderWithRouter('/protected');

      const pathnameElement = screen.getByTestId('pathname');
      expect(pathnameElement.textContent).toBe(routes.public.login);
    });
  });

  describe('Authenticated Access', () => {
    it('should render child routes when authenticated', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/protected');

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should render Outlet for nested routes', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/dashboard');

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render dynamic route parameters', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/draft/my-league-id');

      expect(screen.getByText('Draft Room')).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('should handle transition from loading to authenticated', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route element={<ProtectedRoutes />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
            <Route path={routes.public.login} element={<div>Login</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Initially loading
      expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();

      // Update state to authenticated
      mockIsLoading = false;
      mockIsAuthenticated = true;

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route element={<ProtectedRoutes />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
            <Route path={routes.public.login} element={<div>Login</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should handle transition from loading to not authenticated', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route element={<ProtectedRoutes />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
            <Route
              path={routes.public.login}
              element={<div data-testid="login">Login</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      // Initially loading
      expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();

      // Update state to not authenticated
      mockIsLoading = false;
      mockIsAuthenticated = false;

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route element={<ProtectedRoutes />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
            <Route
              path={routes.public.login}
              element={<div data-testid="login">Login</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });
});

describe('AdminRoutes', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    vi.clearAllMocks();
  });

  const renderAdminRoutes = (initialEntry: string = '/admin') => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<AdminRoutes />}>
            <Route path="/admin" element={<div data-testid="admin-content">Admin Dashboard</div>} />
            <Route path="/admin/users" element={<div>Admin Users</div>} />
          </Route>
          <Route
            path={routes.public.login}
            element={
              <>
                <div data-testid="login-page">Login Page</div>
                <LocationDisplay />
              </>
            }
          />
          <Route
            path={routes.protected.dashboard}
            element={<div data-testid="dashboard-page">Dashboard Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Loading State', () => {
    it('should show loading spinner when auth is loading', () => {
      mockIsLoading = true;
      renderAdminRoutes();

      expect(screen.getByText('Verifying permissions...')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    it('should show loading spinner with correct styling', () => {
      mockIsLoading = true;
      renderAdminRoutes();

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Authentication Redirect', () => {
    it('should redirect to login when not authenticated', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
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
  });

  describe('Authenticated Access', () => {
    it('should render admin content when authenticated', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderAdminRoutes();

      // Currently AdminRoutes allows authenticated users through
      // (admin role check is TODO for future implementation)
      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });

    it('should render nested admin routes', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderAdminRoutes('/admin/users');

      expect(screen.getByText('Admin Users')).toBeInTheDocument();
    });
  });

  describe('Future Admin Role Check (Infrastructure Ready)', () => {
    it('should have infrastructure ready for role checking', () => {
      // This test documents that AdminRoutes component exists and
      // is ready for role-based access control when user roles are implemented
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderAdminRoutes();

      // Currently passes authenticated users through
      // When roles are implemented, non-admin users should be redirected
      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });
  });
});

describe('ProtectedRoutes Edge Cases', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
  });

  it('should handle root protected route', () => {
    mockIsAuthenticated = true;
    mockIsLoading = false;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<div data-testid="home">Home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('should handle multiple nested routes', () => {
    mockIsAuthenticated = true;
    mockIsLoading = false;

    render(
      <MemoryRouter initialEntries={['/leagues/123/teams/456']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route
              path="/leagues/:leagueId/teams/:teamId"
              element={<div data-testid="nested">Nested Route</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('nested')).toBeInTheDocument();
  });

  it('should preserve query parameters in state.from when redirecting', () => {
    mockIsAuthenticated = false;
    mockIsLoading = false;

    render(
      <MemoryRouter initialEntries={['/search?q=test&filter=active']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/search" element={<div>Search</div>} />
          </Route>
          <Route
            path={routes.public.login}
            element={<LocationDisplay />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Verify we're redirected to login
    const pathnameElement = screen.getByTestId('pathname');
    expect(pathnameElement.textContent).toBe('/login');

    // Verify state.from includes the full path with query params
    const stateElement = screen.getByTestId('state');
    const state = JSON.parse(stateElement.textContent || '{}');
    expect(state.from).toBe('/search?q=test&filter=active');
  });

  it('should preserve hash fragments in state.from when redirecting', () => {
    mockIsAuthenticated = false;
    mockIsLoading = false;

    render(
      <MemoryRouter initialEntries={['/docs#section-2']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/docs" element={<div>Docs</div>} />
          </Route>
          <Route
            path={routes.public.login}
            element={<LocationDisplay />}
          />
        </Routes>
      </MemoryRouter>
    );

    const stateElement = screen.getByTestId('state');
    const state = JSON.parse(stateElement.textContent || '{}');
    expect(state.from).toBe('/docs#section-2');
  });

  it('should preserve both query params and hash in state.from', () => {
    mockIsAuthenticated = false;
    mockIsLoading = false;

    render(
      <MemoryRouter initialEntries={['/settings?tab=profile#notifications']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/settings" element={<div>Settings</div>} />
          </Route>
          <Route
            path={routes.public.login}
            element={<LocationDisplay />}
          />
        </Routes>
      </MemoryRouter>
    );

    const stateElement = screen.getByTestId('state');
    const state = JSON.parse(stateElement.textContent || '{}');
    expect(state.from).toBe('/settings?tab=profile#notifications');
  });
});
