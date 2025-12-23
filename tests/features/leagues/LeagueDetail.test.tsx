/**
 * LeagueDetail Component Tests
 *
 * Tests for the LeagueDetail component including:
 * - Loading state display
 * - Error state display
 * - League settings display
 * - Copy Link functionality
 * - Action button links
 * - Route parameter handling
 *
 * Story: 3.6 - Generate Direct League Access Links
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LeagueDetail } from '@/features/leagues/components/LeagueDetail';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';
import type { League } from '@/features/leagues/types/league.types';

// Mock date-fns to return consistent values for testing
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 days ago'),
}));

// Mock sonner toast - using vi.hoisted to define the mock functions
const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

// Store the original store state for restoration
const originalState = useLeagueStore.getState();

// Mock fetchLeague function to prevent useEffect side effects
const mockFetchLeague = vi.fn().mockResolvedValue(null);

/**
 * Helper to set store state with mocked fetchLeague
 */
function setStoreState(partial: Partial<ReturnType<typeof useLeagueStore.getState>>) {
  useLeagueStore.setState({
    fetchLeague: mockFetchLeague,
    ...partial,
  });
}

/**
 * Mock league data for tests
 */
const mockLeague: League = {
  id: 'league-123',
  userId: 'user-456',
  name: 'Test League',
  teamCount: 12,
  budget: 260,
  rosterSpotsHitters: 14,
  rosterSpotsPitchers: 9,
  rosterSpotsBench: 3,
  scoringType: '5x5',
  createdAt: '2025-12-14T10:00:00Z',
  updatedAt: '2025-12-14T15:30:00Z',
};

/**
 * Mock league with minimal data (no roster settings)
 */
const mockLeagueMinimal: League = {
  id: 'league-456',
  userId: 'user-456',
  name: 'Minimal League',
  teamCount: 10,
  budget: 200,
  rosterSpotsHitters: null,
  rosterSpotsPitchers: null,
  rosterSpotsBench: null,
  scoringType: null,
  createdAt: '2025-12-10T10:00:00Z',
  updatedAt: '2025-12-10T10:00:00Z',
};

/**
 * Helper to render LeagueDetail with router context at specific route
 */
