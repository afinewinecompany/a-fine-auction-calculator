/**
 * ProfileView Component Tests
 *
 * Tests for the main profile view page component including
 * data display, loading states, and edit functionality.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ProfileView } from '@/features/profile/components/ProfileView';

// Mock profile data
const mockProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-06-15T10:30:00.000Z',
  updated_at: '2024-06-20T14:00:00.000Z',
};

const mockUser = {
  id: mockProfile.id,
  email: mockProfile.email,
  user_metadata: {
    display_name: mockProfile.display_name,
    avatar_url: mockProfile.avatar_url,
  },
};

// Mock stores
const mockFetchProfile = vi.fn();
const mockClearError = vi.fn();

vi.mock('@/features/auth/stores/authStore', () => ({
  useUser: () => mockUser,
}));

vi.mock('@/features/profile/stores/profileStore', () => ({
  useProfileStore: () => ({
    profile: mockProfile,
    isLoading: false,
    error: null,
    fetchProfile: mockFetchProfile,
    clearError: mockClearError,
  }),
}));

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render profile page header', () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByText(/manage your profile information/i)).toBeInTheDocument();
    });

    it('should display user display name', () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      expect(screen.getByText(mockProfile.display_name)).toBeInTheDocument();
    });

    it('should display user email', () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      expect(screen.getByText(mockProfile.email)).toBeInTheDocument();
    });

    it('should display avatar container', () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      // Avatar component exists - image loads asynchronously in Radix
      const avatarContainer = document.querySelector('[data-slot="avatar"]');
      expect(avatarContainer).toBeInTheDocument();
    });

    it('should display Edit Profile button', () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });

    it('should display member since date', () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      // The date should be formatted
      expect(screen.getByText(/member since/i)).toBeInTheDocument();
      expect(screen.getByText(/june 15, 2024/i)).toBeInTheDocument();
    });

    it('should display last updated date when different from created', () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      expect(screen.getByText(/last updated/i)).toBeInTheDocument();
      expect(screen.getByText(/june 20, 2024/i)).toBeInTheDocument();
    });
  });

  describe('Fetch Profile', () => {
    it('should call fetchProfile on mount', () => {
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      expect(mockFetchProfile).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('Edit Profile Dialog', () => {
    it('should open edit dialog when Edit Profile button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      // Edit dialog should be opened
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should call clearError when opening edit dialog', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <ProfileView />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      expect(mockClearError).toHaveBeenCalled();
    });
  });
});

/**
 * Note: Loading, error, and no-user state tests are in separate files
 * to enable proper module mocking isolation:
 * - ProfileView.loading.test.tsx
 * - ProfileView.error.test.tsx
 * - ProfileView.nouser.test.tsx
 */
