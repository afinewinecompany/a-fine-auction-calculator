/**
 * Draft Store Sync Tests
 *
 * Tests for the addDraftedPlayers action used by useDraftSync.
 * Verifies batch player addition, deduplication, and merge behavior.
 *
 * Story: 9.3 - Implement Automatic API Polling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import type { DraftPick } from '@/features/draft/types/sync.types';

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

describe('draftStore.addDraftedPlayers', () => {
  const leagueId = 'league-123';

  beforeEach(() => {
    localStorageMock.clear();
    useDraftStore.setState({ drafts: {} });
  });

  it('adds multiple players from sync picks', () => {
    // Initialize draft
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const picks: DraftPick[] = [
      {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 50,
        position: 'OF',
      },
      {
        playerId: 'player-2',
        playerName: 'Shohei Ohtani',
        team: 'Team B',
        auctionPrice: 55,
        position: 'DH',
      },
      {
        playerId: 'player-3',
        playerName: 'Ronald Acuna Jr',
        team: 'Team C',
        auctionPrice: 48,
        position: 'OF',
      },
    ];

    useDraftStore.getState().addDraftedPlayers(leagueId, picks);

    const draft = useDraftStore.getState().drafts[leagueId];
    expect(draft.draftedPlayers).toHaveLength(3);
    expect(draft.draftedPlayers[0].playerName).toBe('Mike Trout');
    expect(draft.draftedPlayers[1].playerName).toBe('Shohei Ohtani');
    expect(draft.draftedPlayers[2].playerName).toBe('Ronald Acuna Jr');
  });

  it('filters out duplicate players by playerId', () => {
    // Initialize draft with existing player
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    // Add existing player
    useDraftStore.getState().addDraftedPlayer(leagueId, {
      playerId: 'player-1',
      playerName: 'Mike Trout',
      position: 'OF',
      purchasePrice: 50,
      projectedValue: 45,
      variance: 5,
      draftedBy: 'other',
    });

    // Try to add same player again via sync
    const picks: DraftPick[] = [
      {
        playerId: 'player-1', // Duplicate
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 50,
        position: 'OF',
      },
      {
        playerId: 'player-2', // New
        playerName: 'Shohei Ohtani',
        team: 'Team B',
        auctionPrice: 55,
        position: 'DH',
      },
    ];

    useDraftStore.getState().addDraftedPlayers(leagueId, picks);

    const draft = useDraftStore.getState().drafts[leagueId];
    // Should only have 2 players, not 3
    expect(draft.draftedPlayers).toHaveLength(2);

    // Verify the new player was added
    const ohtani = draft.draftedPlayers.find(p => p.playerId === 'player-2');
    expect(ohtani).toBeDefined();
    expect(ohtani?.playerName).toBe('Shohei Ohtani');
  });

  it('handles empty picks array', () => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    // Add existing player
    useDraftStore.getState().addDraftedPlayer(leagueId, {
      playerId: 'player-1',
      playerName: 'Mike Trout',
      position: 'OF',
      purchasePrice: 50,
      projectedValue: 45,
      variance: 5,
      draftedBy: 'other',
    });

    const initialDraft = useDraftStore.getState().drafts[leagueId];
    const initialUpdatedAt = initialDraft.lastUpdatedAt;

    // Add empty picks array
    useDraftStore.getState().addDraftedPlayers(leagueId, []);

    const draft = useDraftStore.getState().drafts[leagueId];
    // Should still have 1 player
    expect(draft.draftedPlayers).toHaveLength(1);
    // lastUpdatedAt should NOT change
    expect(draft.lastUpdatedAt).toBe(initialUpdatedAt);
  });

  it('handles null picks array', () => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    // This should not throw
    useDraftStore.getState().addDraftedPlayers(leagueId, null as unknown as DraftPick[]);

    const draft = useDraftStore.getState().drafts[leagueId];
    expect(draft.draftedPlayers).toHaveLength(0);
  });

  it('does nothing when draft does not exist', () => {
    const picks: DraftPick[] = [
      {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 50,
        position: 'OF',
      },
    ];

    // Should not throw
    useDraftStore.getState().addDraftedPlayers('non-existent-league', picks);

    // Verify no draft was created
    expect(useDraftStore.getState().drafts['non-existent-league']).toBeUndefined();
  });

  it('sets default position when not provided', () => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const picks: DraftPick[] = [
      {
        playerId: 'player-1',
        playerName: 'Unknown Position Player',
        team: 'Team A',
        auctionPrice: 25,
        // position not provided
      },
    ];

    useDraftStore.getState().addDraftedPlayers(leagueId, picks);

    const draft = useDraftStore.getState().drafts[leagueId];
    expect(draft.draftedPlayers[0].position).toBe('UTIL');
  });

  it('marks synced players as drafted by "other"', () => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const picks: DraftPick[] = [
      {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 50,
        position: 'OF',
      },
    ];

    useDraftStore.getState().addDraftedPlayers(leagueId, picks);

    const draft = useDraftStore.getState().drafts[leagueId];
    expect(draft.draftedPlayers[0].draftedBy).toBe('other');
  });

  it('uses auctionPrice as purchasePrice', () => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const picks: DraftPick[] = [
      {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 50,
        position: 'OF',
      },
    ];

    useDraftStore.getState().addDraftedPlayers(leagueId, picks);

    const draft = useDraftStore.getState().drafts[leagueId];
    expect(draft.draftedPlayers[0].purchasePrice).toBe(50);
  });

  it('sets projectedValue equal to purchasePrice (zero variance)', () => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const picks: DraftPick[] = [
      {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 50,
        position: 'OF',
      },
    ];

    useDraftStore.getState().addDraftedPlayers(leagueId, picks);

    const draft = useDraftStore.getState().drafts[leagueId];
    expect(draft.draftedPlayers[0].projectedValue).toBe(50);
    expect(draft.draftedPlayers[0].variance).toBe(0);
  });

  it('updates lastUpdatedAt when players are added', () => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const initialDraft = useDraftStore.getState().drafts[leagueId];
    const initialUpdatedAt = new Date(initialDraft.lastUpdatedAt).getTime();

    // Wait a bit to ensure timestamp difference
    vi.useFakeTimers();
    vi.advanceTimersByTime(1000);

    const picks: DraftPick[] = [
      {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 50,
        position: 'OF',
      },
    ];

    useDraftStore.getState().addDraftedPlayers(leagueId, picks);

    const updatedDraft = useDraftStore.getState().drafts[leagueId];
    const updatedAt = new Date(updatedDraft.lastUpdatedAt).getTime();

    expect(updatedAt).toBeGreaterThan(initialUpdatedAt);

    vi.useRealTimers();
  });

  it('maintains chronological order when merging', () => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    // Add first player with earlier timestamp
    useDraftStore.getState().addDraftedPlayer(leagueId, {
      playerId: 'player-1',
      playerName: 'Earlier Player',
      position: 'OF',
      purchasePrice: 25,
      projectedValue: 25,
      variance: 0,
      draftedBy: 'other',
    });

    // Advance time
    vi.useFakeTimers();
    vi.advanceTimersByTime(5000);

    // Add more players via sync
    const picks: DraftPick[] = [
      {
        playerId: 'player-2',
        playerName: 'Later Player',
        team: 'Team B',
        auctionPrice: 30,
        position: 'OF',
      },
    ];

    useDraftStore.getState().addDraftedPlayers(leagueId, picks);

    const draft = useDraftStore.getState().drafts[leagueId];
    expect(draft.draftedPlayers).toHaveLength(2);
    // Earlier player should come first
    expect(draft.draftedPlayers[0].playerName).toBe('Earlier Player');
    expect(draft.draftedPlayers[1].playerName).toBe('Later Player');

    vi.useRealTimers();
  });

  it('handles all duplicates (nothing new to add)', () => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    // Add players first
    useDraftStore.getState().addDraftedPlayer(leagueId, {
      playerId: 'player-1',
      playerName: 'Mike Trout',
      position: 'OF',
      purchasePrice: 50,
      projectedValue: 45,
      variance: 5,
      draftedBy: 'other',
    });

    useDraftStore.getState().addDraftedPlayer(leagueId, {
      playerId: 'player-2',
      playerName: 'Shohei Ohtani',
      position: 'DH',
      purchasePrice: 55,
      projectedValue: 50,
      variance: 5,
      draftedBy: 'other',
    });

    const initialDraft = useDraftStore.getState().drafts[leagueId];
    const initialUpdatedAt = initialDraft.lastUpdatedAt;

    // Try to add same players via sync
    const picks: DraftPick[] = [
      {
        playerId: 'player-1',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 50,
        position: 'OF',
      },
      {
        playerId: 'player-2',
        playerName: 'Shohei Ohtani',
        team: 'Team B',
        auctionPrice: 55,
        position: 'DH',
      },
    ];

    useDraftStore.getState().addDraftedPlayers(leagueId, picks);

    const draft = useDraftStore.getState().drafts[leagueId];
    // Should still have only 2 players
    expect(draft.draftedPlayers).toHaveLength(2);
    // lastUpdatedAt should NOT change when all are duplicates
    expect(draft.lastUpdatedAt).toBe(initialUpdatedAt);
  });
});
