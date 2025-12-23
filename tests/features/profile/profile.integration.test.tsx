/**
 * Profile Feature Integration Tests
 *
 * End-to-end integration tests for profile management functionality.
 * Tests the complete flow from profile view to edit to save.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { act } from '@testing-library/react';

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  const mockProfile = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    display_name: 'Test User',
    avatar_url: null,
    created_at: '2024-06-15T10:30:00.000Z',
    updated_at: '2024-06-15T10:30:00.000Z',
  };

  return {
    getSupabase: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      })),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          remove: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn(() => ({
            data: { publicUrl: 'https://example.com/avatar.jpg' },
          })),
        })),
      },
    })),
    isSupabaseConfigured: vi.fn(() => true),
  };
});

// Import stores and reset them
import { useProfileStore } from '@/features/profile/stores/profileStore';
import { ProfileView } from '@/features/profile/components/ProfileView';

// Mock auth store
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  user_metadata: {
    display_name: 'Test User',
    avatar_url: null,
  },
};

vi.mock('@/features/auth/stores/authStore', () => ({
  useUser: () => mockUser,
}));

// Wrapper with router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Profile Integration Tests', () => {
  beforeEach(() => {
    // Reset profile store before each test
    act(() => {
      useProfileStore.getState().reset();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile Page Load Flow', () => {
    it('should fetch profile data when ProfileView mounts', async () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      // Wait for profile to be fetched
      await waitFor(() => {
        const store = useProfileStore.getState();
        expect(store.profile).not.toBeNull();
      });

      // Profile data should be displayed
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should display Edit Profile button after profile loads', async () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edit Profile Flow', () => {
    it('should open edit dialog and display current profile data', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      // Wait for profile to load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });

      // Click edit button
      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      // Edit dialog should open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Current display name should be in the input
      const input = screen.getByPlaceholderText(/enter your display name/i);
      expect(input).toHaveValue('Test User');
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      // Wait for profile to load and open edit dialog
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click cancel
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Profile Validation', () => {
    it('should validate display name is required', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      // Wait for profile to load and open edit dialog
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Clear the input and try to save
      const input = screen.getByPlaceholderText(/enter your display name/i);
      await user.clear(input);
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Validation error should appear
      await waitFor(() => {
        expect(screen.getByText(/display name is required/i)).toBeInTheDocument();
      });
    });

    it('should validate display name minimum length', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      // Wait for profile to load and open edit dialog
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Enter short name
      const input = screen.getByPlaceholderText(/enter your display name/i);
      await user.clear(input);
      await user.type(input, 'AB');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Validation error should appear
      await waitFor(() => {
        expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Store State Management', () => {
    it('should reset store when reset is called', async () => {
      // Set some profile data
      act(() => {
        useProfileStore.getState().setProfile({
          id: 'test-id',
          email: 'test@test.com',
          display_name: 'Test',
          avatar_url: null,
          created_at: '',
          updated_at: '',
        });
      });

      expect(useProfileStore.getState().profile).not.toBeNull();

      // Reset
      act(() => {
        useProfileStore.getState().reset();
      });

      expect(useProfileStore.getState().profile).toBeNull();
      expect(useProfileStore.getState().isLoading).toBe(false);
      expect(useProfileStore.getState().error).toBeNull();
    });

    it('should clear error when clearError is called', () => {
      // Set an error
      act(() => {
        useProfileStore.setState({ error: 'Test error' });
      });

      expect(useProfileStore.getState().error).toBe('Test error');

      // Clear error
      act(() => {
        useProfileStore.getState().clearError();
      });

      expect(useProfileStore.getState().error).toBeNull();
    });
  });
});

describe('Profile Validation Utilities Integration', () => {
  it('should validate display name correctly', async () => {
    const { validateDisplayName } = await import('@/features/profile/utils/profileValidation');

    // Valid names
    expect(validateDisplayName('John Doe')).toBeUndefined();
    expect(validateDisplayName('User_123')).toBeUndefined();
    expect(validateDisplayName('Test-User')).toBeUndefined();

    // Invalid names
    expect(validateDisplayName('')).toBeDefined();
    expect(validateDisplayName('AB')).toBeDefined();
    expect(validateDisplayName('A'.repeat(51))).toBeDefined();
    expect(validateDisplayName('Invalid@Name')).toBeDefined();
  });

  it('should validate avatar file correctly', async () => {
    const { validateAvatarFile } = await import('@/features/profile/utils/profileValidation');

    // Valid file
    const validFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
    expect(validateAvatarFile(validFile)).toBeUndefined();

    // Invalid file type
    const invalidType = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    expect(validateAvatarFile(invalidType)).toBeDefined();

    // File too large (simulated)
    const largeFile = new File([new ArrayBuffer(3 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    expect(validateAvatarFile(largeFile)).toBeDefined();
  });

  it('should generate user initials correctly', async () => {
    const { getUserInitials } = await import('@/features/profile/utils/profileValidation');

    // From display name
    expect(getUserInitials('John Doe', 'john@example.com')).toBe('JD');
    expect(getUserInitials('Alice', 'alice@example.com')).toBe('AL');

    // From email when no display name
    expect(getUserInitials(null, 'john@example.com')).toBe('JO');
    expect(getUserInitials('', 'alice@example.com')).toBe('AL');

    // Fallback
    expect(getUserInitials(null, '')).toBe('U');
  });

  it('should generate avatar path correctly', async () => {
    const { generateAvatarPath } = await import('@/features/profile/utils/profileValidation');

    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const path = generateAvatarPath(userId, file);

    expect(path).toMatch(new RegExp(`^${userId}/\\d+-avatar\\.jpg$`));
  });
});
