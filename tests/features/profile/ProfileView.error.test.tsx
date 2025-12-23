/**
 * ProfileView Error State Tests
 *
 * Isolated test file for error state to enable proper module mocking.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock user data
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  user_metadata: {
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
};

const mockFetchProfile = vi.fn();

// Mock stores BEFORE importing components
vi.mock('@/features/auth/stores/authStore', () => ({
  useUser: () => mockUser,
}));

vi.mock('@/features/profile/stores/profileStore', () => ({
  useProfileStore: () => ({
    profile: null,
    isLoading: false,
    error: 'Failed to load profile',
    fetchProfile: mockFetchProfile,
    clearError: vi.fn(),
  }),
}));

// Import component AFTER mocks are set up
import { ProfileView } from '@/features/profile/components/ProfileView';

describe('ProfileView Error State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error message when error exists and no profile', () => {
    render(
      <BrowserRouter>
        <ProfileView />
      </BrowserRouter>
    );

    // Error message should be displayed
    expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument();
  });

  it('should show retry button when error exists', () => {
    render(
      <BrowserRouter>
        <ProfileView />
      </BrowserRouter>
    );

    // Retry button should be visible
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should call fetchProfile when retry button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <ProfileView />
      </BrowserRouter>
    );

    // Clear initial call
    mockFetchProfile.mockClear();

    // Click retry button
    await user.click(screen.getByRole('button', { name: /try again/i }));

    // Should retry fetching profile
    expect(mockFetchProfile).toHaveBeenCalledWith(mockUser.id);
  });
});
