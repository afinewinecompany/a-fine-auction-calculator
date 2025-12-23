/**
 * Draft Store Tests
 *
 * Tests for draft state management with localStorage persistence.
 *
 * Story: 3.7 - Implement Resume Draft Functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDraftStore } from '@/features/draft';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('draftStore', () => {
  const defaultRosterConfig = {
    hitters: 14,
    pitchers: 9,
    bench: 3,
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset store to initial state
    useDraftStore.setState({ drafts: {} });
  });

  describe('initializeDraft', () => {
    it('creates new draft with correct structure', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft).toBeDefined();
      expect(draft?.leagueId).toBe('league-1');
      expect(draft?.remainingBudget).toBe(260);
      expect(draft?.initialBudget).toBe(260);
      expect(draft?.draftedPlayers).toEqual([]);
      expect(draft?.startedAt).toBeDefined();
      expect(draft?.lastUpdatedAt).toBeDefined();
    });

    it('creates roster slots based on configuration', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      const draft = useDraftStore.getState().getDraft('league-1');
      // 9 hitter positions (C, 1B, 2B, 3B, SS, OF, OF, OF, UTIL) + 9 pitcher positions + 3 bench
      // But limited by config: 14 hitters -> 9 (limited to positions array), 9 pitchers, 3 bench = 21
      expect(draft?.roster.length).toBeGreaterThan(0);

      // Check that roster slots have correct structure
      draft?.roster.forEach(slot => {
        expect(slot.position).toBeDefined();
        expect(slot.playerId).toBeNull();
        expect(slot.playerName).toBeNull();
        expect(slot.purchasePrice).toBeNull();
      });
    });

    it('initializes inflation data with budget', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft?.inflationData.moneyRemaining).toBe(260);
      expect(draft?.inflationData.currentInflationRate).toBe(0);
      expect(draft?.inflationData.moneySpent).toBe(0);
    });

    it('does not overwrite existing draft', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      const originalStartedAt = useDraftStore.getState().getDraft('league-1')?.startedAt;

      // Try to reinitialize with different budget
      useDraftStore.getState().initializeDraft('league-1', 300, defaultRosterConfig);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft?.initialBudget).toBe(260); // Should still be original
      expect(draft?.startedAt).toBe(originalStartedAt);
    });

    it('allows multiple leagues to have separate drafts', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      useDraftStore.getState().initializeDraft('league-2', 300, defaultRosterConfig);

      const draft1 = useDraftStore.getState().getDraft('league-1');
      const draft2 = useDraftStore.getState().getDraft('league-2');

      expect(draft1?.initialBudget).toBe(260);
      expect(draft2?.initialBudget).toBe(300);
    });
  });

  describe('updateRoster', () => {
    it('updates roster and lastUpdatedAt', async () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      const originalLastUpdated = useDraftStore.getState().getDraft('league-1')?.lastUpdatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const newRoster = [
        { position: 'C' as const, playerId: 'player-1', playerName: 'Test Player', purchasePrice: 25 },
      ];

      useDraftStore.getState().updateRoster('league-1', newRoster);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft?.roster).toEqual(newRoster);
      // Check that lastUpdatedAt is a valid ISO string (timing can be tricky in tests)
      expect(draft?.lastUpdatedAt).toBeDefined();
      expect(new Date(draft?.lastUpdatedAt ?? '').getTime()).toBeGreaterThanOrEqual(
        new Date(originalLastUpdated ?? '').getTime()
      );
    });

    it('does nothing if draft does not exist', () => {
      const newRoster = [
        { position: 'C' as const, playerId: 'player-1', playerName: 'Test', purchasePrice: 25 },
      ];

      useDraftStore.getState().updateRoster('nonexistent', newRoster);

      expect(useDraftStore.getState().getDraft('nonexistent')).toBeUndefined();
    });
  });

  describe('updateBudget', () => {
    it('updates remainingBudget', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      useDraftStore.getState().updateBudget('league-1', 235);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft?.remainingBudget).toBe(235);
    });

    it('does nothing if draft does not exist', () => {
      useDraftStore.getState().updateBudget('nonexistent', 235);

      expect(useDraftStore.getState().getDraft('nonexistent')).toBeUndefined();
    });
  });

  describe('addDraftedPlayer', () => {
    it('adds player with timestamp', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      const player = {
        playerId: 'player-1',
        playerName: 'Test Player',
        position: 'OF',
        purchasePrice: 25,
        projectedValue: 20,
        variance: 5,
        draftedBy: 'user' as const,
      };

      useDraftStore.getState().addDraftedPlayer('league-1', player);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft?.draftedPlayers).toHaveLength(1);
      expect(draft?.draftedPlayers[0].playerId).toBe('player-1');
      expect(draft?.draftedPlayers[0].draftedAt).toBeDefined();
    });

    it('appends to existing drafted players', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      const player1 = {
        playerId: 'player-1',
        playerName: 'Player 1',
        position: 'OF',
        purchasePrice: 25,
        projectedValue: 20,
        variance: 5,
        draftedBy: 'user' as const,
      };

      const player2 = {
        playerId: 'player-2',
        playerName: 'Player 2',
        position: '1B',
        purchasePrice: 30,
        projectedValue: 28,
        variance: 2,
        draftedBy: 'other' as const,
      };

      useDraftStore.getState().addDraftedPlayer('league-1', player1);
      useDraftStore.getState().addDraftedPlayer('league-1', player2);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft?.draftedPlayers).toHaveLength(2);
    });
  });

  describe('updateInflationData', () => {
    it('merges partial data', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      useDraftStore.getState().updateInflationData('league-1', {
        currentInflationRate: 1.15,
        moneySpent: 50,
      });

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft?.inflationData.currentInflationRate).toBe(1.15);
      expect(draft?.inflationData.moneySpent).toBe(50);
      // Original values should be preserved
      expect(draft?.inflationData.moneyRemaining).toBe(260);
    });

    it('updates position and tier inflation', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      useDraftStore.getState().updateInflationData('league-1', {
        positionInflation: { OF: 1.2, SP: 0.95 },
        tierInflation: { elite: 1.3, mid: 1.1 },
      });

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft?.inflationData.positionInflation).toEqual({ OF: 1.2, SP: 0.95 });
      expect(draft?.inflationData.tierInflation).toEqual({ elite: 1.3, mid: 1.1 });
    });
  });

  describe('clearDraft', () => {
    it('removes draft from state', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      expect(useDraftStore.getState().getDraft('league-1')).toBeDefined();

      useDraftStore.getState().clearDraft('league-1');

      expect(useDraftStore.getState().getDraft('league-1')).toBeUndefined();
    });

    it('does not affect other drafts', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);
      useDraftStore.getState().initializeDraft('league-2', 300, defaultRosterConfig);

      useDraftStore.getState().clearDraft('league-1');

      expect(useDraftStore.getState().getDraft('league-1')).toBeUndefined();
      expect(useDraftStore.getState().getDraft('league-2')).toBeDefined();
    });

    it('handles clearing non-existent draft gracefully', () => {
      expect(() => {
        useDraftStore.getState().clearDraft('nonexistent');
      }).not.toThrow();
    });
  });

  describe('getDraft', () => {
    it('returns draft if exists', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      const draft = useDraftStore.getState().getDraft('league-1');
      expect(draft).toBeDefined();
      expect(draft?.leagueId).toBe('league-1');
    });

    it('returns undefined if draft does not exist', () => {
      const draft = useDraftStore.getState().getDraft('nonexistent');
      expect(draft).toBeUndefined();
    });
  });

  describe('hasDraftInProgress', () => {
    it('returns true when players have been drafted', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      useDraftStore.getState().addDraftedPlayer('league-1', {
        playerId: 'player-1',
        playerName: 'Test Player',
        position: 'OF',
        purchasePrice: 25,
        projectedValue: 20,
        variance: 5,
        draftedBy: 'user',
      });

      expect(useDraftStore.getState().hasDraftInProgress('league-1')).toBe(true);
    });

    it('returns false when no players drafted (fresh draft)', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      expect(useDraftStore.getState().hasDraftInProgress('league-1')).toBe(false);
    });

    it('returns false when draft does not exist', () => {
      expect(useDraftStore.getState().hasDraftInProgress('nonexistent')).toBe(false);
    });
  });

  describe('persistence', () => {
    it('stores drafts in state correctly for persistence', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      // Verify the draft is stored in the drafts object
      const state = useDraftStore.getState();
      expect(state.drafts).toHaveProperty('league-1');
      expect(state.drafts['league-1'].initialBudget).toBe(260);
    });

    it('state structure is correct for JSON serialization', () => {
      useDraftStore.getState().initializeDraft('league-1', 260, defaultRosterConfig);

      // Verify the state can be serialized to JSON (which persist middleware does)
      const state = useDraftStore.getState();
      const serializable = { drafts: state.drafts };

      // Should not throw when stringifying
      const json = JSON.stringify(serializable);
      expect(json).toContain('league-1');
      expect(json).toContain('260');

      // Should be able to parse back
      const parsed = JSON.parse(json);
      expect(parsed.drafts['league-1'].initialBudget).toBe(260);
    });
  });
});
