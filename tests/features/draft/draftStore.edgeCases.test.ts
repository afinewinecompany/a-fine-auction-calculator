/**
 * Draft Store Edge Case Tests
 *
 * Story: 10.7 - Preserve Draft State During Connection Failures
 * Task 5: Handle Storage Edge Cases
 * Tests for graceful handling of localStorage issues.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDraftStore } from '@/features/draft';

describe('Draft Store Edge Cases - Story 10.7', () => {
  const defaultRosterConfig = {
    hitters: 14,
    pitchers: 9,
    bench: 3,
  };

  beforeEach(() => {
    // Reset store to initial state
    useDraftStore.setState({
      drafts: {},
      sortState: { column: 'adjustedValue', direction: 'desc' },
      filterState: { status: 'all', searchTerm: '' },
      syncStatus: {},
    });
  });

  describe('AC6: Graceful handling of storage issues', () => {
    it('should handle corrupted stored data by using defaults', () => {
      // Simulate restoring from corrupted/partial data
      const corruptedState = {
        drafts: null, // Invalid
        sortState: { column: 'name' }, // Missing direction
        filterState: undefined, // Invalid
        syncStatus: 'not-an-object', // Invalid
      };

      // When Zustand's merge function runs, it should use defaults for missing/invalid values
      // This simulates the behavior when corrupted data is in localStorage
      try {
        useDraftStore.setState({
          drafts: corruptedState.drafts ?? {},
          sortState: corruptedState.sortState?.direction
            ? (corruptedState.sortState as { column: 'adjustedValue' | 'name' | 'position' | 'projectedValue' | 'tier'; direction: 'asc' | 'desc' })
            : { column: 'adjustedValue' as const, direction: 'desc' as const },
          filterState: corruptedState.filterState ?? { status: 'all' as const, searchTerm: '' },
          syncStatus: typeof corruptedState.syncStatus === 'object' ? corruptedState.syncStatus : {},
        });

        // Should be able to continue using the store
        const state = useDraftStore.getState();
        expect(state.drafts).toEqual({});
        expect(state.sortState.direction).toBeDefined();
        expect(state.filterState.status).toBeDefined();
      } catch {
        // If an error is thrown, the test fails
        expect.fail('Store should handle corrupted data gracefully');
      }
    });

    it('should handle missing league draft gracefully', () => {
      // Try to get a draft that doesn't exist
      const draft = useDraftStore.getState().getDraft('nonexistent-league');
      expect(draft).toBeUndefined();

      // Should not throw when updating nonexistent draft
      useDraftStore.getState().updateBudget('nonexistent-league', 200);
      useDraftStore.getState().addDraftedPlayer('nonexistent-league', {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        position: 'OF',
        purchasePrice: 50,
        projectedValue: 45,
        variance: 5,
        draftedBy: 'user',
      });

      // Draft should still not exist (operations were no-ops)
      const draftAfter = useDraftStore.getState().getDraft('nonexistent-league');
      expect(draftAfter).toBeUndefined();
    });

    it('should handle missing sync status gracefully', () => {
      // Try to get sync status that doesn't exist
      const syncStatus = useDraftStore.getState().getSyncStatus('nonexistent-league');

      // Should return default status
      expect(syncStatus).toBeDefined();
      expect(syncStatus.failureCount).toBe(0);
      expect(syncStatus.isManualMode).toBe(false);
    });

    it('should initialize new draft even with existing data for other leagues', () => {
      // Set up existing draft
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      // Initialize another draft
      useDraftStore.getState().initializeDraft('league-2', 300, {
        hitters: 10,
        pitchers: 8,
        bench: 5,
      });

      // Both should exist
      const draft1 = useDraftStore.getState().getDraft('league-1');
      const draft2 = useDraftStore.getState().getDraft('league-2');

      expect(draft1).toBeDefined();
      expect(draft2).toBeDefined();
      expect(draft1!.initialBudget).toBe(260);
      expect(draft2!.initialBudget).toBe(300);
    });

    it('should handle large roster configurations', () => {
      // Very large roster (edge case)
      // Note: generateInitialRoster caps hitters at 9 (standard positions)
      // and pitchers at 9 (5 SP + 4 RP), but bench is unlimited
      useDraftStore.getState().initializeDraft('league-1', 500, {
        hitters: 50, // Capped at 9 (positions array limit)
        pitchers: 30, // Capped at 9 (positions array limit)
        bench: 20, // Unlimited
      });

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft).toBeDefined();
      // 9 hitters + 9 pitchers + 20 bench = 38
      expect(draft!.roster.length).toBe(38);
    });

    it('should handle zero budget edge case', () => {
      useDraftStore.getState().initializeDraft('league-1', 0, defaultRosterConfig);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft).toBeDefined();
      expect(draft!.initialBudget).toBe(0);
      expect(draft!.remainingBudget).toBe(0);
    });

    it('should handle negative budget after overspending', () => {
      useDraftStore.getState().initializeDraft('league-1', 100, defaultRosterConfig);
      useDraftStore.getState().updateBudget('league-1', -50); // Overspent

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft!.remainingBudget).toBe(-50);
    });

    it('should handle empty roster configuration', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, {
        hitters: 0,
        pitchers: 0,
        bench: 0,
      });

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft).toBeDefined();
      expect(draft!.roster.length).toBe(0);
    });
  });

  describe('Data integrity under stress', () => {
    it('should maintain consistency with many drafted players', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      // Add 100 drafted players
      for (let i = 0; i < 100; i++) {
        useDraftStore.getState().addDraftedPlayer('league-1', {
          playerId: `player-${i}`,
          playerName: `Player ${i}`,
          position: ['OF', 'SP', 'SS', 'C', '1B', '2B', '3B'][i % 7],
          purchasePrice: Math.floor(Math.random() * 50) + 1,
          projectedValue: Math.floor(Math.random() * 50) + 1,
          variance: 0,
          draftedBy: i % 2 === 0 ? 'user' : 'other',
        });
      }

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft!.draftedPlayers.length).toBe(100);

      // All players should have required fields
      draft!.draftedPlayers.forEach((player, index) => {
        expect(player.playerId).toBe(`player-${index}`);
        expect(player.draftedAt).toBeDefined();
      });
    });

    it('should handle concurrent filter and sort changes', () => {
      useDraftStore.getState().setSort({ column: 'name', direction: 'asc' });
      useDraftStore.getState().setStatusFilter('my-team');
      useDraftStore.getState().setSearchFilter('Trout');
      useDraftStore.getState().setSort({ column: 'adjustedValue', direction: 'desc' });
      useDraftStore.getState().setStatusFilter('available');

      const state = useDraftStore.getState();
      expect(state.sortState.column).toBe('adjustedValue');
      expect(state.sortState.direction).toBe('desc');
      expect(state.filterState.status).toBe('available');
      expect(state.filterState.searchTerm).toBe('Trout');
    });

    it('should handle multiple sync status updates for same league', () => {
      const store = useDraftStore.getState();

      store.updateSyncStatus('league-1', { isConnected: true, isSyncing: true });
      store.updateSyncStatus('league-1', { isSyncing: false });
      store.incrementFailureCount('league-1', 'transient', 'Error 1');
      store.incrementFailureCount('league-1', 'transient', 'Error 2');
      store.resetFailureCount('league-1');
      store.incrementFailureCount('league-1', 'persistent', 'Error 3');

      const syncStatus = useDraftStore.getState().getSyncStatus('league-1');
      expect(syncStatus.failureCount).toBe(1);
      expect(syncStatus.error).toBe('Error 3');
    });
  });

  describe('Recovery scenarios', () => {
    it('should allow clearing a single draft without affecting others', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      useDraftStore.getState().initializeDraft('league-2', 300, defaultRosterConfig);

      // Add some data to both
      useDraftStore.getState().addDraftedPlayer('league-1', {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        position: 'OF',
        purchasePrice: 50,
        projectedValue: 45,
        variance: 5,
        draftedBy: 'user',
      });

      useDraftStore.getState().addDraftedPlayer('league-2', {
        playerId: 'player-2',
        playerName: 'Aaron Judge',
        position: 'OF',
        purchasePrice: 55,
        projectedValue: 50,
        variance: 5,
        draftedBy: 'user',
      });

      // Clear league-1
      useDraftStore.getState().clearDraft('league-1');

      // league-1 should be gone, league-2 should remain
      expect(useDraftStore.getState().getDraft('league-1')).toBeUndefined();
      const draft2 = useDraftStore.getState().getDraft('league-2');
      expect(draft2).toBeDefined();
      expect(draft2!.draftedPlayers.length).toBe(1);
    });

    it('should handle draft re-initialization after clearing', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      useDraftStore.getState().addDraftedPlayer('league-1', {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        position: 'OF',
        purchasePrice: 50,
        projectedValue: 45,
        variance: 5,
        draftedBy: 'user',
      });

      // Clear and re-initialize with different config
      // Note: hitters/pitchers capped at 9 positions each
      useDraftStore.getState().clearDraft('league-1');
      useDraftStore.getState().initializeDraft('league-1', 300, {
        hitters: 10, // Capped at 9
        pitchers: 10, // Capped at 9
        bench: 5, // No cap
      });

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft).toBeDefined();
      expect(draft!.initialBudget).toBe(300);
      expect(draft!.draftedPlayers.length).toBe(0);
      // 9 + 9 + 5 = 23
      expect(draft!.roster.length).toBe(23);
    });
  });
});
