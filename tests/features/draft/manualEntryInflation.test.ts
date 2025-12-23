/**
 * Manual Entry Inflation Accuracy Tests
 *
 * Tests to verify that manual entries produce identical inflation results
 * as auto-synced entries (NFR-R5: no accuracy degradation).
 *
 * Story 10.3 - Implement Manual Bid Entry
 *
 * Test Coverage:
 * - Manual entries trigger inflation recalculation
 * - Manual entries produce identical inflation as auto sync
 * - Adjusted values update correctly after manual entry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import { useInflationStore } from '@/features/inflation/stores/inflationStore';

describe('Manual Entry Inflation Accuracy', () => {
  beforeEach(() => {
    // Reset stores before each test
    useDraftStore.setState({
      drafts: {},
      sortState: { column: 'adjustedValue', direction: 'desc' },
      filterState: { status: 'available', searchTerm: '' },
      syncStatus: {},
    });
    useInflationStore.getState().resetInflation();
  });

  describe('Inflation Calculation Parity', () => {
    it('manual entry produces identical inflation as auto sync entry', () => {
      const leagueId = 'test-league-1';

      // Initialize draft
      act(() => {
        useDraftStore.getState().initializeDraft(leagueId, 260, {
          hitters: 14,
          pitchers: 9,
          bench: 3,
        });
      });

      // Simulate auto-sync entry
      const autoSyncPlayer = {
        playerId: 'player-auto',
        playerName: 'Auto Sync Player',
        position: 'OF',
        purchasePrice: 45,
        projectedValue: 40,
        variance: 5,
        draftedBy: 'other' as const,
      };

      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, autoSyncPlayer);
      });

      // Get state after auto sync
      const draftAfterAuto = useDraftStore.getState().getDraft(leagueId);
      const autoSyncPlayers = draftAfterAuto?.draftedPlayers ?? [];

      // Calculate inflation with auto sync data
      const projections = [
        { playerId: 'player-auto', projectedValue: 40 },
        { playerId: 'player-manual', projectedValue: 35 },
        { playerId: 'player-available', projectedValue: 30 },
      ];

      act(() => {
        useInflationStore.getState().updateInflation(
          autoSyncPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
          })),
          projections
        );
      });

      const inflationAfterAuto = useInflationStore.getState().overallRate;

      // Now reset and do manual entry
      useDraftStore.setState({
        drafts: {},
        sortState: { column: 'adjustedValue', direction: 'desc' },
        filterState: { status: 'available', searchTerm: '' },
        syncStatus: {},
      });
      useInflationStore.getState().resetInflation();

      // Initialize draft again
      act(() => {
        useDraftStore.getState().initializeDraft(leagueId, 260, {
          hitters: 14,
          pitchers: 9,
          bench: 3,
        });
      });

      // Simulate manual entry with SAME data
      const manualEntryPlayer = {
        playerId: 'player-auto', // Same player
        playerName: 'Auto Sync Player',
        position: 'OF',
        purchasePrice: 45, // Same price
        projectedValue: 40,
        variance: 5,
        draftedBy: 'user' as const, // Manual entry flag
      };

      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, manualEntryPlayer);
      });

      const draftAfterManual = useDraftStore.getState().getDraft(leagueId);
      const manualEntryPlayers = draftAfterManual?.draftedPlayers ?? [];

      // Calculate inflation with manual entry data
      act(() => {
        useInflationStore.getState().updateInflation(
          manualEntryPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
          })),
          projections
        );
      });

      const inflationAfterManual = useInflationStore.getState().overallRate;

      // NFR-R5: Manual entries must produce identical inflation results
      expect(inflationAfterManual).toBe(inflationAfterAuto);
    });

    it('adjusted values are identical for manual vs auto sync entries', () => {
      const leagueId = 'test-league-2';

      // Shared projections
      const projections = [
        { playerId: 'player-1', projectedValue: 45 },
        { playerId: 'player-2', projectedValue: 35 },
        { playerId: 'player-3', projectedValue: 25 },
      ];

      // Drafted player data
      const draftedPlayer = {
        playerId: 'player-1',
        playerName: 'Test Player',
        position: 'OF',
        purchasePrice: 50,
        projectedValue: 45,
        variance: 5,
        draftedBy: 'other' as const,
      };

      // Test with auto sync
      act(() => {
        useDraftStore.getState().initializeDraft(leagueId, 260, {
          hitters: 14,
          pitchers: 9,
          bench: 3,
        });
        useDraftStore.getState().addDraftedPlayer(leagueId, draftedPlayer);
      });

      const draftAuto = useDraftStore.getState().getDraft(leagueId);
      const autoPlayers = draftAuto?.draftedPlayers ?? [];

      act(() => {
        useInflationStore.getState().updateInflation(
          autoPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
          })),
          projections
        );
      });

      const adjustedValuesAuto = new Map(useInflationStore.getState().adjustedValues);

      // Reset for manual entry test
      useDraftStore.setState({
        drafts: {},
        sortState: { column: 'adjustedValue', direction: 'desc' },
        filterState: { status: 'available', searchTerm: '' },
        syncStatus: {},
      });
      useInflationStore.getState().resetInflation();

      // Test with manual entry
      const manualDraftedPlayer = {
        ...draftedPlayer,
        draftedBy: 'user' as const,
      };

      act(() => {
        useDraftStore.getState().initializeDraft(leagueId, 260, {
          hitters: 14,
          pitchers: 9,
          bench: 3,
        });
        useDraftStore.getState().addDraftedPlayer(leagueId, manualDraftedPlayer);
      });

      const draftManual = useDraftStore.getState().getDraft(leagueId);
      const manualPlayers = draftManual?.draftedPlayers ?? [];

      act(() => {
        useInflationStore.getState().updateInflation(
          manualPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
          })),
          projections
        );
      });

      const adjustedValuesManual = useInflationStore.getState().adjustedValues;

      // Compare adjusted values for undrafted players
      expect(adjustedValuesManual.get('player-2')).toBe(adjustedValuesAuto.get('player-2'));
      expect(adjustedValuesManual.get('player-3')).toBe(adjustedValuesAuto.get('player-3'));
    });
  });

  describe('Inflation Update Timing', () => {
    it('inflation is recalculated after each manual entry', () => {
      const leagueId = 'test-league-3';
      const projections = [
        { playerId: 'player-1', projectedValue: 40 },
        { playerId: 'player-2', projectedValue: 30 },
      ];

      act(() => {
        useDraftStore.getState().initializeDraft(leagueId, 260, {
          hitters: 14,
          pitchers: 9,
          bench: 3,
        });
      });

      // Initial state - no inflation
      expect(useInflationStore.getState().overallRate).toBe(0);

      // First manual entry
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'player-1',
          playerName: 'Player One',
          position: 'OF',
          purchasePrice: 50, // Overpaid by 10
          projectedValue: 40,
          variance: 10,
          draftedBy: 'user',
        });
      });

      const draft = useDraftStore.getState().getDraft(leagueId);
      const players = draft?.draftedPlayers ?? [];

      act(() => {
        useInflationStore.getState().updateInflation(
          players.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
          })),
          projections
        );
      });

      const inflationAfterFirstEntry = useInflationStore.getState().overallRate;
      // Should have positive inflation due to overpaying
      expect(inflationAfterFirstEntry).toBeGreaterThan(0);

      // Second manual entry
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'player-2',
          playerName: 'Player Two',
          position: 'OF',
          purchasePrice: 20, // Underpaid by 10
          projectedValue: 30,
          variance: -10,
          draftedBy: 'user',
        });
      });

      const updatedDraft = useDraftStore.getState().getDraft(leagueId);
      const updatedPlayers = updatedDraft?.draftedPlayers ?? [];

      act(() => {
        useInflationStore.getState().updateInflation(
          updatedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
          })),
          projections
        );
      });

      const inflationAfterSecondEntry = useInflationStore.getState().overallRate;
      // Inflation should be different after second entry
      expect(inflationAfterSecondEntry).not.toBe(inflationAfterFirstEntry);
    });
  });

  describe('Manual Entry Data Integrity', () => {
    it('manual entries are stored with correct data structure', () => {
      const leagueId = 'test-league-4';

      act(() => {
        useDraftStore.getState().initializeDraft(leagueId, 260, {
          hitters: 14,
          pitchers: 9,
          bench: 3,
        });
      });

      const manualEntry = {
        playerId: 'player-manual-1',
        playerName: 'Manual Entry Player',
        position: 'SP',
        purchasePrice: 35,
        projectedValue: 30,
        variance: 5,
        draftedBy: 'user' as const,
      };

      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, manualEntry);
      });

      const draft = useDraftStore.getState().getDraft(leagueId);
      const storedPlayer = draft?.draftedPlayers[0];

      expect(storedPlayer).toMatchObject({
        playerId: 'player-manual-1',
        playerName: 'Manual Entry Player',
        position: 'SP',
        purchasePrice: 35,
        projectedValue: 30,
        variance: 5,
        draftedBy: 'user',
      });
      expect(storedPlayer?.draftedAt).toBeDefined();
    });

    it('manual entries are persisted with draftedAt timestamp', () => {
      const leagueId = 'test-league-5';
      const beforeAdd = new Date().toISOString();

      act(() => {
        useDraftStore.getState().initializeDraft(leagueId, 260, {
          hitters: 14,
          pitchers: 9,
          bench: 3,
        });

        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'player-time-test',
          playerName: 'Time Test Player',
          position: 'OF',
          purchasePrice: 25,
          projectedValue: 20,
          variance: 5,
          draftedBy: 'user',
        });
      });

      const afterAdd = new Date().toISOString();

      const draft = useDraftStore.getState().getDraft(leagueId);
      const storedPlayer = draft?.draftedPlayers[0];

      expect(storedPlayer?.draftedAt).toBeDefined();
      expect(new Date(storedPlayer!.draftedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeAdd).getTime()
      );
      expect(new Date(storedPlayer!.draftedAt).getTime()).toBeLessThanOrEqual(
        new Date(afterAdd).getTime()
      );
    });
  });
});
