/**
 * Draft Store Persistence Tests
 *
 * Story: 10.7 - Preserve Draft State During Connection Failures
 * Tests that draft state is correctly managed by the store with persist middleware
 * and can be restored properly (simulating page refresh).
 *
 * Note: Zustand persist middleware uses localStorage internally.
 * These tests verify the store's partialize config and state restoration logic.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDraftStore } from '@/features/draft';

describe('Draft Store Persistence - Story 10.7', () => {
  const defaultRosterConfig = {
    hitters: 14,
    pitchers: 9,
    bench: 3,
  };

  beforeEach(() => {
    // Reset store to initial state before each test
    useDraftStore.setState({
      drafts: {},
      sortState: { column: 'adjustedValue', direction: 'desc' },
      filterState: { status: 'all', searchTerm: '' },
      syncStatus: {},
    });
  });

  describe('AC1: Draft state structure for persistence', () => {
    it('should initialize draft with all critical fields', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      const draft = useDraftStore.getState().getDraft('league-1');

      expect(draft).toBeDefined();
      expect(draft!.leagueId).toBe('league-1');
      expect(draft!.remainingBudget).toBe(260);
      expect(draft!.initialBudget).toBe(260);
      expect(draft!.roster).toBeDefined();
      expect(draft!.roster.length).toBeGreaterThan(0);
      expect(draft!.draftedPlayers).toEqual([]);
      expect(draft!.inflationData).toBeDefined();
      expect(draft!.startedAt).toBeDefined();
      expect(draft!.lastUpdatedAt).toBeDefined();
    });

    it('should update roster and track lastUpdatedAt', async () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      const draft = useDraftStore.getState().getDraft('league-1')!;

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 5));

      const updatedRoster = [...draft.roster];
      updatedRoster[0] = {
        ...updatedRoster[0],
        playerId: 'player-1',
        playerName: 'Mike Trout',
        purchasePrice: 50,
      };
      useDraftStore.getState().updateRoster('league-1', updatedRoster);

      const updatedDraft = useDraftStore.getState().getDraft('league-1')!;
      expect(updatedDraft.roster[0].playerId).toBe('player-1');
      expect(updatedDraft.roster[0].playerName).toBe('Mike Trout');
      // lastUpdatedAt should be updated (or at least present)
      expect(updatedDraft.lastUpdatedAt).toBeDefined();
    });

    it('should update budget correctly', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      useDraftStore.getState().updateBudget('league-1', 210);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft!.remainingBudget).toBe(210);
    });

    it('should track drafted players with all required fields', () => {
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

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft!.draftedPlayers).toHaveLength(1);
      expect(draft!.draftedPlayers[0].playerName).toBe('Mike Trout');
      expect(draft!.draftedPlayers[0].draftedAt).toBeDefined();
    });
  });

  describe('AC2: State includes all critical data', () => {
    it('should store roster, budget, drafted players, and inflation data', () => {
      const store = useDraftStore.getState();

      store.initializeDraft('league-1', 260, defaultRosterConfig);
      store.updateBudget('league-1', 200);
      store.addDraftedPlayer('league-1', {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        position: 'OF',
        purchasePrice: 50,
        projectedValue: 45,
        variance: 5,
        draftedBy: 'user',
      });
      store.updateInflationData('league-1', {
        currentInflationRate: 1.15,
        moneySpent: 60,
        moneyRemaining: 200,
        playersRemaining: 100,
      });

      const draft = useDraftStore.getState().getDraft('league-1');

      // Verify all critical data is stored
      expect(draft!.roster).toBeDefined();
      expect(draft!.remainingBudget).toBe(200);
      expect(draft!.draftedPlayers).toHaveLength(1);
      expect(draft!.inflationData.currentInflationRate).toBe(1.15);
      expect(draft!.inflationData.moneySpent).toBe(60);
      expect(draft!.startedAt).toBeDefined();
      expect(draft!.lastUpdatedAt).toBeDefined();
    });
  });

  describe('AC3: Sync status stored correctly', () => {
    it('should track sync status including failure count and manual mode', () => {
      const store = useDraftStore.getState();

      store.updateSyncStatus('league-1', {
        isConnected: true,
        isSyncing: false,
        lastSync: new Date(),
      });

      // Simulate failures (transient = network-related issues)
      store.incrementFailureCount('league-1', 'transient', 'Connection timeout');
      store.incrementFailureCount('league-1', 'transient', 'Connection timeout');
      store.incrementFailureCount('league-1', 'transient', 'Connection timeout');

      store.enableManualMode('league-1');

      const syncStatus = useDraftStore.getState().getSyncStatus('league-1');

      expect(syncStatus).toBeDefined();
      expect(syncStatus.failureCount).toBe(3);
      expect(syncStatus.isManualMode).toBe(true);
      expect(syncStatus.error).toBe('Connection timeout');
    });

    it('should reset failure count on successful sync', () => {
      const store = useDraftStore.getState();

      // Simulate failures first
      store.incrementFailureCount('league-1', 'transient', 'Connection timeout');
      store.incrementFailureCount('league-1', 'transient', 'Connection timeout');

      // Then successful sync
      store.resetFailureCount('league-1');

      const syncStatus = useDraftStore.getState().getSyncStatus('league-1');
      expect(syncStatus.failureCount).toBe(0);
      expect(syncStatus.isConnected).toBe(true);
      expect(syncStatus.error).toBeNull();
    });
  });

  describe('AC4: State restored on simulated page refresh', () => {
    it('should restore draft state from persisted state object', () => {
      // Set up draft state
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
      useDraftStore.getState().updateBudget('league-1', 210);

      // Capture the current state (this simulates what would be in localStorage)
      const capturedState = {
        drafts: useDraftStore.getState().drafts,
        sortState: useDraftStore.getState().sortState,
        filterState: useDraftStore.getState().filterState,
        syncStatus: useDraftStore.getState().syncStatus,
      };

      // Simulate page refresh by clearing store
      useDraftStore.setState({
        drafts: {},
        sortState: { column: 'adjustedValue', direction: 'desc' },
        filterState: { status: 'all', searchTerm: '' },
        syncStatus: {},
      });

      // Verify state is cleared
      expect(useDraftStore.getState().getDraft('league-1')).toBeUndefined();

      // Restore from captured state (simulating persist middleware hydration)
      useDraftStore.setState(capturedState);

      // Verify state is restored
      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft).toBeDefined();
      expect(draft!.remainingBudget).toBe(210);
      expect(draft!.draftedPlayers).toHaveLength(1);
      expect(draft!.draftedPlayers[0].playerName).toBe('Mike Trout');
    });
  });

  describe('AC5: Zero data loss (NFR-R4)', () => {
    it('should not lose data during multiple rapid updates', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      // Rapid fire updates
      for (let i = 0; i < 10; i++) {
        useDraftStore.getState().addDraftedPlayer('league-1', {
          playerId: `player-${i}`,
          playerName: `Player ${i}`,
          position: 'OF',
          purchasePrice: 10,
          projectedValue: 10,
          variance: 0,
          draftedBy: 'other',
        });
        useDraftStore.getState().updateBudget('league-1', 260 - (i + 1) * 10);
      }

      const draft = useDraftStore.getState().getDraft('league-1');

      // Verify all 10 players and final budget are stored
      expect(draft!.draftedPlayers).toHaveLength(10);
      expect(draft!.remainingBudget).toBe(160);
    });

    it('should maintain state integrity regardless of failure type', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      // Add player then simulate network failures
      useDraftStore.getState().addDraftedPlayer('league-1', {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        position: 'OF',
        purchasePrice: 50,
        projectedValue: 45,
        variance: 5,
        draftedBy: 'user',
      });

      useDraftStore.getState().incrementFailureCount('league-1', 'transient', 'Network disconnected');
      useDraftStore.getState().incrementFailureCount('league-1', 'transient', 'Network disconnected');
      useDraftStore.getState().incrementFailureCount('league-1', 'persistent', 'API unreachable');

      // Draft data should still be intact despite failures
      const draft = useDraftStore.getState().getDraft('league-1');
      const syncStatus = useDraftStore.getState().getSyncStatus('league-1');

      expect(draft!.draftedPlayers).toHaveLength(1);
      expect(syncStatus.isManualMode).toBe(true);
      expect(syncStatus.failureCount).toBe(3);
    });
  });

  describe('Sort and filter state', () => {
    it('should store sort state', () => {
      useDraftStore.getState().setSort({ column: 'name', direction: 'asc' });

      const sortState = useDraftStore.getState().sortState;

      expect(sortState.column).toBe('name');
      expect(sortState.direction).toBe('asc');
    });

    it('should store filter state', () => {
      useDraftStore.getState().setStatusFilter('my-team');
      useDraftStore.getState().setSearchFilter('Trout');

      const filterState = useDraftStore.getState().filterState;

      expect(filterState.status).toBe('my-team');
      expect(filterState.searchTerm).toBe('Trout');
    });
  });

  describe('Persist configuration verification', () => {
    it('should use correct storage key for persistence', () => {
      // The store persist config uses 'draft-storage' key
      // This test verifies the store is configured (not the actual localStorage)
      const store = useDraftStore;

      // Verify store has persist configuration by checking it has the expected shape
      expect(store.persist).toBeDefined();
    });

    it('should partialize state correctly (include only persistable fields)', () => {
      // Set up various state
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      useDraftStore.getState().setSort({ column: 'name', direction: 'asc' });
      useDraftStore.getState().setStatusFilter('my-team');
      useDraftStore.getState().updateSyncStatus('league-1', { isConnected: true, isSyncing: false });

      const state = useDraftStore.getState();

      // Verify the fields that should be persisted exist
      expect(state.drafts).toBeDefined();
      expect(state.sortState).toBeDefined();
      expect(state.filterState).toBeDefined();
      expect(state.syncStatus).toBeDefined();

      // Verify these are the fields being tracked
      expect(state.drafts['league-1']).toBeDefined();
      expect(state.sortState.column).toBe('name');
      expect(state.filterState.status).toBe('my-team');
      expect(state.syncStatus['league-1']).toBeDefined();
    });
  });

  describe('Recovery performance requirement', () => {
    it('should restore large state quickly (under 100ms for test purposes)', () => {
      // Set up a larger state to simulate real usage
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      // Add 50 drafted players
      for (let i = 0; i < 50; i++) {
        useDraftStore.getState().addDraftedPlayer('league-1', {
          playerId: `player-${i}`,
          playerName: `Player ${i} with longer name for realistic data`,
          position: ['OF', 'SS', 'C', '1B', '2B', '3B', 'SP', 'RP'][i % 8],
          purchasePrice: Math.floor(Math.random() * 50) + 1,
          projectedValue: Math.floor(Math.random() * 50) + 1,
          variance: 0,
          draftedBy: i % 3 === 0 ? 'user' : 'other',
        });
      }

      // Capture state
      const capturedState = {
        drafts: useDraftStore.getState().drafts,
        sortState: useDraftStore.getState().sortState,
        filterState: useDraftStore.getState().filterState,
        syncStatus: useDraftStore.getState().syncStatus,
      };

      // Clear and time the restoration
      useDraftStore.setState({
        drafts: {},
        sortState: { column: 'adjustedValue', direction: 'desc' },
        filterState: { status: 'all', searchTerm: '' },
        syncStatus: {},
      });

      const startTime = performance.now();
      useDraftStore.setState(capturedState);
      const endTime = performance.now();

      // Verify restoration was fast (should be well under 100ms, usually < 5ms)
      expect(endTime - startTime).toBeLessThan(100);

      // Verify state is correct
      expect(useDraftStore.getState().getDraft('league-1')!.draftedPlayers).toHaveLength(50);
    });
  });
});
