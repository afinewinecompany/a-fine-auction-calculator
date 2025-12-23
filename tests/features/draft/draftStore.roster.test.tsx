/**
 * Draft Store Roster Management Tests
 *
 * Tests for the addToRoster action that manages roster slots
 * when players are drafted by the user's team.
 *
 * Story: 10.4 - Implement My Team Checkbox
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import type { RosterConfig } from '@/features/draft/types/draft.types';

describe('draftStore roster management', () => {
  const leagueId = 'test-league-123';
  const rosterConfig: RosterConfig = {
    hitters: 9,
    pitchers: 9,
    bench: 3,
  };

  beforeEach(() => {
    // Reset store state before each test
    useDraftStore.setState({
      drafts: {},
      sortState: { column: 'adjustedValue', direction: 'desc' },
      filterState: { status: 'available', searchTerm: '' },
      syncStatus: {},
    });
  });

  describe('addToRoster', () => {
    beforeEach(() => {
      // Initialize a draft for testing
      useDraftStore.getState().initializeDraft(leagueId, 260, rosterConfig);
    });

    it('adds player to exact position match slot', () => {
      const result = useDraftStore.getState().addToRoster(
        leagueId,
        'player-1',
        'Mike Trout',
        'C',
        30
      );

      expect(result).toBe(true);

      const draft = useDraftStore.getState().getDraft(leagueId);
      const cSlot = draft?.roster.find(s => s.position === 'C');
      expect(cSlot?.playerId).toBe('player-1');
      expect(cSlot?.playerName).toBe('Mike Trout');
      expect(cSlot?.purchasePrice).toBe(30);
    });

    it('adds player to OF slot for outfielder', () => {
      const result = useDraftStore.getState().addToRoster(
        leagueId,
        'player-1',
        'Mike Trout',
        'OF',
        40
      );

      expect(result).toBe(true);

      const draft = useDraftStore.getState().getDraft(leagueId);
      const ofSlots = draft?.roster.filter(s => s.position === 'OF');
      const filledSlot = ofSlots?.find(s => s.playerId === 'player-1');
      expect(filledSlot).toBeDefined();
      expect(filledSlot?.playerName).toBe('Mike Trout');
    });

    it('falls back to UTIL slot for hitter when position filled', () => {
      // Fill the C slot first
      useDraftStore.getState().addToRoster(leagueId, 'player-1', 'First Catcher', 'C', 20);

      // Try to add another catcher - should go to UTIL
      const result = useDraftStore.getState().addToRoster(
        leagueId,
        'player-2',
        'Second Catcher',
        'C',
        15
      );

      expect(result).toBe(true);

      const draft = useDraftStore.getState().getDraft(leagueId);
      const utilSlot = draft?.roster.find(s => s.position === 'UTIL');
      expect(utilSlot?.playerId).toBe('player-2');
      expect(utilSlot?.playerName).toBe('Second Catcher');
    });

    it('falls back to bench slot when position and UTIL filled', () => {
      // Fill C slot
      useDraftStore.getState().addToRoster(leagueId, 'player-1', 'First Catcher', 'C', 20);
      // Fill UTIL slot
      useDraftStore.getState().addToRoster(leagueId, 'player-2', 'Second Catcher', 'C', 15);

      // Try to add another catcher - should go to BN
      const result = useDraftStore.getState().addToRoster(
        leagueId,
        'player-3',
        'Third Catcher',
        'C',
        10
      );

      expect(result).toBe(true);

      const draft = useDraftStore.getState().getDraft(leagueId);
      const bnSlots = draft?.roster.filter(s => s.position === 'BN');
      const filledBn = bnSlots?.find(s => s.playerId === 'player-3');
      expect(filledBn).toBeDefined();
      expect(filledBn?.playerName).toBe('Third Catcher');
    });

    it('adds pitcher to pitcher slot', () => {
      const result = useDraftStore.getState().addToRoster(
        leagueId,
        'player-1',
        'Clayton Kershaw',
        'SP',
        35
      );

      expect(result).toBe(true);

      const draft = useDraftStore.getState().getDraft(leagueId);
      const spSlots = draft?.roster.filter(s => s.position === 'SP');
      const filledSlot = spSlots?.find(s => s.playerId === 'player-1');
      expect(filledSlot).toBeDefined();
    });

    it('pitcher falls back to bench, not UTIL', () => {
      // Fill all SP slots
      const draft = useDraftStore.getState().getDraft(leagueId);
      const spSlots = draft?.roster.filter(s => s.position === 'SP') || [];

      // Fill all SP slots
      spSlots.forEach((_, index) => {
        useDraftStore.getState().addToRoster(
          leagueId,
          `sp-${index}`,
          `Starter ${index}`,
          'SP',
          10
        );
      });

      // Try to add another SP - should go to BN, not UTIL
      const result = useDraftStore.getState().addToRoster(
        leagueId,
        'extra-sp',
        'Extra Starter',
        'SP',
        5
      );

      expect(result).toBe(true);

      const updatedDraft = useDraftStore.getState().getDraft(leagueId);
      const utilSlot = updatedDraft?.roster.find(s => s.position === 'UTIL');
      expect(utilSlot?.playerId).toBeNull(); // UTIL should NOT have the pitcher

      const bnSlots = updatedDraft?.roster.filter(s => s.position === 'BN');
      const filledBn = bnSlots?.find(s => s.playerId === 'extra-sp');
      expect(filledBn).toBeDefined();
    });

    it('returns false when no slots available', () => {
      // Fill all slots
      const draft = useDraftStore.getState().getDraft(leagueId);
      const allSlots = draft?.roster || [];

      allSlots.forEach((slot, index) => {
        useDraftStore.getState().addToRoster(
          leagueId,
          `player-${index}`,
          `Player ${index}`,
          slot.position,
          1
        );
      });

      // Try to add one more player
      const result = useDraftStore.getState().addToRoster(
        leagueId,
        'overflow-player',
        'Overflow Player',
        'C',
        1
      );

      expect(result).toBe(false);
    });

    it('returns false for non-existent league', () => {
      const result = useDraftStore.getState().addToRoster(
        'non-existent-league',
        'player-1',
        'Player 1',
        'C',
        10
      );

      expect(result).toBe(false);
    });

    it('updates lastUpdatedAt when roster is modified', () => {
      const draftBefore = useDraftStore.getState().getDraft(leagueId);
      const updatedAtBefore = draftBefore?.lastUpdatedAt;

      // Add a small delay
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      useDraftStore.getState().addToRoster(leagueId, 'player-1', 'Mike Trout', 'C', 30);

      const draftAfter = useDraftStore.getState().getDraft(leagueId);
      expect(draftAfter?.lastUpdatedAt).not.toBe(updatedAtBefore);

      vi.useRealTimers();
    });
  });

  describe('addToRoster with multiple OF slots', () => {
    beforeEach(() => {
      useDraftStore.getState().initializeDraft(leagueId, 260, rosterConfig);
    });

    it('fills multiple OF slots sequentially', () => {
      // Add first outfielder
      useDraftStore.getState().addToRoster(leagueId, 'of-1', 'Outfielder 1', 'OF', 20);
      // Add second outfielder
      useDraftStore.getState().addToRoster(leagueId, 'of-2', 'Outfielder 2', 'OF', 25);
      // Add third outfielder
      useDraftStore.getState().addToRoster(leagueId, 'of-3', 'Outfielder 3', 'OF', 30);

      const draft = useDraftStore.getState().getDraft(leagueId);
      const ofSlots = draft?.roster.filter(s => s.position === 'OF');

      const filledOf = ofSlots?.filter(s => s.playerId !== null) || [];
      expect(filledOf.length).toBe(3);
    });
  });
});
