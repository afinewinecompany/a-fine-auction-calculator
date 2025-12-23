/**
 * ProfileView Loading State Tests
 *
 * Isolated test file for loading state to enable proper module mocking.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
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

// Mock stores BEFORE importing components
vi.mock('@/features/auth/stores/authStore', () => ({
  useUser: () => mockUser,
}));

vi.mock('@/features/profile/stores/profileStore', () => ({
  useProfileStore: () => ({
    profile: null,
    isLoading: true,
    error: null,
    fetchProfile: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Import component AFTER mocks are set up
import { ProfileView } from '@/features/profile/components/ProfileView';

describe('ProfileView Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading skeleton when isLoading is true and no profile', () => {
    render(
      <BrowserRouter>
        <ProfileView />
      </BrowserRouter>
    );

    // Skeleton should be visible - check for skeleton or animate-pulse classes
    const skeletons = document.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should not show Edit Profile button while loading', () => {
    const { queryByRole } = render(
      <BrowserRouter>
        <ProfileView />
      </BrowserRouter>
    );

    // Edit button should not be present during loading
    expect(queryByRole('button', { name: /edit profile/i })).toBeNull();
  });
});
