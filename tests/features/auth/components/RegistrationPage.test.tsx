/**
 * Registration Page Component Tests
 *
 * Tests for the registration form UI, validation, and user interactions.
 *
 * Story: 2.2 - Implement Email/Password Registration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';

// Mock the auth store
const mockSignUp = vi.fn();
const mockClearError = vi.fn();
let mockIsAuthenticated = false;
let mockIsLoading = false;
let mockError: string | null = null;

vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: () => ({
    signUp: mockSignUp,
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
import { RegistrationPage } from '@/features/auth/components/RegistrationPage';

// Test wrapper with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Helper to get form fields (using more specific selectors)
const getEmailInput = () => screen.getByRole('textbox', { name: /email/i });
const getPasswordInput = () => screen.getByPlaceholderText(/create a password/i);
const getSubmitButton = () => screen.getByRole('button', { name: /create account/i });

describe('RegistrationPage', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockIsLoading = false;
    mockError = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render registration form with email and password fields', () => {
      renderWithRouter(<RegistrationPage />);

      expect(getEmailInput()).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(getSubmitButton()).toBeInTheDocument();
    });

    it('should render page title and description', () => {
      renderWithRouter(<RegistrationPage />);

      expect(screen.getByText(/create an account/i)).toBeInTheDocument();
      expect(screen.getByText(/enter your email and password/i)).toBeInTheDocument();
    });

    it('should render link to login page', () => {
      renderWithRouter(<RegistrationPage />);

      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    });

    it('should have proper form input types', () => {
      renderWithRouter(<RegistrationPage />);

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have proper autocomplete attributes', () => {
      renderWithRouter(<RegistrationPage />);

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getEmailInput(), 'notanemail');
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty password on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for short password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getPasswordInput(), '1234567');
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        // Use getAllByText since both validation error and strength indicator show this text
        const elements = screen.getAllByText(/at least 8 characters/i);
        expect(elements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should not show validation error for valid inputs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

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
    it('should call signUp on form submission with valid inputs', async () => {
      mockSignUp.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should not call signUp when validation fails', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.click(getSubmitButton());

      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should redirect to leagues dashboard on successful registration', async () => {
      mockSignUp.mockResolvedValue({ success: true, user: {}, session: {} });
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
      });
    });

    it('should show email confirmation message when required', async () => {
      mockSignUp.mockResolvedValue({ success: true, emailConfirmationRequired: true });
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByText(/confirmation link/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<RegistrationPage />);

      const submitButton = screen.getByRole('button', { name: /creating account/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<RegistrationPage />);

      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    });

    it('should disable input fields when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<RegistrationPage />);

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error alert when error exists', () => {
      mockError = 'An account with this email already exists';
      renderWithRouter(<RegistrationPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });

    it('should clear error when email changes', async () => {
      mockError = 'Test error';
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getEmailInput(), 'a');

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it('should clear error when password changes', async () => {
      mockError = 'Test error';
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getPasswordInput(), 'a');

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

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

  describe('Password Strength Indicator', () => {
    it('should show password strength indicator when password is entered', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getPasswordInput(), 'weak');

      await waitFor(() => {
        expect(screen.getByText(/password strength/i)).toBeInTheDocument();
      });
    });

    it('should show weak strength for short password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getPasswordInput(), 'abc');

      await waitFor(() => {
        expect(screen.getByText(/weak/i)).toBeInTheDocument();
      });
    });

    it('should show strong strength for complex password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      await user.type(getPasswordInput(), 'SecureP@ss123!');

      await waitFor(() => {
        expect(screen.getByText(/strong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Redirect', () => {
    it('should redirect to leagues if already authenticated', async () => {
      mockIsAuthenticated = true;

      await act(async () => {
        renderWithRouter(<RegistrationPage />);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/leagues', { replace: true });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-invalid on email field with error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      const emailInput = getEmailInput();
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have proper aria-invalid on password field with error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationPage />);

      const passwordInput = getPasswordInput();
      await user.type(passwordInput, 'short');
      await user.tab();

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have accessible button labels', () => {
      renderWithRouter(<RegistrationPage />);

      expect(getSubmitButton()).toBeInTheDocument();
    });
  });
});
