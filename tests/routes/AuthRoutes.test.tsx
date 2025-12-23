/**
 * AuthRoutes Component Tests
 *
 * Tests for the auth route wrapper component that handles
 * login/register routes (redirects authenticated users away).
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
import { AuthRoutes } from '@/routes/AuthRoutes';
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

// Auth content components
function LoginContent() {
  return <div data-testid="login-content">Login Form</div>;
}

function RegisterContent() {
  return <div data-testid="register-content">Register Form</div>;
}

// Test wrapper with router
const renderWithRouter = (
  initialEntry: string = '/login',
  locationState?: { from?: string }
) => {
  const entries = locationState
    ? [{ pathname: initialEntry, state: locationState }]
    : [initialEntry];

  return render(
    <MemoryRouter initialEntries={entries}>
      <Routes>
        {/* Auth routes (login, register) */}
        <Route element={<AuthRoutes />}>
          <Route path="/login" element={<LoginContent />} />
          <Route path="/register" element={<RegisterContent />} />
        </Route>
        {/* Protected routes for redirect testing */}
        <Route
          path={routes.protected.leagues}
          element={
            <>
              <div data-testid="leagues-page">Leagues Page</div>
              <LocationDisplay />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <div data-testid="dashboard-page">Dashboard Page</div>
              <LocationDisplay />
            </>
          }
        />
        <Route
          path="/draft/:leagueId"
          element={
            <>
              <div data-testid="draft-page">Draft Page</div>
              <LocationDisplay />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <div data-testid="profile-page">Profile Page</div>
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('AuthRoutes', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when auth is loading', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;
      renderWithRouter('/login');

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('login-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('leagues-page')).not.toBeInTheDocument();
    });

    it('should show loading spinner with correct styling', () => {
      mockIsLoading = true;
      renderWithRouter('/login');

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('border-emerald-400');
    });

    it('should show loading state even when authenticated', () => {
      mockIsLoading = true;
      mockIsAuthenticated = true;
      renderWithRouter('/login');

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('login-content')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated Access', () => {
    it('should render login content when not authenticated', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      renderWithRouter('/login');

      expect(screen.getByTestId('login-content')).toBeInTheDocument();
      expect(screen.queryByTestId('leagues-page')).not.toBeInTheDocument();
    });

    it('should render register content when not authenticated', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      renderWithRouter('/register');

      expect(screen.getByTestId('register-content')).toBeInTheDocument();
      expect(screen.queryByTestId('leagues-page')).not.toBeInTheDocument();
    });

    it('should render Outlet for nested auth routes', () => {
      mockIsAuthenticated = false;
      mockIsLoading = false;
      renderWithRouter('/login');

      expect(screen.getByTestId('login-content')).toBeInTheDocument();
    });
  });

  describe('Authenticated Redirect - Default Destination', () => {
    it('should redirect to leagues when authenticated and no state.from', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/login');

      // Should redirect to leagues (default destination)
      expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-content')).not.toBeInTheDocument();
    });

    it('should redirect to leagues from register page when authenticated', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/register');

      expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
      expect(screen.queryByTestId('register-content')).not.toBeInTheDocument();
    });

    it('should redirect to correct default route defined in routes config', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/login');

      const pathnameElement = screen.getByTestId('pathname');
      expect(pathnameElement.textContent).toBe(routes.protected.leagues);
    });
  });

  describe('Authenticated Redirect - Return-to-URL (state.from)', () => {
    it('should redirect to state.from when authenticated', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/login', { from: '/dashboard' });

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-content')).not.toBeInTheDocument();
    });

    it('should redirect to state.from with route parameters', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/login', { from: '/draft/my-league-123' });

      expect(screen.getByTestId('draft-page')).toBeInTheDocument();
    });

    it('should redirect to profile when state.from is /profile', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/login', { from: '/profile' });

      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    it('should use leagues as fallback when state.from is undefined', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/login', { from: undefined });

      expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
    });

    it('should handle register page with state.from', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;
      renderWithRouter('/register', { from: '/dashboard' });

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      expect(screen.queryByTestId('register-content')).not.toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('should handle transition from loading to authenticated', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginContent />} />
            </Route>
            <Route
              path={routes.protected.leagues}
              element={<div data-testid="leagues">Leagues</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      // Initially loading
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Update state to authenticated
      mockIsLoading = false;
      mockIsAuthenticated = true;

      rerender(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginContent />} />
            </Route>
            <Route
              path={routes.protected.leagues}
              element={<div data-testid="leagues">Leagues</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('leagues')).toBeInTheDocument();
    });

    it('should handle transition from loading to not authenticated', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginContent />} />
            </Route>
            <Route
              path={routes.protected.leagues}
              element={<div data-testid="leagues">Leagues</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      // Initially loading
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Update state to not authenticated
      mockIsLoading = false;
      mockIsAuthenticated = false;

      rerender(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginContent />} />
            </Route>
            <Route
              path={routes.protected.leagues}
              element={<div data-testid="leagues">Leagues</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string state.from', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;

      render(
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '' } }]}>
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginContent />} />
            </Route>
            <Route
              path={routes.protected.leagues}
              element={<div data-testid="leagues">Leagues</div>}
            />
            <Route path="" element={<div data-testid="empty-route">Empty</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Empty string is falsy, so should fallback to leagues
      // Note: This depends on implementation - empty string evaluates to falsy
      // so it should use the default route
      expect(screen.getByTestId('leagues')).toBeInTheDocument();
    });

    it('should handle null location state', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;

      render(
        <MemoryRouter initialEntries={[{ pathname: '/login', state: null }]}>
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginContent />} />
            </Route>
            <Route
              path={routes.protected.leagues}
              element={<div data-testid="leagues">Leagues</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('leagues')).toBeInTheDocument();
    });

    it('should handle state with additional properties beyond from', () => {
      mockIsAuthenticated = true;
      mockIsLoading = false;

      render(
        <MemoryRouter
          initialEntries={[
            { pathname: '/login', state: { from: '/dashboard', extra: 'data' } },
          ]}
        >
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginContent />} />
            </Route>
            <Route
              path="/dashboard"
              element={<div data-testid="dashboard">Dashboard</div>}
            />
            <Route
              path={routes.protected.leagues}
              element={<div data-testid="leagues">Leagues</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });
});