function renderLeagueDetail(leagueId: string = 'league-123') {
  return render(
    <MemoryRouter initialEntries={[`/leagues/${leagueId}`]}>
      <Routes>
        <Route path="/leagues/:leagueId" element={<LeagueDetail />} />
        <Route path="/leagues" element={<div>Leagues List</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LeagueDetail', () => {
  // Reset store state and mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchLeague.mockClear();
    setStoreState({
      leagues: [],
      currentLeague: null,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
    });
  });

  // Restore original store state after all tests
  afterEach(() => {
    useLeagueStore.setState(originalState);
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching', () => {
      setStoreState({ isLoading: true, currentLeague: null });
      renderLeagueDetail();

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have accessible loading label', () => {
      setStoreState({ isLoading: true, currentLeague: null });
      renderLeagueDetail();

      expect(screen.getByLabelText(/loading league details/i)).toBeInTheDocument();
    });

    it('should show spinner with animation class', () => {
      setStoreState({ isLoading: true, currentLeague: null });
      renderLeagueDetail();

      const spinner = screen.getByRole('status').querySelector('div');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Error State', () => {
    it('should display error state when league not found', () => {
      setStoreState({
        isLoading: false,
        currentLeague: null,
        error: 'League not found',
      });
      renderLeagueDetail();

      expect(screen.getByText('League Not Found')).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      setStoreState({
        isLoading: false,
        currentLeague: null,
        error: 'You do not have permission to view this league',
      });
      renderLeagueDetail();

      expect(
        screen.getByText('You do not have permission to view this league')
      ).toBeInTheDocument();
    });

    it('should display default message when no error but no league', () => {
      setStoreState({
        isLoading: false,
        currentLeague: null,
        error: null,
      });
      renderLeagueDetail();

      expect(
        screen.getByText('This league does not exist or you do not have access.')
      ).toBeInTheDocument();
    });

    it('should have Back to Leagues link in error state', () => {
      setStoreState({
        isLoading: false,
        currentLeague: null,
        error: 'Not found',
      });
      renderLeagueDetail();

      const backLink = screen.getByRole('link', { name: /back to leagues/i });
      expect(backLink).toHaveAttribute('href', '/leagues');
    });
  });

  describe('League Display', () => {
    beforeEach(() => {
      setStoreState({
        isLoading: false,
        currentLeague: mockLeague,
        error: null,
      });
    });

    it('should display league name as heading', () => {
      renderLeagueDetail();

      expect(screen.getByTestId('league-name')).toHaveTextContent('Test League');
    });

    it('should display team count correctly', () => {
      renderLeagueDetail();

      expect(screen.getByTestId('team-count')).toHaveTextContent('12 teams');
    });

    it('should display budget with currency formatting', () => {
      renderLeagueDetail();

      expect(screen.getByTestId('budget')).toHaveTextContent('$260');
    });

    it('should display scoring type when set', () => {
      renderLeagueDetail();

      expect(screen.getByTestId('scoring-type')).toHaveTextContent('5x5');
    });

    it('should display roster hitters when set', () => {
      renderLeagueDetail();

      expect(screen.getByTestId('roster-hitters')).toHaveTextContent('14 spots');
    });

    it('should display roster pitchers when set', () => {
      renderLeagueDetail();

      expect(screen.getByTestId('roster-pitchers')).toHaveTextContent('9 spots');
    });

    it('should display roster bench when set', () => {
      renderLeagueDetail();

      expect(screen.getByTestId('roster-bench')).toHaveTextContent('3 spots');
    });

    it('should display created date as relative time', () => {
      renderLeagueDetail();

      expect(screen.getByTestId('created-date')).toHaveTextContent('2 days ago');
    });

    it('should display updated date as relative time', () => {
      renderLeagueDetail();

      expect(screen.getByTestId('updated-date')).toHaveTextContent('2 days ago');
    });
  });

  describe('Minimal League Display', () => {
    beforeEach(() => {
      setStoreState({
        isLoading: false,
        currentLeague: mockLeagueMinimal,
        error: null,
      });
    });

    it('should not display scoring type when null', () => {
      renderLeagueDetail('league-456');

      expect(screen.queryByTestId('scoring-type')).not.toBeInTheDocument();
    });

    it('should not display roster hitters when null', () => {
      renderLeagueDetail('league-456');

      expect(screen.queryByTestId('roster-hitters')).not.toBeInTheDocument();
    });

    it('should not display roster pitchers when null', () => {
      renderLeagueDetail('league-456');

      expect(screen.queryByTestId('roster-pitchers')).not.toBeInTheDocument();
    });

    it('should not display roster bench when null', () => {
      renderLeagueDetail('league-456');

      expect(screen.queryByTestId('roster-bench')).not.toBeInTheDocument();
    });

    it('should show no roster settings message when all are null', () => {
      renderLeagueDetail('league-456');

      expect(screen.getByText('No roster settings configured')).toBeInTheDocument();
    });
  });

  describe('Copy Link Feature', () => {
    beforeEach(() => {
      setStoreState({
        isLoading: false,
        currentLeague: mockLeague,
        error: null,
      });
    });

    it('should render Copy Link button', () => {
      renderLeagueDetail();

      expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    });

    it('should copy URL to clipboard and show success toast on click', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);

      // Mock navigator.clipboard using vi.stubGlobal
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'isSecureContext', { value: true, writable: true });

      renderLeagueDetail();

      const copyButton = screen.getByRole('button', { name: /copy link/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(
          expect.stringContaining('/leagues/league-123')
        );
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Link copied to clipboard!');

      // Restore original clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });

    it('should show error toast when clipboard copy fails', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Copy failed'));

      // Mock navigator.clipboard
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'isSecureContext', { value: true, writable: true });

      renderLeagueDetail();

      const copyButton = screen.getByRole('button', { name: /copy link/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to copy link');
      });

      // Restore original clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('Action Buttons', () => {
    beforeEach(() => {
      setStoreState({
        isLoading: false,
        currentLeague: mockLeague,
        error: null,
      });
    });

    it('should render Back to Leagues link', () => {
      renderLeagueDetail();

      const backLink = screen.getByRole('link', { name: /back to leagues/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/leagues');
    });

    it('should render Edit button with correct link', () => {
      renderLeagueDetail();

      const editLink = screen.getByRole('link', { name: /edit/i });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute('href', '/leagues/league-123/edit');
    });

    it('should render Start Draft button with correct link', () => {
      renderLeagueDetail();

      const draftLink = screen.getByRole('link', { name: /start draft/i });
      expect(draftLink).toBeInTheDocument();
      expect(draftLink).toHaveAttribute('href', '/draft/league-123');
    });
  });

  describe('Data Fetching', () => {
    it('should call fetchLeague with leagueId from URL params', () => {
      setStoreState({
        isLoading: true,
        currentLeague: null,
      });

      renderLeagueDetail('league-789');

      expect(mockFetchLeague).toHaveBeenCalledWith('league-789');
    });

    it('should call fetchLeague on mount', () => {
      setStoreState({
        isLoading: true,
        currentLeague: null,
      });

      renderLeagueDetail();

      expect(mockFetchLeague).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    beforeEach(() => {
      setStoreState({
        isLoading: false,
        currentLeague: mockLeague,
        error: null,
      });
    });

    it('should have dark theme card styling', () => {
      renderLeagueDetail();

      const card = document.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('bg-slate-900');
      expect(card).toHaveClass('border-slate-800');
    });

    it('should have emerald styling on Start Draft button', () => {
      renderLeagueDetail();

      const draftButton = screen.getByRole('link', { name: /start draft/i });
      expect(draftButton).toHaveClass('bg-emerald-600');
    });
  });

  describe('Different League Data', () => {
    it('should display different league name', () => {
      const differentLeague = { ...mockLeague, name: 'Fantasy Champions' };
      setStoreState({
        isLoading: false,
        currentLeague: differentLeague,
        error: null,
      });

      renderLeagueDetail();

      expect(screen.getByTestId('league-name')).toHaveTextContent('Fantasy Champions');
    });

    it('should display different team count', () => {
      const leagueWith8Teams = { ...mockLeague, teamCount: 8 };
      setStoreState({
        isLoading: false,
        currentLeague: leagueWith8Teams,
        error: null,
      });

      renderLeagueDetail();

      expect(screen.getByTestId('team-count')).toHaveTextContent('8 teams');
    });

    it('should display high budget with formatting', () => {
      const highBudgetLeague = { ...mockLeague, budget: 1000 };
      setStoreState({
        isLoading: false,
        currentLeague: highBudgetLeague,
        error: null,
      });

      renderLeagueDetail();

      expect(screen.getByTestId('budget')).toHaveTextContent('$1,000');
    });

    it('should handle different scoring types', () => {
      const pointsLeague = { ...mockLeague, scoringType: 'points' as const };
      setStoreState({
        isLoading: false,
        currentLeague: pointsLeague,
        error: null,
      });

      renderLeagueDetail();

      expect(screen.getByTestId('scoring-type')).toHaveTextContent('points');
    });
  });
});
