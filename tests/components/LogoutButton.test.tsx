/**
 * LogoutButton Component Tests
 *
 * Tests for the logout button UI, interactions, and state management.
 *
 * Story: 2.5 - Implement Logout Functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock sonner toast
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    error: (title: string, options?: { description?: string }) => mockToastError(title, options),
  },
}));

// Mock the auth store
const mockSignOut = vi.fn();
let mockIsAuthenticated = true;
let mockIsLoading = false;
let mockError: string | null = null;
let mockUser: { email?: string; user_metadata?: { display_name?: string } } | null = {
  email: 'test@example.com',
  user_metadata: { display_name: 'Test User' },
};

// Store state for getState()
const getStoreState = () => ({
  signOut: mockSignOut,
  isLoading: mockIsLoading,
  user: mockUser,
  error: mockError,
});

vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStore: Object.assign(
    (selector?: (state: unknown) => unknown) => {
      const state = getStoreState();
      return selector ? selector(state) : state;
    },
    {
      getState: () => getStoreState(),
    }
  ),
  useIsAuthenticated: () => mockIsAuthenticated,
  useUser: () => mockUser,
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
import { LogoutButton } from '@/components/LogoutButton';

// Test wrapper with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('LogoutButton', () => {
  beforeEach(() => {
    mockIsAuthenticated = true;
    mockIsLoading = false;
    mockError = null;
    mockUser = {
      email: 'test@example.com',
      user_metadata: { display_name: 'Test User' },
    };
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render logout button when user is authenticated', () => {
      renderWithRouter(<LogoutButton />);

      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('should not render when user is not authenticated', () => {
      mockIsAuthenticated = false;
      renderWithRouter(<LogoutButton />);

      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
    });

    it('should display "Logout" text by default', () => {
      renderWithRouter(<LogoutButton />);

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render with icon when showIcon is true', () => {
      renderWithRouter(<LogoutButton showIcon />);

      const button = screen.getByRole('button', { name: /logout/i });
      // Check that SVG icon is present
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render icon-only button when size is "icon"', () => {
      renderWithRouter(<LogoutButton size="icon" showIcon />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Logout');
      expect(button.querySelector('svg')).toBeInTheDocument();
      // Icon-only button should not have text
      expect(button.textContent).toBe('');
    });
  });

  describe('Button Variants and Styling', () => {
    it('should use outline variant by default', () => {
      renderWithRouter(<LogoutButton />);

      const button = screen.getByRole('button', { name: /logout/i });
      // Check that it has the outline variant class
      expect(button.className).toContain('border');
    });

    it('should apply custom variant', () => {
      renderWithRouter(<LogoutButton variant="ghost" />);

      const button = screen.getByRole('button', { name: /logout/i });
      expect(button.className).toContain('hover:bg-accent');
    });

    it('should apply custom className', () => {
      renderWithRouter(<LogoutButton className="custom-class" />);

      const button = screen.getByRole('button', { name: /logout/i });
      expect(button.className).toContain('custom-class');
    });

    it('should apply custom size', () => {
      renderWithRouter(<LogoutButton size="sm" />);

      const button = screen.getByRole('button', { name: /logout/i });
      // Small size uses h-8
      expect(button.className).toContain('h-8');
    });
  });

  describe('Logout Functionality', () => {
    it('should call signOut when clicked', async () => {
      mockSignOut.mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderWithRouter(<LogoutButton />);

      await user.click(screen.getByRole('button', { name: /logout/i }));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });

    it('should navigate to landing page after successful logout', async () => {
      mockSignOut.mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderWithRouter(<LogoutButton />);

      await user.click(screen.getByRole('button', { name: /logout/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should use replace: true to prevent back-button issues', async () => {
      mockSignOut.mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderWithRouter(<LogoutButton />);

      await user.click(screen.getByRole('button', { name: /logout/i }));

      await waitFor(() => {
        const [, options] = mockNavigate.mock.calls[0];
        expect(options.replace).toBe(true);
      });
    });
  });

  describe('Loading State', () => {
    it('should show "Logging out..." text when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<LogoutButton />);

      expect(screen.getByText('Logging out...')).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<LogoutButton />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading aria-label for icon-only button when loading', () => {
      mockIsLoading = true;
      renderWithRouter(<LogoutButton size="icon" showIcon />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Logging out...');
    });

    it('should not call signOut when button is clicked during loading', async () => {
      mockIsLoading = true;
      const user = userEvent.setup();
      renderWithRouter(<LogoutButton />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockSignOut).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button role', () => {
      renderWithRouter(<LogoutButton />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have accessible label for icon-only button', () => {
      renderWithRouter(<LogoutButton size="icon" showIcon />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Logout');
      expect(button).toHaveAttribute('title', 'Logout');
    });

    it('should have accessible label during loading for icon-only button', () => {
      mockIsLoading = true;
      renderWithRouter(<LogoutButton size="icon" showIcon />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Logging out...');
      expect(button).toHaveAttribute('title', 'Logging out...');
    });

    it('should have accessible label for regular button', () => {
      renderWithRouter(<LogoutButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Logout');
      expect(button).toHaveAttribute('title', 'Logout');
    });
  });

  describe('Error Handling', () => {
    it('should NOT navigate when signOut sets error in store', async () => {
      // Simulate signOut that sets error in store state
      mockSignOut.mockImplementation(async () => {
        mockError = 'Network error - logout failed';
      });
      const user = userEvent.setup();
      renderWithRouter(<LogoutButton />);

      await user.click(screen.getByRole('button', { name: /logout/i }));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });

      // Should show error toast
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Logout failed', {
          description: 'Network error - logout failed',
        });
      });

      // Navigation should NOT have been called
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error toast with error message from store', async () => {
      const errorMessage = 'Server connection failed';
      mockSignOut.mockImplementation(async () => {
        mockError = errorMessage;
      });
      const user = userEvent.setup();
      renderWithRouter(<LogoutButton />);

      await user.click(screen.getByRole('button', { name: /logout/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Logout failed', {
          description: errorMessage,
        });
      });
    });

    it('should navigate when signOut succeeds (no error in store)', async () => {
      // Simulate successful signOut (no error set)
      mockSignOut.mockImplementation(async () => {
        mockError = null;
      });
      const user = userEvent.setup();
      renderWithRouter(<LogoutButton />);

      await user.click(screen.getByRole('button', { name: /logout/i }));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });

      // Toast should NOT have been called
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });
});

describe('LogoutButton Integration', () => {
  beforeEach(() => {
    mockIsAuthenticated = true;
    mockIsLoading = false;
    mockError = null;
    mockUser = {
      email: 'test@example.com',
      user_metadata: { display_name: 'Test User' },
    };
    vi.clearAllMocks();
  });

  it('should complete full logout flow', async () => {
    mockSignOut.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithRouter(<LogoutButton />);

    // Click logout
    await user.click(screen.getByRole('button', { name: /logout/i }));

    // Verify signOut was called
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    // Verify navigation to landing page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should render correctly with different props combinations', () => {
    const { rerender } = renderWithRouter(
      <LogoutButton variant="ghost" size="sm" showIcon className="text-red-500" />
    );

    const button = screen.getByRole('button', { name: /logout/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('text-red-500');
    expect(button.querySelector('svg')).toBeInTheDocument();

    // Re-render with different props
    rerender(
      <MemoryRouter>
        <LogoutButton variant="destructive" size="lg" />
      </MemoryRouter>
    );

    const updatedButton = screen.getByRole('button', { name: /logout/i });
    expect(updatedButton.className).toContain('bg-destructive');
  });
});
