/**
 * LeaguesList Component Tests
 *
 * Tests for the LeaguesList component including:
 * - Loading state display
 * - Error state display with retry
 * - Empty state when no leagues
 * - Leagues grid rendering
 * - Sorting verification
 * - Responsive layout
 *
 * Story: 3.3 - Display Saved Leagues List
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LeaguesList } from '@/features/leagues/components/LeaguesList';
import type { League } from '@/features/leagues/types/league.types';

// Mock date-fns to return consistent values
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 days ago'),
}));

// Mock store state
let mockLeagues: League[] = [];
let mockIsLoading = false;
let mockError: string | null = null;
const mockFetchLeagues = vi.fn();

// Create dynamic mock state
const createMockState = () => ({
  leagues: mockLeagues,
  isLoading: mockIsLoading,
  error: mockError,
  fetchLeagues: mockFetchLeagues,
});

// Mock the league store
vi.mock('@/features/leagues/stores/leagueStore', () => ({
  useLeagueStore: (selector: (state: ReturnType<typeof createMockState>) => unknown) => {
    return selector(createMockState());
  },
}));

/**
 * Helper mock league data factory
 */
function createMockLeague(overrides: Partial<League> = {}): League {
  return {
    id: 'league-' + Math.random().toString(36).substring(7),
    userId: 'user-456',
    name: 'Test League',
    teamCount: 12,
    budget: 260,
    rosterSpotsHitters: 14,
    rosterSpotsPitchers: 9,
    rosterSpotsBench: 3,
    scoringType: '5x5',
    createdAt: '2025-12-14T10:00:00Z',
    updatedAt: '2025-12-14T10:00:00Z',
    ...overrides,
  };
}

/**
 * Helper to render LeaguesList with router context
 */
function renderLeaguesList() {
  return render(
    <BrowserRouter>
      <LeaguesList />
    </BrowserRouter>
  );
}