describe('AuthRoutes Security - Open Redirect Prevention', () => {
  beforeEach(() => {
    mockIsAuthenticated = true;
    mockIsLoading = false;
  });

  it('should block external URLs in state.from', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { from: 'https://evil.com' } }]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route
            path={routes.protected.leagues}
            element={<div data-testid="leagues">Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to safe default, not external URL
    expect(screen.getByTestId('leagues')).toBeInTheDocument();
  });

  it('should block protocol-relative URLs (//evil.com)', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { from: '//evil.com/path' } }]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route
            path={routes.protected.leagues}
            element={<div data-testid="leagues">Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to safe default
    expect(screen.getByTestId('leagues')).toBeInTheDocument();
  });

  it('should block javascript: protocol URLs', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { from: 'javascript:alert(1)' } }]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route
            path={routes.protected.leagues}
            element={<div data-testid="leagues">Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to safe default
    expect(screen.getByTestId('leagues')).toBeInTheDocument();
  });

  it('should allow valid internal paths starting with /', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { from: '/dashboard' } }]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
          <Route
            path={routes.protected.leagues}
            element={<div data-testid="leagues">Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to the valid internal path
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('should allow paths with query parameters', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { from: '/search?q=test&filter=active' } }]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route path="/search" element={<div data-testid="search">Search</div>} />
          <Route
            path={routes.protected.leagues}
            element={<div data-testid="leagues">Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to the path with query params
    expect(screen.getByTestId('search')).toBeInTheDocument();
  });

  it('should allow paths with hash fragments', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { from: '/docs#section-1' } }]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route path="/docs" element={<div data-testid="docs">Docs</div>} />
          <Route
            path={routes.protected.leagues}
            element={<div data-testid="leagues">Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to the path with hash
    expect(screen.getByTestId('docs')).toBeInTheDocument();
  });
});

describe('AuthRoutes Return-to-URL Flow', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
  });

  it('should complete full return-to-URL flow simulation', () => {
    // Step 1: User tries to access protected route, gets redirected to login
    // (This part is tested in ProtectedRoutes tests)

    // Step 2: User lands on login with state.from set
    // Initially not authenticated
    mockIsAuthenticated = false;
    mockIsLoading = false;

    const { rerender } = render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { from: '/leagues' } }]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route
            path="/leagues"
            element={<div data-testid="leagues">Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // User sees login form
    expect(screen.getByTestId('login-content')).toBeInTheDocument();

    // Step 3: User logs in (state changes)
    mockIsAuthenticated = true;

    rerender(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { from: '/leagues' } }]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route
            path="/leagues"
            element={<div data-testid="leagues">Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // User is redirected to originally intended page
    expect(screen.getByTestId('leagues')).toBeInTheDocument();
  });

  it('should preserve deep route with params in return-to-URL', () => {
    mockIsAuthenticated = false;

    const { rerender } = render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/login', state: { from: '/draft/league-uuid-123' } },
        ]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route
            path="/draft/:leagueId"
            element={<div data-testid="draft">Draft Room</div>}
          />
          <Route
            path={routes.protected.leagues}
            element={<div>Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-content')).toBeInTheDocument();

    // User authenticates
    mockIsAuthenticated = true;

    rerender(
      <MemoryRouter
        initialEntries={[
          { pathname: '/login', state: { from: '/draft/league-uuid-123' } },
        ]}
      >
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
          <Route
            path="/draft/:leagueId"
            element={<div data-testid="draft">Draft Room</div>}
          />
          <Route
            path={routes.protected.leagues}
            element={<div>Leagues</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Redirected to the original deep route
    expect(screen.getByTestId('draft')).toBeInTheDocument();
  });
});
