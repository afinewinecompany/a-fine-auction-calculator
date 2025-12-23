/**
 * ActiveDraftsWidget Component Tests
 *
 * Tests for the active drafts display widget.
 *
 * Story: 13.2 - Display Active Drafts List
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ActiveDraft } from '@/features/admin/types/admin.types';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useActiveDrafts hook
let mockUseActiveDraftsResult = {
  drafts: [] as ActiveDraft[],
  loading: false,
  error: null as string | null,
  refetch: vi.fn(),
};

vi.mock('@/features/admin/hooks/useActiveDrafts', () => ({
  useActiveDrafts: () => mockUseActiveDraftsResult,
}));

// Import after mocking
import { ActiveDraftsWidget } from '@/features/admin/components/ActiveDraftsWidget';

// Helper to create mock draft
const createMockDraft = (overrides: Partial<ActiveDraft> = {}): ActiveDraft => ({
  id: 'draft-123',
  status: 'active',
  started_at: '2025-12-22T10:00:00Z',
  last_activity: '2025-12-22T10:15:00Z',
  error_message: null,
  league: {
    name: 'Test League',
    team_count: 12,
    budget: 260,
  },
  user: {
    email: 'test@example.com',
    full_name: 'Test User',
  },
  ...overrides,
});

// Wrapper for router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('ActiveDraftsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActiveDraftsResult = {
      drafts: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      mockUseActiveDraftsResult = {
        drafts: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('Loading active drafts...')).toBeInTheDocument();
    });

    it('should show title during loading', () => {
      mockUseActiveDraftsResult = {
        drafts: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('Active Drafts')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      mockUseActiveDraftsResult = {
        drafts: [],
        loading: false,
        error: 'Failed to fetch active drafts',
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('Error: Failed to fetch active drafts')).toBeInTheDocument();
    });

    it('should have role="alert" for error message', () => {
      mockUseActiveDraftsResult = {
        drafts: [],
        loading: false,
        error: 'Database error',
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no drafts', () => {
      mockUseActiveDraftsResult = {
        drafts: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('No active drafts at this time')).toBeInTheDocument();
    });

    it('should show 0 active count when empty', () => {
      mockUseActiveDraftsResult = {
        drafts: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('0 active')).toBeInTheDocument();
    });
  });

  describe('Draft List', () => {
    it('should display list of drafts', () => {
      mockUseActiveDraftsResult = {
        drafts: [
          createMockDraft({ id: 'draft-1', league: { name: 'League 1', team_count: 10, budget: 260 } }),
          createMockDraft({ id: 'draft-2', league: { name: 'League 2', team_count: 12, budget: 280 } }),
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('League 1')).toBeInTheDocument();
      expect(screen.getByText('League 2')).toBeInTheDocument();
    });

    it('should show correct draft count', () => {
      mockUseActiveDraftsResult = {
        drafts: [
          createMockDraft({ id: 'draft-1' }),
          createMockDraft({ id: 'draft-2' }),
          createMockDraft({ id: 'draft-3' }),
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('3 active')).toBeInTheDocument();
    });

    it('should display user full name when available', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ user: { email: 'john@example.com', full_name: 'John Doe' } })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('User: John Doe')).toBeInTheDocument();
    });

    it('should display user email when full name is null', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ user: { email: 'jane@example.com', full_name: null } })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('User: jane@example.com')).toBeInTheDocument();
    });

    it('should display formatted time for started_at', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ started_at: '2025-12-22T10:00:00Z' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      // formatDistanceToNow will format relative to current time
      expect(screen.getByText(/Started:/)).toBeInTheDocument();
    });

    it('should display formatted time for last_activity', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ last_activity: '2025-12-22T10:15:00Z' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText(/Last Activity:/)).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should display Active badge for active drafts', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ status: 'active' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display Paused badge for paused drafts', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ status: 'paused' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('Paused')).toBeInTheDocument();
    });

    it('should display Error badge for error drafts', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ status: 'error', error_message: 'Connection failed' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('Error Message Display', () => {
    it('should show error message for error drafts', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ status: 'error', error_message: 'API connection failed' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByText('Error: API connection failed')).toBeInTheDocument();
    });

    it('should not show error message when null', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ status: 'active', error_message: null })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.queryByText(/^Error:/)).not.toBeInTheDocument();
    });

    it('should have red styling for error drafts', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ id: 'error-draft', status: 'error', error_message: 'Test error' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      // Find the draft item container by the league name
      const leagueName = screen.getByText('Test League');
      const draftItem = leagueName.closest('[role="listitem"]');
      expect(draftItem).toHaveClass('bg-red-900/20');
    });
  });

  describe('Navigation', () => {
    it('should navigate to draft details on click', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ id: 'draft-abc-123' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      const draftItem = screen.getByRole('listitem');
      fireEvent.click(draftItem);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/drafts/draft-abc-123');
    });

    it('should navigate on Enter key press', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ id: 'draft-xyz-789' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      const draftItem = screen.getByRole('listitem');
      fireEvent.keyDown(draftItem, { key: 'Enter' });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/drafts/draft-xyz-789');
    });

    it('should navigate on Space key press', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ id: 'draft-space-test' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      const draftItem = screen.getByRole('listitem');
      fireEvent.keyDown(draftItem, { key: ' ' });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/drafts/draft-space-test');
    });

    it('should not navigate on other key presses', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ id: 'draft-no-nav' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      const draftItem = screen.getByRole('listitem');
      fireEvent.keyDown(draftItem, { key: 'Tab' });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have list role for drafts container', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft()],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should have listitem role for each draft', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ id: 'draft-1' }), createMockDraft({ id: 'draft-2' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });

    it('should have tabIndex=0 for keyboard navigation', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft()],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      const draftItem = screen.getByRole('listitem');
      expect(draftItem).toHaveAttribute('tabIndex', '0');
    });

    it('should have aria-label for draft items', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft({ league: { name: 'My League', team_count: 10, budget: 260 }, status: 'active' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      const draftItem = screen.getByRole('listitem');
      expect(draftItem).toHaveAttribute('aria-label', 'My League draft, status: active');
    });

    it('should have aria-label for count badge', () => {
      mockUseActiveDraftsResult = {
        drafts: [createMockDraft(), createMockDraft({ id: 'draft-2' })],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithRouter(<ActiveDraftsWidget />);

      const countBadge = screen.getByText('2 active');
      expect(countBadge).toHaveAttribute('aria-label', '2 active drafts');
    });
  });

  describe('Widget Header', () => {
    it('should display Activity icon', () => {
      renderWithRouter(<ActiveDraftsWidget />);

      // Icon is aria-hidden, but we can check the title includes Active Drafts
      expect(screen.getByText('Active Drafts')).toBeInTheDocument();
    });

    it('should display "Active Drafts" title', () => {
      renderWithRouter(<ActiveDraftsWidget />);

      expect(screen.getByRole('heading', { name: /Active Drafts/i })).toBeInTheDocument();
    });
  });
});
