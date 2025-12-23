/**
 * ProfileView No User State Tests
 *
 * Isolated test file for unauthenticated state to enable proper module mocking.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock stores BEFORE importing components - no user logged in
vi.mock('@/features/auth/stores/authStore', () => ({
  useUser: () => null,
}));

vi.mock('@/features/profile/stores/profileStore', () => ({
  useProfileStore: () => ({
    profile: null,
    isLoading: false,
    error: null,
    fetchProfile: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Import component AFTER mocks are set up
import { ProfileView } from '@/features/profile/components/ProfileView';

describe('ProfileView No User State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show sign in message when no user', () => {
    render(
      <BrowserRouter>
        <ProfileView />
      </BrowserRouter>
    );

    // Should show sign in prompt
    expect(screen.getByText(/please sign in/i)).toBeInTheDocument();
  });

  it('should not show profile content when no user', () => {
    const { queryByRole } = render(
      <BrowserRouter>
        <ProfileView />
      </BrowserRouter>
    );

    // Profile heading should not be visible
    expect(queryByRole('heading', { name: /profile/i })).toBeNull();
    // Edit button should not be visible
    expect(queryByRole('button', { name: /edit profile/i })).toBeNull();
  });

  it('should show sign in link when no user', () => {
    render(
      <BrowserRouter>
        <ProfileView />
      </BrowserRouter>
    );

    // Should show sign in link
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/login');
  });
});
