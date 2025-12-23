/**
 * AppLayout Onboarding Integration Tests
 *
 * Tests the integration of OnboardingModal with AppLayout including:
 * - First-login detection
 * - Onboarding modal display
 * - Profile update on completion
 * - Modal dismissal
 *
 * Story: 11.6 - Create Basic Onboarding Flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useProfileStore } from '@/features/profile/stores/profileStore';
import type { User } from '@supabase/supabase-js';

// Mock the auth and profile stores
vi.mock('@/features/auth/stores/authStore');
vi.mock('@/features/profile/stores/profileStore');

// Mock child routes
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div>Main Content</div>,
  };
});

describe('AppLayout - Onboarding Integration', () => {
  const mockUser: Partial<User> = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      display_name: 'Test User',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('First-time User', () => {
    it('should show onboarding modal when onboarding_completed is false', async () => {
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn();

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser as User,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: {
          id: 'test-user-id',
          email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: null,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
      });
    });

    it('should show onboarding modal when onboarding_completed is null', async () => {
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn();

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser as User,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: {
          id: 'test-user-id',
          email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: null,
          onboarding_completed: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
      });
    });

    it('should fetch profile on mount when user exists and profile is null', async () => {
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn();

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser as User,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockFetchProfile).toHaveBeenCalledWith('test-user-id');
      });
    });
  });

  describe('Returning User', () => {
    it('should NOT show onboarding modal when onboarding_completed is true', async () => {
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn();

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser as User,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: {
          id: 'test-user-id',
          email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: null,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Main Content')).toBeInTheDocument();
      });

      expect(screen.queryByText('Welcome to Auction Projections!')).not.toBeInTheDocument();
    });
  });

  describe('Onboarding Completion', () => {
    it('should call updateProfile with onboarding_completed: true when user completes onboarding', async () => {
      const user = userEvent.setup();
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn().mockResolvedValue(true);

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser as User,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: {
          id: 'test-user-id',
          email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: null,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
      });

      // Navigate through all steps and complete
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith('test-user-id', {
          onboarding_completed: true,
        });
      });
    });

    it('should call updateProfile when user skips onboarding', async () => {
      const user = userEvent.setup();
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn().mockResolvedValue(true);

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser as User,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: {
          id: 'test-user-id',
          email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: null,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
      });

      // Click Skip button
      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith('test-user-id', {
          onboarding_completed: true,
        });
      });
    });

    it('should handle updateProfile failure gracefully', async () => {
      const user = userEvent.setup();
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn().mockResolvedValue(false);

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser as User,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: {
          id: 'test-user-id',
          email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: null,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
      });

      // Click Skip button
      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
      });

      // Modal should still be visible since update failed
      expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should not show modal when profile is null', async () => {
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn();

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser as User,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      expect(screen.queryByText('Welcome to Auction Projections!')).not.toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('should not fetch profile if already loaded', async () => {
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn();

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser as User,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: {
          id: 'test-user-id',
          email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: null,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      expect(mockFetchProfile).not.toHaveBeenCalled();
    });

    it('should not fetch profile when user is null', async () => {
      const mockFetchProfile = vi.fn();
      const mockUpdateProfile = vi.fn();

      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
      } as any);

      vi.mocked(useProfileStore).mockReturnValue({
        profile: null,
        fetchProfile: mockFetchProfile,
        updateProfile: mockUpdateProfile,
        isLoading: false,
        isUploading: false,
        isSaving: false,
        error: null,
      } as any);

      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      );

      expect(mockFetchProfile).not.toHaveBeenCalled();
    });
  });
});