describe('LeaguesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLeagues = [];
    mockIsLoading = false;
    mockError = null;
  });

  describe('Data Fetching', () => {
    it('should call fetchLeagues on mount', () => {
      renderLeaguesList();

      expect(mockFetchLeagues).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should display loading skeleton when loading', () => {
      mockIsLoading = true;
      renderLeaguesList();

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should display page title during loading', () => {
      mockIsLoading = true;
      renderLeaguesList();

      expect(
        screen.getByRole('heading', { name: /my leagues/i })
      ).toBeInTheDocument();
    });

    it('should show 3 skeleton cards during loading', () => {
      mockIsLoading = true;
      renderLeaguesList();

      const skeletonCards = document.querySelectorAll('[data-slot="card"]');
      expect(skeletonCards.length).toBe(3);
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      mockError = 'Failed to load leagues';
      renderLeaguesList();

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText(/failed to load leagues/i)).toBeInTheDocument();
    });

    it('should display retry button on error', () => {
      mockError = 'Network error';
      renderLeaguesList();

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call fetchLeagues when retry is clicked', async () => {
      mockError = 'Network error';
      const user = userEvent.setup();
      renderLeaguesList();

      // Clear the initial mount call
      mockFetchLeagues.mockClear();

      await user.click(screen.getByRole('button', { name: /retry/i }));

      expect(mockFetchLeagues).toHaveBeenCalled();
    });

    it('should display page title on error', () => {
      mockError = 'Some error';
      renderLeaguesList();

      expect(
        screen.getByRole('heading', { name: /my leagues/i })
      ).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no leagues exist', () => {
      mockLeagues = [];
      renderLeaguesList();

      expect(screen.getByTestId('empty-leagues-state')).toBeInTheDocument();
    });

    it('should display "No leagues yet" message', () => {
      mockLeagues = [];
      renderLeaguesList();

      expect(screen.getByText(/no leagues yet/i)).toBeInTheDocument();
    });

    it('should display page title on empty state', () => {
      mockLeagues = [];
      renderLeaguesList();

      expect(
        screen.getByRole('heading', { name: /my leagues/i })
      ).toBeInTheDocument();
    });

    it('should not show "Create League" button in header when empty', () => {
      mockLeagues = [];
      renderLeaguesList();

      // The empty state has its own Create button, header shouldn't have one
      const createButtons = screen.getAllByRole('link', { name: /create/i });
      // Only one button should exist (from EmptyLeaguesState)
      expect(createButtons.length).toBe(1);
    });
  });

  describe('Success State - Leagues Grid', () => {
    it('should display leagues grid when leagues exist', () => {
      mockLeagues = [createMockLeague({ id: 'league-1', name: 'League One' })];
      renderLeaguesList();

      expect(screen.getByTestId('leagues-grid')).toBeInTheDocument();
    });

    it('should render all leagues as cards', () => {
      mockLeagues = [
        createMockLeague({ id: 'league-1', name: 'League One' }),
        createMockLeague({ id: 'league-2', name: 'League Two' }),
        createMockLeague({ id: 'league-3', name: 'League Three' }),
      ];
      renderLeaguesList();

      expect(screen.getByText('League One')).toBeInTheDocument();
      expect(screen.getByText('League Two')).toBeInTheDocument();
      expect(screen.getByText('League Three')).toBeInTheDocument();
    });

    it('should display "Create League" button in header when leagues exist', () => {
      mockLeagues = [createMockLeague({ id: 'league-1', name: 'League One' })];
      renderLeaguesList();

      expect(
        screen.getByRole('link', { name: /create league/i })
      ).toBeInTheDocument();
    });

    it('should have correct number of league cards', () => {
      mockLeagues = [
        createMockLeague({ id: 'league-1' }),
        createMockLeague({ id: 'league-2' }),
      ];
      renderLeaguesList();

      // Each card has data-slot="card" attribute
      const cards = document.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBe(2);
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive grid classes', () => {
      mockLeagues = [createMockLeague({ id: 'league-1' })];
      renderLeaguesList();

      const grid = screen.getByTestId('leagues-grid');
      expect(grid).toHaveClass('grid-cols-1'); // Mobile
      expect(grid).toHaveClass('md:grid-cols-2'); // Tablet
      expect(grid).toHaveClass('lg:grid-cols-3'); // Desktop
    });

    it('should have proper gap spacing', () => {
      mockLeagues = [createMockLeague({ id: 'league-1' })];
      renderLeaguesList();

      const grid = screen.getByTestId('leagues-grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Sorting', () => {
    it('should display leagues in order they are provided (store handles sorting)', () => {
      // The store sorts by created_at descending, so we simulate that here
      mockLeagues = [
        createMockLeague({
          id: 'league-newest',
          name: 'Newest League',
          createdAt: '2025-12-16T10:00:00Z',
        }),
        createMockLeague({
          id: 'league-middle',
          name: 'Middle League',
          createdAt: '2025-12-15T10:00:00Z',
        }),
        createMockLeague({
          id: 'league-oldest',
          name: 'Oldest League',
          createdAt: '2025-12-14T10:00:00Z',
        }),
      ];
      renderLeaguesList();

      // Get all league cards
      const leagueNames = screen.getAllByRole('heading', { level: 4 });
      const names = leagueNames.map(el => el.textContent);

      // Verify order matches what was passed (newest first)
      expect(names[0]).toBe('Newest League');
      expect(names[1]).toBe('Middle League');
      expect(names[2]).toBe('Oldest League');
    });
  });

  describe('Page Header', () => {
    it('should display "My Leagues" title', () => {
      mockLeagues = [createMockLeague()];
      renderLeaguesList();

      expect(
        screen.getByRole('heading', { name: /my leagues/i, level: 1 })
      ).toBeInTheDocument();
    });

    it('should have container with proper padding', () => {
      mockLeagues = [createMockLeague()];
      renderLeaguesList();

      const container = document.querySelector('.container');
      expect(container).toHaveClass('px-4');
      expect(container).toHaveClass('py-8');
    });
  });

  describe('Navigation Links', () => {
    it('should have Create League link to /leagues/new', () => {
      mockLeagues = [createMockLeague({ id: 'league-1' })];
      renderLeaguesList();

      const createLink = screen.getByRole('link', { name: /create league/i });
      expect(createLink).toHaveAttribute('href', '/leagues/new');
    });
  });
});

describe('LeaguesList Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLeagues = [];
    mockIsLoading = false;
    mockError = null;
  });

  it('should handle transition from loading to success state', async () => {
    // Start with loading
    mockIsLoading = true;
    const { rerender } = render(
      <BrowserRouter>
        <LeaguesList />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // Transition to success
    mockIsLoading = false;
    mockLeagues = [createMockLeague({ id: 'league-1', name: 'Test League' })];

    rerender(
      <BrowserRouter>
        <LeaguesList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Test League')).toBeInTheDocument();
    });
  });

  it('should handle transition from loading to error state', async () => {
    mockIsLoading = true;
    const { rerender } = render(
      <BrowserRouter>
        <LeaguesList />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // Transition to error
    mockIsLoading = false;
    mockError = 'Connection failed';

    rerender(
      <BrowserRouter>
        <LeaguesList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });

  it('should handle transition from loading to empty state', async () => {
    mockIsLoading = true;
    const { rerender } = render(
      <BrowserRouter>
        <LeaguesList />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // Transition to empty
    mockIsLoading = false;
    mockLeagues = [];

    rerender(
      <BrowserRouter>
        <LeaguesList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      expect(screen.getByTestId('empty-leagues-state')).toBeInTheDocument();
    });
  });
});
