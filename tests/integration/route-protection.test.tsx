/**
 * Route Protection Integration Tests
 *
 * Tests for the complete route protection flow including:
 * - ProtectedRoutes and AuthRoutes working together
 * - Return-to-URL functionality
 * - Authentication state transitions
 * - Full user flows
 *
 * Story: 2.7 - Implement Protected Routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Mock the auth store hooks with controllable state
let mockIsAuthenticated = false;
let mockIsLoading = false;

vi.mock('@/features/auth/stores/authStore', () => ({
  useIsAuthenticated: () => mockIsAuthenticated,
  useAuthLoading: () => mockIsLoading,
  useAuthStore: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = {
        user: mockIsAuthenticated ? { id: 'user-123', email: 'test@example.com' } : null,
        session: mockIsAuthenticated ? { access_token: 'token' } : null,
        isLoading: mockIsLoading,
        isInitialized: true,
        initialize: vi.fn(),
      };
      return selector ? selector(state) : state;
    },
    {
      getState: () => ({
        user: mockIsAuthenticated ? { id: 'user-123' } : null,
        session: mockIsAuthenticated ? { access_token: 'token' } : null,
        isInitialized: true,
      }),
    }
  ),
}));

// Import after mocking
import { ProtectedRoutes, AdminRoutes } from '@/routes/ProtectedRoutes';
import { AuthRoutes } from '@/routes/AuthRoutes';
import { routes } from '@/routes';

// Helper component to display current location
function LocationDisplay() {
  const location = useLocation();
  return (
    <div data-testid="location">
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="state">{JSON.stringify(location.state)}</span>
    </div>
  );
}

// Page components for testing
const LandingPage = () => (
  <div data-testid="landing-page">
    Landing Page
    <LocationDisplay />
  </div>
);

const LoginPage = () => (
  <div data-testid="login-page">
    Login Page
    <LocationDisplay />
  </div>
);

const RegisterPage = () => (
  <div data-testid="register-page">
    Register Page
    <LocationDisplay />
  </div>
);

const DashboardPage = () => (
  <div data-testid="dashboard-page">
    Dashboard Page
    <LocationDisplay />
  </div>
);

const LeaguesPage = () => (
  <div data-testid="leagues-page">
    Leagues Page
    <LocationDisplay />
  </div>
);

const ProfilePage = () => (
  <div data-testid="profile-page">
    Profile Page
    <LocationDisplay />
  </div>
);

const DraftPage = () => (
  <div data-testid="draft-page">
    Draft Page
    <LocationDisplay />
  </div>
);

const AdminPage = () => (
  <div data-testid="admin-page">
    Admin Page
    <LocationDisplay />
  </div>
);

// Full router simulation
const renderFullRouter = (initialEntry: string) => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        {/* Public route */}
        <Route path={routes.public.home} element={<LandingPage />} />

        {/* Auth routes (login, register) */}
        <Route element={<AuthRoutes />}>
          <Route path={routes.public.login} element={<LoginPage />} />
          <Route path={routes.public.register} element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path={routes.protected.dashboard} element={<DashboardPage />} />
          <Route path={routes.protected.leagues} element={<LeaguesPage />} />
          <Route path={routes.protected.profile} element={<ProfilePage />} />
          <Route path={routes.protected.draft} element={<DraftPage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoutes />}>
          <Route path={routes.admin.dashboard} element={<AdminPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('Route Protection Integration', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    vi.clearAllMocks();
  });

  describe('Unauthenticated User Flow', () => {
    it('should allow access to public landing page', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/');

      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should allow access to login page when not authenticated', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/login');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should allow access to register page when not authenticated', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/register');

      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    it('should redirect to login when accessing /leagues', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/leagues');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('leagues-page')).not.toBeInTheDocument();
    });

    it('should redirect to login when accessing /dashboard', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/dashboard');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should redirect to login when accessing /profile', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/profile');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should redirect to login when accessing /draft/:leagueId', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/draft/league-123');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should redirect to login when accessing /admin', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/admin');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Authenticated User Flow', () => {
    it('should allow access to public landing page', () => {
      mockIsAuthenticated = true;
      renderFullRouter('/');

      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should redirect from login to leagues when authenticated', () => {
      mockIsAuthenticated = true;
      renderFullRouter('/login');

      expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should redirect from register to leagues when authenticated', () => {
      mockIsAuthenticated = true;
      renderFullRouter('/register');

      expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
      expect(screen.queryByTestId('register-page')).not.toBeInTheDocument();
    });

    it('should allow access to /leagues when authenticated', () => {
      mockIsAuthenticated = true;
      renderFullRouter('/leagues');

      expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
    });

    it('should allow access to /dashboard when authenticated', () => {
      mockIsAuthenticated = true;
      renderFullRouter('/dashboard');

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('should allow access to /profile when authenticated', () => {
      mockIsAuthenticated = true;
      renderFullRouter('/profile');

      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    it('should allow access to /draft/:leagueId when authenticated', () => {
      mockIsAuthenticated = true;
      renderFullRouter('/draft/league-123');

      expect(screen.getByTestId('draft-page')).toBeInTheDocument();
    });

    it('should allow access to /admin when authenticated', () => {
      mockIsAuthenticated = true;
      renderFullRouter('/admin');

      // AdminRoutes currently allows authenticated users (role check TODO)
      expect(screen.getByTestId('admin-page')).toBeInTheDocument();
    });
  });

  describe('Return-to-URL Flow', () => {
    it('should preserve intended destination in redirect state', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/leagues');

      // Check that state.from contains the original path
      const stateElement = screen.getByTestId('state');
      expect(stateElement.textContent).toContain('"from":"/leagues"');
    });

    it('should preserve /dashboard in redirect state', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/dashboard');

      const stateElement = screen.getByTestId('state');
      expect(stateElement.textContent).toContain('"from":"/dashboard"');
    });

    it('should preserve /profile in redirect state', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/profile');

      const stateElement = screen.getByTestId('state');
      expect(stateElement.textContent).toContain('"from":"/profile"');
    });

    it('should preserve dynamic route parameters in redirect state', () => {
      mockIsAuthenticated = false;
      renderFullRouter('/draft/my-league-uuid');

      const stateElement = screen.getByTestId('state');
      expect(stateElement.textContent).toContain('"from":"/draft/my-league-uuid"');
    });

    it('should redirect to state.from after authentication', () => {
      mockIsAuthenticated = true;

      render(
        <MemoryRouter
          initialEntries={[{ pathname: '/login', state: { from: '/dashboard' } }]}
        >
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path={routes.protected.leagues} element={<LeaguesPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('should redirect to leagues when state.from is not provided', () => {
      mockIsAuthenticated = true;
      renderFullRouter('/login');

      expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading on protected routes during auth check', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;
      renderFullRouter('/leagues');

      expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
      expect(screen.queryByTestId('leagues-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should show loading on auth routes during auth check', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;
      renderFullRouter('/login');

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should show loading on admin routes during auth check', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;
      renderFullRouter('/admin');

      expect(screen.getByText('Verifying permissions...')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
    });

    it('should not affect public routes during loading', () => {
      mockIsLoading = true;
      mockIsAuthenticated = false;
      renderFullRouter('/');

      // Public routes don't use auth wrappers, so they render immediately
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
  });

  describe('Complete User Journey', () => {
    it('should handle: unauthenticated -> try protected -> login -> return to protected', () => {
      // Step 1: User is not authenticated and tries to access /leagues
      mockIsAuthenticated = false;
      mockIsLoading = false;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/leagues']}>
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
              <Route path="/leagues" element={<LeaguesPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Should be redirected to login
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('state').textContent).toContain('"from":"/leagues"');

      // Step 2: User logs in (simulate by changing auth state)
      mockIsAuthenticated = true;

      // Re-render with the saved state (simulating coming from login)
      rerender(
        <MemoryRouter
          initialEntries={[{ pathname: '/login', state: { from: '/leagues' } }]}
        >
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
              <Route path="/leagues" element={<LeaguesPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Should be redirected back to /leagues
      expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
    });

    it('should handle: authenticated -> logout -> try protected -> redirect to login', () => {
      // Step 1: User is authenticated
      mockIsAuthenticated = true;
      mockIsLoading = false;

      const { rerender } = render(
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leagues" element={<LeaguesPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // User sees profile page
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();

      // Step 2: User logs out
      mockIsAuthenticated = false;

      // User tries to navigate to another protected route
      rerender(
        <MemoryRouter initialEntries={['/leagues']}>
          <Routes>
            <Route element={<AuthRoutes />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leagues" element={<LeaguesPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Should be redirected to login
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should handle: authenticated user visits login -> redirects to leagues', () => {
      mockIsAuthenticated = true;

      renderFullRouter('/login');

      // Already authenticated, should redirect to leagues
      expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });
  });

  describe('Route Groups Isolation', () => {
    it('should keep public routes separate from protection - unauthenticated', () => {
      // Landing page should work when not authenticated
      mockIsAuthenticated = false;
      renderFullRouter('/');
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should keep public routes separate from protection - authenticated', () => {
      // Landing page should work when authenticated
      mockIsAuthenticated = true;
      renderFullRouter('/');
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should correctly categorize all protected routes', () => {
      mockIsAuthenticated = false;

      // All these should redirect to login
      const protectedPaths = ['/dashboard', '/leagues', '/profile', '/draft/test'];

      protectedPaths.forEach(path => {
        const { unmount } = renderFullRouter(path);
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        unmount();
      });
    });

    it('should correctly categorize all auth routes', () => {
      mockIsAuthenticated = true;

      // All these should redirect to leagues
      const authPaths = ['/login', '/register'];

      authPaths.forEach(path => {
        const { unmount } = renderFullRouter(path);
        expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('No Flash of Unauthenticated Content', () => {
    it('should show loading instead of redirecting during auth check', () => {
      // During loading, should not show protected content NOR login
      mockIsLoading = true;
      mockIsAuthenticated = false;

      renderFullRouter('/leagues');

      expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
      expect(screen.queryByTestId('leagues-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should show loading on auth routes during check', () => {
      mockIsLoading = true;
      mockIsAuthenticated = true; // Even if authenticated

      renderFullRouter('/login');

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('leagues-page')).not.toBeInTheDocument();
    });
  });
});

describe('Route Protection Edge Cases', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
  });

  it('should handle rapid auth state changes', () => {
    mockIsLoading = true;

    const { rerender } = renderFullRouter('/leagues');
    expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();

    // Quick succession of state changes
    mockIsLoading = false;
    mockIsAuthenticated = false;

    rerender(
      <MemoryRouter initialEntries={['/leagues']}>
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route path="/leagues" element={<LeaguesPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();

    mockIsAuthenticated = true;

    rerender(
      <MemoryRouter initialEntries={['/leagues']}>
        <Routes>
          <Route element={<AuthRoutes />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route path="/leagues" element={<LeaguesPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('leagues-page')).toBeInTheDocument();
  });

  it('should handle multiple protected route levels', () => {
    mockIsAuthenticated = true;

    // Test accessing nested protected routes
    render(
      <MemoryRouter initialEntries={['/leagues/123/teams/456']}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route
              path="/leagues/:leagueId/teams/:teamId"
              element={<div data-testid="nested-protected">Nested</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('nested-protected')).toBeInTheDocument();
  });
});
