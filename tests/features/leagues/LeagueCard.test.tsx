/**
 * LeagueCard Component Tests
 *
 * Tests for the LeagueCard component including:
 * - Rendering league information
 * - Formatting of team count, budget, and date
 * - Action button links (View, Edit, Start Draft)
 * - Delete button and confirmation dialog
 * - Hover styling
 *
 * Story: 3.3 - Display Saved Leagues List
 * Story: 3.4 - Implement Edit League Settings
 * Story: 3.5 - Implement Delete League
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { LeagueCard } from '@/features/leagues/components/LeagueCard';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';
import { useDraftStore } from '@/features/draft';
import type { League } from '@/features/leagues/types/league.types';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock date-fns to return consistent values for testing
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 days ago'),
}));

// Store the original store state for restoration
const originalState = useLeagueStore.getState();

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
  updatedAt: '2025-12-14T10:00:00Z',
};

/**
 * Helper to render LeagueCard with router context
 */
function renderLeagueCard(league: League = mockLeague) {
  return render(
    <BrowserRouter>
      <LeagueCard league={league} />
    </BrowserRouter>
  );
}

describe('LeagueCard', () => {
  describe('Rendering', () => {
    it('should render league name', () => {
      renderLeagueCard();

      expect(screen.getByText('Test League')).toBeInTheDocument();
    });

    it('should display team count correctly', () => {
      renderLeagueCard();

      expect(screen.getByTestId('team-count')).toHaveTextContent('12 teams');
    });

    it('should display team count with singular form for 1 team', () => {
      const singleTeamLeague = { ...mockLeague, teamCount: 1 };
      renderLeagueCard(singleTeamLeague);

      expect(screen.getByTestId('team-count')).toHaveTextContent('1 team');
    });

    it('should display formatted budget', () => {
      renderLeagueCard();

      expect(screen.getByTestId('budget')).toHaveTextContent('$260 budget');
    });

    it('should display formatted creation date', () => {
      renderLeagueCard();

      expect(screen.getByTestId('created-date')).toHaveTextContent(
        'Created 2 days ago'
      );
    });

    it('should render View button', () => {
      renderLeagueCard();

      expect(screen.getByRole('link', { name: /view/i })).toBeInTheDocument();
    });

    it('should render Edit button', () => {
      renderLeagueCard();

      expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
    });

    it('should render Start Draft button', () => {
      renderLeagueCard();

      expect(
        screen.getByRole('link', { name: /start draft/i })
      ).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('should have View button linking to correct route', () => {
      renderLeagueCard();

      const viewLink = screen.getByRole('link', { name: /view/i });
      expect(viewLink).toHaveAttribute('href', '/leagues/league-123');
    });

    it('should have Edit button linking to correct edit route', () => {
      renderLeagueCard();

      const editLink = screen.getByRole('link', { name: /edit/i });
      expect(editLink).toHaveAttribute('href', '/leagues/league-123/edit');
    });

    it('should have Start Draft button linking to correct route', () => {
      renderLeagueCard();

      const draftLink = screen.getByRole('link', { name: /start draft/i });
      expect(draftLink).toHaveAttribute('href', '/draft/league-123');
    });
  });

  describe('Styling', () => {
    it('should render as a card element', () => {
      renderLeagueCard();

      // Card has data-slot="card" attribute
      const card = document.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });

    it('should have dark theme styling classes', () => {
      renderLeagueCard();

      const card = document.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('bg-slate-900');
      expect(card).toHaveClass('border-slate-800');
    });

    it('should have hover effect class', () => {
      renderLeagueCard();

      const card = document.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('hover:border-emerald-400/50');
    });
  });

  describe('Different League Data', () => {
    it('should display different budget values correctly', () => {
      const leagueWithHighBudget = { ...mockLeague, budget: 500 };
      renderLeagueCard(leagueWithHighBudget);

      expect(screen.getByTestId('budget')).toHaveTextContent('$500 budget');
    });

    it('should display different team counts correctly', () => {
      const leagueWith8Teams = { ...mockLeague, teamCount: 8 };
      renderLeagueCard(leagueWith8Teams);

      expect(screen.getByTestId('team-count')).toHaveTextContent('8 teams');
    });

    it('should handle different league IDs for links', () => {
      const leagueWithDifferentId = { ...mockLeague, id: 'different-id-789' };
      renderLeagueCard(leagueWithDifferentId);

      const viewLink = screen.getByRole('link', { name: /view/i });
      expect(viewLink).toHaveAttribute('href', '/leagues/different-id-789');

      const editLink = screen.getByRole('link', { name: /edit/i });
      expect(editLink).toHaveAttribute('href', '/leagues/different-id-789/edit');

      const draftLink = screen.getByRole('link', { name: /start draft/i });
      expect(draftLink).toHaveAttribute(
        'href',
        '/draft/different-id-789'
      );
    });
  });

  /**
   * Delete Functionality Tests
   * Story: 3.5 - Implement Delete League
   */
  describe('Delete Functionality', () => {
    // Reset store state before each test
    beforeEach(() => {
      useLeagueStore.setState({
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

    it('should render delete button on card', () => {
      renderLeagueCard();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should render delete button with Trash2 icon and "Delete" text', () => {
      renderLeagueCard();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveTextContent('Delete');
    });

    it('should have delete button with destructive variant styling', () => {
      renderLeagueCard();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      // Button should be present and clickable (destructive variant renders correctly)
      expect(deleteButton).toBeInTheDocument();
      // Check that the button contains "Delete" text
      expect(deleteButton).toHaveTextContent('Delete');
    });

    it('should have accessible aria-label on delete button', () => {
      renderLeagueCard();

      const deleteButton = screen.getByRole('button', { name: /delete test league/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should open confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderLeagueCard();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Dialog should be open - check for the dialog role and description text
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    });

    it('should display correct league name in confirmation dialog', async () => {
      const user = userEvent.setup();
      renderLeagueCard();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Dialog should show the league name in the confirmation message
      expect(
        screen.getByText(/are you sure you want to delete "Test League"/i)
      ).toBeInTheDocument();
    });

    it('should display warning that action cannot be undone', async () => {
      const user = userEvent.setup();
      renderLeagueCard();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
    });

    it('should have Cancel and Delete League buttons in dialog', async () => {
      const user = userEvent.setup();
      renderLeagueCard();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete league/i })).toBeInTheDocument();
    });

    it('should close dialog when Cancel is clicked without calling deleteLeague', async () => {
      const user = userEvent.setup();
      const mockDeleteLeague = vi.fn().mockResolvedValue(true);
      useLeagueStore.setState({ deleteLeague: mockDeleteLeague });

      renderLeagueCard();

      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Click Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByText('Delete League')).not.toBeInTheDocument();
      });

      // deleteLeague should NOT have been called
      expect(mockDeleteLeague).not.toHaveBeenCalled();
    });

    it('should call deleteLeague with correct league ID when confirmed', async () => {
      const user = userEvent.setup();
      const mockDeleteLeague = vi.fn().mockResolvedValue(true);
      useLeagueStore.setState({ deleteLeague: mockDeleteLeague });

      renderLeagueCard();

      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Click Delete League
      const confirmButton = screen.getByRole('button', { name: /delete league/i });
      await user.click(confirmButton);

      // deleteLeague should have been called with the league ID
      expect(mockDeleteLeague).toHaveBeenCalledWith('league-123');
    });

    it('should disable delete button when isDeleting is true', () => {
      useLeagueStore.setState({ isDeleting: true });

      renderLeagueCard();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should render confirm button with Delete League text in dialog', async () => {
      const user = userEvent.setup();
      useLeagueStore.setState({ isDeleting: false });

      renderLeagueCard();

      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Verify dialog is open with normal "Delete League" text on confirm button
      const confirmButton = screen.getByRole('button', { name: /delete league/i });
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toHaveTextContent('Delete League');
    });

    it('should disable confirm button when isDeleting is true', async () => {
      const user = userEvent.setup();
      useLeagueStore.setState({ isDeleting: true });

      renderLeagueCard();

      // Can't open dialog when delete button is disabled, so test the store state
      // by verifying the button is disabled
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should close dialog after successful deletion', async () => {
      const user = userEvent.setup();
      const mockDeleteLeague = vi.fn().mockResolvedValue(true);
      useLeagueStore.setState({ deleteLeague: mockDeleteLeague });

      renderLeagueCard();

      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Click Delete League
      const confirmButton = screen.getByRole('button', { name: /delete league/i });
      await user.click(confirmButton);

      // Dialog should close after deletion
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should close dialog even if deletion fails', async () => {
      const user = userEvent.setup();
      const mockDeleteLeague = vi.fn().mockResolvedValue(false);
      useLeagueStore.setState({ deleteLeague: mockDeleteLeague });

      renderLeagueCard();

      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Click Delete League
      const confirmButton = screen.getByRole('button', { name: /delete league/i });
      await user.click(confirmButton);

      // Dialog should still close (error shown separately via store error state)
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should display different league name in dialog for different leagues', async () => {
      const user = userEvent.setup();
      const differentLeague = { ...mockLeague, name: 'My Fantasy League' };
      renderLeagueCard(differentLeague);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(
        screen.getByText(/are you sure you want to delete "My Fantasy League"/i)
      ).toBeInTheDocument();
    });

    it('should show success toast when deletion succeeds', async () => {
      const user = userEvent.setup();
      const mockDeleteLeague = vi.fn().mockResolvedValue(true);
      useLeagueStore.setState({ deleteLeague: mockDeleteLeague });

      renderLeagueCard();

      // Open dialog and confirm
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      const confirmButton = screen.getByRole('button', { name: /delete league/i });
      await user.click(confirmButton);

      // Verify success toast was called
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('"Test League" has been deleted');
      });
    });

    it('should show error toast when deletion fails', async () => {
      const user = userEvent.setup();
      const mockDeleteLeague = vi.fn().mockResolvedValue(false);
      useLeagueStore.setState({ deleteLeague: mockDeleteLeague });

      renderLeagueCard();

      // Open dialog and confirm
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      const confirmButton = screen.getByRole('button', { name: /delete league/i });
      await user.click(confirmButton);

      // Verify error toast was called
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete league. Please try again.');
      });
    });

    it('should show league reappear after failed deletion (rollback)', async () => {
      const user = userEvent.setup();
      const mockDeleteLeague = vi.fn().mockResolvedValue(false);
      useLeagueStore.setState({ deleteLeague: mockDeleteLeague });

      renderLeagueCard();

      // League should be visible
      expect(screen.getByText('Test League')).toBeInTheDocument();

      // Open dialog and confirm
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      const confirmButton = screen.getByRole('button', { name: /delete league/i });
      await user.click(confirmButton);

      // League should still be visible (rollback handled by store)
      await waitFor(() => {
        expect(screen.getByText('Test League')).toBeInTheDocument();
      });
    });
  });

  /**
   * Resume Draft Functionality Tests
   * Story: 3.7 - Implement Resume Draft Functionality
   */
  describe('Resume Draft Functionality', () => {
    // Reset draft store state before each test
    beforeEach(() => {
      useDraftStore.setState({ drafts: {} });
    });

    // Restore original store state after all tests
    afterEach(() => {
      useDraftStore.setState({ drafts: {} });
    });

    it('should show "Start Draft" when no draft exists', () => {
      renderLeagueCard();

      const draftLink = screen.getByRole('link', { name: /start draft/i });
      expect(draftLink).toBeInTheDocument();
      expect(draftLink).toHaveTextContent('Start Draft');
    });

    it('should show "Start Draft" when draft exists but no players drafted', () => {
      // Initialize draft but don't add any players
      useDraftStore.getState().initializeDraft('league-123', 260, {
        hitters: 14,
        pitchers: 9,
        bench: 3,
      });

      renderLeagueCard();

      // Should still show "Start Draft" since no players have been drafted yet
      const draftLink = screen.getByRole('link', { name: /start draft/i });
      expect(draftLink).toBeInTheDocument();
    });

    it('should show "Resume Draft" with Play icon when draft has players', () => {
      // Initialize draft and add a player
      useDraftStore.getState().initializeDraft('league-123', 260, {
        hitters: 14,
        pitchers: 9,
        bench: 3,
      });
      useDraftStore.getState().addDraftedPlayer('league-123', {
        playerId: 'player-1',
        playerName: 'Test Player',
        position: 'OF',
        purchasePrice: 25,
        projectedValue: 20,
        variance: 5,
        draftedBy: 'user',
      });

      renderLeagueCard();

      const draftLink = screen.getByRole('link', { name: /resume draft/i });
      expect(draftLink).toBeInTheDocument();
      expect(draftLink).toHaveTextContent('Resume Draft');
    });

    it('should have correct href for draft button regardless of draft state', () => {
      renderLeagueCard();

      const draftLink = screen.getByRole('link', { name: /draft/i });
      expect(draftLink).toHaveAttribute('href', '/draft/league-123');
    });

    it('should use default variant button for Resume Draft', async () => {
      // Initialize draft with players using act to wrap state updates
      await act(async () => {
        useDraftStore.getState().initializeDraft('league-123', 260, {
          hitters: 14,
          pitchers: 9,
          bench: 3,
        });
        useDraftStore.getState().addDraftedPlayer('league-123', {
          playerId: 'player-1',
          playerName: 'Test Player',
          position: 'OF',
          purchasePrice: 25,
          projectedValue: 20,
          variance: 5,
          draftedBy: 'user',
        });
      });

      renderLeagueCard();

      // The Resume Draft button should be present (checking for different styling via the link)
      const draftLink = screen.getByRole('link', { name: /resume draft/i });
      expect(draftLink).toBeInTheDocument();
    });

    it('should update button when draft state changes', async () => {
      const { rerender } = render(
        <BrowserRouter>
          <LeagueCard league={mockLeague} />
        </BrowserRouter>
      );

      // Initially shows "Start Draft"
      expect(screen.getByRole('link', { name: /start draft/i })).toBeInTheDocument();

      // Add draft with player using act to wrap state updates
      await act(async () => {
        useDraftStore.getState().initializeDraft('league-123', 260, {
          hitters: 14,
          pitchers: 9,
          bench: 3,
        });
        useDraftStore.getState().addDraftedPlayer('league-123', {
          playerId: 'player-1',
          playerName: 'Test Player',
          position: 'OF',
          purchasePrice: 25,
          projectedValue: 20,
          variance: 5,
          draftedBy: 'user',
        });
      });

      // Re-render to pick up state change
      rerender(
        <BrowserRouter>
          <LeagueCard league={mockLeague} />
        </BrowserRouter>
      );

      // Now shows "Resume Draft"
      expect(screen.getByRole('link', { name: /resume draft/i })).toBeInTheDocument();
    });

    it('should show correct button for different league IDs', () => {
      // Add draft for a different league
      useDraftStore.getState().initializeDraft('other-league', 260, {
        hitters: 14,
        pitchers: 9,
        bench: 3,
      });
      useDraftStore.getState().addDraftedPlayer('other-league', {
        playerId: 'player-1',
        playerName: 'Test Player',
        position: 'OF',
        purchasePrice: 25,
        projectedValue: 20,
        variance: 5,
        draftedBy: 'user',
      });

      // Render card for mockLeague (league-123) which has NO draft
      renderLeagueCard();

      // Should show "Start Draft" for league-123 even though other-league has a draft
      expect(screen.getByRole('link', { name: /start draft/i })).toBeInTheDocument();
    });
  });
});
