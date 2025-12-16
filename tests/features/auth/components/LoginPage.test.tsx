/**
 * Login Page Component Tests
 *
 * Tests for the login form UI, validation, and user interactions.
 * Tests returnTo redirect functionality for deep linking.
 * Tests Google OAuth sign-in functionality.
 *
 * Story: 2.3 - Implement Email/Password Login
 * Story: 2.4 - Implement Google OAuth Authentication
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { act } from 'react';

// Mock the auth store
const mockSignIn = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockHandleOAuthCallback = vi.fn();
const mockClearError = vi.fn();
let mockIsAuthenticated = false;
let mockIsLoading = false;
let mockError: string | null = null;

vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    handleOAuthCallback: mockHandleOAuthCallback,
    isLoading: mockIsLoading,
    error: mockError,
    clearError: mockClearError,
  }),
  useIsAuthenticated: () => mockIsAuthenticated,
  useAuthLoading: () => mockIsLoading,
  useAuthError: () => mockError,
}));

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Import after mocking
import { LoginPage } from '@/features/auth/components/LoginPage';

// Test wrapper with router - supports initialEntries for testing returnTo
const renderWithRouter = (
  component: React.ReactNode,
  { initialEntries = ['/login'] }: { initialEntries?: string[] } = {}
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={component} />
        <Route path="/leagues" element={<div>Leagues Page</div>} />
        <Route path="/leagues/:id" element={<div>League Detail Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// Helper to get form fields (using more specific selectors)
const getEmailInput = () => screen.getByRole('textbox', { name: /email/i });
const getPasswordInput = () => screen.getByPlaceholderText(/enter your password/i);
const getSubmitButton = () => screen.getByRole('button', { name: /sign in with email/i });
const getGoogleButton = () => screen.getByRole('button', { name: /sign in with google/i });

describe('LoginPage', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    mockError = null;
    vi.clearAllMocks();
    // Reset window location
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        search: '',
        pathname: '/login',
        origin: 'http://localhost:5173',
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form with email and password fields', () => {
      renderWithRouter(<LoginPage />);

      expect(getEmailInput()).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(getSubmitButton()).toBeInTheDocument();
    });

    it('should render page title and description', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in to your account to continue/i)).toBeInTheDocument();
    });

    it('should render link to registration page', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute(
        'href',
        '/register'
      );
    });

    it('should render forgot password link', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('should have proper form input types', () => {
      renderWithRouter(<LoginPage />);

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have proper autocomplete attributes for login', () => {
      renderWithRouter(<LoginPage />);

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      // Login uses current-password (not new-password like registration)
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('Google OAuth Button - Story 2.4', () => {
    it('should render Google sign-in button', () => {
      renderWithRouter(<LoginPage />);

      expect(getGoogleButton()).toBeInTheDocument();
    });

    it('should render Google icon in button', () => {
      renderWithRouter(<LoginPage />);

      const googleButton = getGoogleButton();
      // The SVG should be inside the button
      expect(googleButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should call signInWithGoogle when Google button is clicked', async () => {
      mockSignInWithGoogle.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.click(getGoogleButton());

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });
    });

    it('should disable Google button during loading', () => {
      mockIsLoading = true;
      renderWithRouter(<LoginPage />);

      // Get the button by finding the one that contains "Signing in..."
      const buttons = screen.getAllByRole('button');
      const loadingButton = buttons.find(btn => btn.textContent?.includes('Signing in'));
      expect(loadingButton).toBeDisabled();
    });

    it('should show loading text on Google button when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<LoginPage />);

      expect(screen.getAllByText(/signing in/i).length).toBeGreaterThan(0);
    });

    it('should clear error before Google sign-in', async () => {
      mockError = 'Previous error';
      mockSignInWithGoogle.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.click(getGoogleButton());

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it('should have Google brand styling on button', () => {
      renderWithRouter(<LoginPage />);

      const googleButton = getGoogleButton();
      // Check that it has white background class
      expect(googleButton.className).toContain('bg-white');
    });

    it('should render divider between OAuth and email form', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByText(/or continue with email/i)).toBeInTheDocument();
    });
  });

  describe('OAuth Error Handling - Story 2.4', () => {
    it('should display OAuth error when sign in with Google fails', () => {
      mockError = 'You must grant permission to continue';
      renderWithRouter(<LoginPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/grant permission/i)).toBeInTheDocument();
    });

    it('should display configuration error message', () => {
      mockError = 'Authentication service is misconfigured. Please contact support.';
      renderWithRouter(<LoginPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/misconfigured/i)).toBeInTheDocument();
    });

    it('should display network error for OAuth', () => {
      mockError = 'Unable to connect to Google. Please try again.';
      renderWithRouter(<LoginPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.type(getEmailInput(), 'notanemail');
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty password on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should NOT validate password length on login (security best practice)', async () => {
      // Unlike registration, login should NOT reveal password requirements
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      // Enter a short password - this should be allowed on login
      await user.type(getPasswordInput(), 'abc');
      await user.tab();

      // Wait to ensure no validation message appears
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should NOT show "at least 8 characters" error on login
      expect(screen.queryByText(/at least 8 characters/i)).not.toBeInTheDocument();
    });

    it('should not show validation error for valid inputs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call signIn on form submission with valid inputs', async () => {
      mockSignIn.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should not call signIn when validation fails', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.click(getSubmitButton());

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('should redirect to leagues dashboard on successful login', async () => {
      mockSignIn.mockResolvedValue({ success: true, user: {}, session: {} });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
      });
    });

    it('should redirect to returnTo URL after successful login', async () => {
      mockSignIn.mockResolvedValue({ success: true, user: {}, session: {} });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />, { initialEntries: ['/login?returnTo=/leagues/abc123'] });

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/leagues/abc123', { replace: true });
      });
    });

    it('should ignore invalid returnTo URL (external URL)', async () => {
      mockSignIn.mockResolvedValue({ success: true, user: {}, session: {} });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />, {
        initialEntries: ['/login?returnTo=https://malicious.com'],
      });

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        // Should ignore external URL and redirect to default /leagues
        expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
      });
    });

    it('should handle returnTo URL without leading slash', async () => {
      mockSignIn.mockResolvedValue({ success: true, user: {}, session: {} });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />, { initialEntries: ['/login?returnTo=leagues/abc123'] });

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        // Should redirect to default /leagues since returnTo doesn't start with /
        expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<LoginPage />);

      // Find button with "Signing in..." text
      const buttons = screen.getAllByRole('button');
      const loadingButtons = buttons.filter(btn => btn.textContent?.includes('Signing in'));
      expect(loadingButtons.length).toBeGreaterThan(0);
      loadingButtons.forEach(btn => expect(btn).toBeDisabled());
    });

    it('should show loading spinner when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<LoginPage />);

      expect(screen.getAllByText(/signing in/i).length).toBeGreaterThan(0);
    });

    it('should disable input fields when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<LoginPage />);

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error alert when error exists', () => {
      mockError = 'Invalid email or password';
      renderWithRouter(<LoginPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });

    it('should display specific error for unconfirmed email', () => {
      mockError = 'Please check your email and confirm your account';
      renderWithRouter(<LoginPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/confirm your account/i)).toBeInTheDocument();
    });

    it('should display network error message', () => {
      mockError = 'Unable to connect. Please check your internet connection and try again.';
      renderWithRouter(<LoginPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });

    it('should clear error when email changes', async () => {
      mockError = 'Test error';
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.type(getEmailInput(), 'a');

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it('should clear error when password changes', async () => {
      mockError = 'Test error';
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.type(getPasswordInput(), 'a');

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      const passwordInput = getPasswordInput();
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially password type
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide
      const hideButton = screen.getByRole('button', { name: /hide password/i });
      await user.click(hideButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Authentication Redirect', () => {
    it('should redirect to leagues if already authenticated', async () => {
      mockIsAuthenticated = true;

      await act(async () => {
        renderWithRouter(<LoginPage />);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
      });
    });

    it('should redirect to returnTo if already authenticated and returnTo provided', async () => {
      mockIsAuthenticated = true;

      await act(async () => {
        renderWithRouter(<LoginPage />, { initialEntries: ['/login?returnTo=/leagues/xyz'] });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/leagues/xyz', { replace: true });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-invalid on email field with error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      const emailInput = getEmailInput();
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have proper aria-invalid on password field with error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      // Click submit without entering password to trigger error
      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      await waitFor(() => {
        const passwordInput = getPasswordInput();
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have accessible button labels', () => {
      renderWithRouter(<LoginPage />);

      expect(getSubmitButton()).toBeInTheDocument();
      expect(getGoogleButton()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });

    it('should have accessible form labels', () => {
      renderWithRouter(<LoginPage />);

      // Use more specific selectors to avoid matching multiple elements
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    });
  });

  describe('No Password Strength Indicator (Security)', () => {
    it('should NOT show password strength indicator on login page', async () => {
      // Unlike registration, login should NOT reveal password requirements
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      await user.type(getPasswordInput(), 'weakpassword');

      // Password strength indicator should NOT be present
      expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/weak|fair|good|strong/i)).not.toBeInTheDocument();
    });
  });

  describe('Forgot Password Dialog', () => {
    it('should open dialog when forgot password is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      const forgotPasswordButton = screen.getByRole('button', { name: /forgot password/i });
      await user.click(forgotPasswordButton);

      // Dialog title should be visible (using text instead of role for reliability)
      await waitFor(
        () => {
          expect(screen.getByText('Password Reset')).toBeInTheDocument();
          expect(
            screen.getByText(/password reset functionality will be available in a future update/i)
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should close dialog when Got it button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      // Open dialog
      const forgotPasswordButton = screen.getByRole('button', { name: /forgot password/i });
      await user.click(forgotPasswordButton);

      // Wait for dialog to be visible
      await waitFor(
        () => {
          expect(screen.getByText('Password Reset')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click Got it button
      const gotItButton = screen.getByRole('button', { name: /got it/i });
      await user.click(gotItButton);

      // Dialog should be closed
      await waitFor(
        () => {
          expect(screen.queryByText('Password Reset')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Open Redirect Prevention (Security)', () => {
    it('should block protocol-relative URLs (//malicious.com)', async () => {
      mockSignIn.mockResolvedValue({ success: true, user: {}, session: {} });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />, {
        initialEntries: ['/login?returnTo=//malicious.com'],
      });

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        // Should ignore protocol-relative URL and redirect to default /leagues
        expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
      });
    });

    it('should block URLs with embedded protocols', async () => {
      mockSignIn.mockResolvedValue({ success: true, user: {}, session: {} });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />, {
        initialEntries: ['/login?returnTo=/redirect?url=http://evil.com'],
      });

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        // Should ignore URL with embedded protocol and redirect to default /leagues
        expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
      });
    });

    it('should allow valid internal paths', async () => {
      mockSignIn.mockResolvedValue({ success: true, user: {}, session: {} });
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />, {
        initialEntries: ['/login?returnTo=/dashboard/settings'],
      });

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/settings', { replace: true });
      });
    });
  });
});

describe('LoginPage Integration with Store', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    mockError = null;
    vi.clearAllMocks();
  });

  it('should handle sign in failure and show error', async () => {
    mockSignIn.mockResolvedValue({
      success: false,
      error: { message: 'Invalid email or password' },
    });

    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.type(getEmailInput(), 'test@example.com');
    await user.type(getPasswordInput(), 'wrongpassword');
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    });

    // Navigation should NOT be called on failure
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show loading state during sign in', async () => {
    let resolveSignIn: (value: unknown) => void = () => {};
    mockSignIn.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveSignIn = resolve;
        })
    );

    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.type(getEmailInput(), 'test@example.com');
    await user.type(getPasswordInput(), 'password123');

    // Start submission
    const submitPromise = user.click(getSubmitButton());

    // Check that signIn was called
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

    // Resolve the promise
    await act(async () => {
      resolveSignIn({ success: true, user: {}, session: {} });
    });

    await submitPromise;

    // Navigation should occur after success
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});

describe('LoginPage Google OAuth Integration - Story 2.4', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    mockError = null;
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        search: '',
        pathname: '/login',
        origin: 'http://localhost:5173',
      },
      writable: true,
    });
  });

  it('should handle Google OAuth sign in failure', async () => {
    mockSignInWithGoogle.mockResolvedValue({
      success: false,
      error: 'You must grant permission to continue',
    });

    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.click(getGoogleButton());

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });

    // Navigation should NOT be called on failure
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle Google OAuth configuration error', async () => {
    mockSignInWithGoogle.mockResolvedValue({
      success: false,
      error: 'Authentication service is misconfigured. Please contact support.',
    });

    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.click(getGoogleButton());

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });
});

describe('LoginPage OAuth Callback with returnTo - Story 2.4', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    mockError = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to returnTo URL after successful OAuth callback', async () => {
    // Simulate OAuth callback with access_token in hash and returnTo in query
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#access_token=test-token&token_type=bearer',
        search: '?returnTo=/leagues/abc123',
        pathname: '/login',
        origin: 'http://localhost:5173',
      },
      writable: true,
    });

    // Mock window.history.replaceState
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

    mockHandleOAuthCallback.mockResolvedValue({
      success: true,
      user: { id: 'user-123', email: 'test@example.com' },
      session: { access_token: 'test-token' },
    });

    await act(async () => {
      renderWithRouter(<LoginPage />, { initialEntries: ['/login?returnTo=/leagues/abc123'] });
    });

    await waitFor(() => {
      expect(mockHandleOAuthCallback).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/leagues/abc123', { replace: true });
    });

    replaceStateSpy.mockRestore();
  });

  it('should redirect to default /leagues after OAuth callback without returnTo', async () => {
    // Simulate OAuth callback with access_token in hash, no returnTo
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#access_token=test-token&token_type=bearer',
        search: '',
        pathname: '/login',
        origin: 'http://localhost:5173',
      },
      writable: true,
    });

    // Mock window.history.replaceState
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

    mockHandleOAuthCallback.mockResolvedValue({
      success: true,
      user: { id: 'user-123', email: 'test@example.com' },
      session: { access_token: 'test-token' },
    });

    await act(async () => {
      renderWithRouter(<LoginPage />, { initialEntries: ['/login'] });
    });

    await waitFor(() => {
      expect(mockHandleOAuthCallback).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
    });

    replaceStateSpy.mockRestore();
  });

  it('should clean up URL after OAuth callback processing', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#access_token=test-token&token_type=bearer',
        search: '?returnTo=/leagues/xyz',
        pathname: '/login',
        origin: 'http://localhost:5173',
      },
      writable: true,
    });

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

    mockHandleOAuthCallback.mockResolvedValue({
      success: true,
      user: { id: 'user-123' },
      session: { access_token: 'test-token' },
    });

    await act(async () => {
      renderWithRouter(<LoginPage />, { initialEntries: ['/login?returnTo=/leagues/xyz'] });
    });

    await waitFor(() => {
      expect(replaceStateSpy).toHaveBeenCalled();
    });

    replaceStateSpy.mockRestore();
  });

  it('should block malicious returnTo URL in OAuth callback', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#access_token=test-token&token_type=bearer',
        search: '?returnTo=https://evil.com',
        pathname: '/login',
        origin: 'http://localhost:5173',
      },
      writable: true,
    });

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

    mockHandleOAuthCallback.mockResolvedValue({
      success: true,
      user: { id: 'user-123' },
      session: { access_token: 'test-token' },
    });

    await act(async () => {
      renderWithRouter(<LoginPage />, { initialEntries: ['/login?returnTo=https://evil.com'] });
    });

    await waitFor(() => {
      expect(mockHandleOAuthCallback).toHaveBeenCalled();
    });

    await waitFor(() => {
      // Should redirect to default /leagues, not the malicious URL
      expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
    });

    replaceStateSpy.mockRestore();
  });
});
