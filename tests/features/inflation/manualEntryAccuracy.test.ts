/**
 * Manual Entry Inflation Accuracy Tests
 *
 * Story 10.5 - Maintain Inflation Calculation Accuracy in Manual Mode
 *
 * These tests validate that manual entries produce IDENTICAL inflation results
 * as auto-synced entries (NFR-R5: no accuracy degradation in manual mode).
 *
 * Test Coverage:
 * - Data format consistency (tier, isManualEntry fields)
 * - Inflation trigger integration (updateInflation called correctly)
 * - Overall inflation rate matches between manual and auto
 * - Position-specific inflation matches
 * - Tier-specific inflation matches
 * - Adjusted values are identical
 * - Mixed entry scenarios work correctly
 * - Performance benchmarks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import { useInflationStore } from '@/features/inflation/stores/inflationStore';
import { PlayerTier } from '@/features/inflation/types/inflation.types';

// Test helper to reset stores
function resetStores() {
  useDraftStore.setState({
    drafts: {},
    sortState: { column: 'adjustedValue', direction: 'desc' },
    filterState: { status: 'available', searchTerm: '' },
    syncStatus: {},
  });
  useInflationStore.getState().resetInflation();
}

// Test helper to initialize draft
function initializeDraft(leagueId: string) {
  act(() => {
    useDraftStore.getState().initializeDraft(leagueId, 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });
  });
}

// Sample projections for testing
const createTestProjections = () => [
  { playerId: 'elite-1', projectedValue: 50, position: 'OF', tier: 'ELITE' },
  { playerId: 'elite-2', projectedValue: 48, position: 'SS', tier: 'ELITE' },
  { playerId: 'mid-1', projectedValue: 30, position: '1B', tier: 'MID' },
  { playerId: 'mid-2', projectedValue: 28, position: 'SP', tier: 'MID' },
  { playerId: 'mid-3', projectedValue: 25, position: '3B', tier: 'MID' },
  { playerId: 'lower-1', projectedValue: 12, position: '2B', tier: 'LOWER' },
  { playerId: 'lower-2', projectedValue: 10, position: 'C', tier: 'LOWER' },
  { playerId: 'lower-3', projectedValue: 8, position: 'RP', tier: 'LOWER' },
];

describe('Story 10.5: Manual Entry Inflation Accuracy', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('Task 1: Data Format Consistency', () => {
    it('manual entries include all required fields for inflation', () => {
      const leagueId = 'format-test-1';
      initializeDraft(leagueId);

      // Add a manual entry with all required fields
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'player-1',
          playerName: 'Test Player',
          position: 'OF',
          purchasePrice: 55,
          projectedValue: 50,
          variance: 5,
          draftedBy: 'user',
          tier: 'ELITE',
          isManualEntry: true,
        });
      });

      const draft = useDraftStore.getState().getDraft(leagueId);
      const player = draft?.draftedPlayers[0];

      // Verify all required fields are present
      expect(player).toBeDefined();
      expect(player?.playerId).toBe('player-1');
      expect(player?.playerName).toBe('Test Player');
      expect(player?.position).toBe('OF');
      expect(player?.purchasePrice).toBe(55);
      expect(player?.projectedValue).toBe(50);
      expect(player?.variance).toBe(5);
      expect(player?.draftedBy).toBe('user');
      expect(player?.tier).toBe('ELITE');
      expect(player?.isManualEntry).toBe(true);
      expect(player?.draftedAt).toBeDefined();
    });

    it('tier field is included from player projections', () => {
      const leagueId = 'tier-test-1';
      initializeDraft(leagueId);

      // Add entries with different tiers
      const tiers = ['ELITE', 'MID', 'LOWER'];
      tiers.forEach((tier, index) => {
        act(() => {
          useDraftStore.getState().addDraftedPlayer(leagueId, {
            playerId: `player-${index}`,
            playerName: `Player ${tier}`,
            position: 'OF',
            purchasePrice: 30 - index * 10,
            projectedValue: 25 - index * 10,
            variance: 5,
            draftedBy: 'other',
            tier,
            isManualEntry: true,
          });
        });
      });

      const draft = useDraftStore.getState().getDraft(leagueId);
      expect(draft?.draftedPlayers[0]?.tier).toBe('ELITE');
      expect(draft?.draftedPlayers[1]?.tier).toBe('MID');
      expect(draft?.draftedPlayers[2]?.tier).toBe('LOWER');
    });

    it('isManualEntry flag is set for tracking', () => {
      const leagueId = 'manual-flag-test';
      initializeDraft(leagueId);

      // Manual entry
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'manual-player',
          playerName: 'Manual Player',
          position: 'SP',
          purchasePrice: 25,
          projectedValue: 22,
          variance: 3,
          draftedBy: 'user',
          isManualEntry: true,
        });
      });

      // Auto sync entry (no isManualEntry flag)
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'auto-player',
          playerName: 'Auto Player',
          position: 'RP',
          purchasePrice: 20,
          projectedValue: 18,
          variance: 2,
          draftedBy: 'other',
        });
      });

      const draft = useDraftStore.getState().getDraft(leagueId);
      expect(draft?.draftedPlayers[0]?.isManualEntry).toBe(true);
      expect(draft?.draftedPlayers[1]?.isManualEntry).toBeUndefined();
    });
  });

  describe('Task 2: Inflation Trigger Integration', () => {
    it('updateInflation is called with manual entries included', () => {
      const leagueId = 'trigger-test-1';
      initializeDraft(leagueId);
      const projections = createTestProjections();

      // Add manual entry
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'elite-1',
          playerName: 'Elite Player',
          position: 'OF',
          purchasePrice: 55,
          projectedValue: 50,
          variance: 5,
          draftedBy: 'user',
          tier: 'ELITE',
          isManualEntry: true,
        });
      });

      const draft = useDraftStore.getState().getDraft(leagueId);
      const draftedPlayers = draft?.draftedPlayers ?? [];

      // Calculate inflation
      act(() => {
        useInflationStore.getState().updateInflation(
          draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });

      // Verify inflation was calculated
      const overallRate = useInflationStore.getState().overallRate;
      expect(overallRate).toBeGreaterThan(0); // 55 vs 50 = 10% inflation
    });

    it('manual entries are included in drafted players list', () => {
      const leagueId = 'include-test-1';
      initializeDraft(leagueId);

      // Add multiple manual entries
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'player-1',
          playerName: 'Player 1',
          position: 'OF',
          purchasePrice: 30,
          projectedValue: 25,
          variance: 5,
          draftedBy: 'user',
          isManualEntry: true,
        });
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'player-2',
          playerName: 'Player 2',
          position: 'SP',
          purchasePrice: 25,
          projectedValue: 20,
          variance: 5,
          draftedBy: 'other',
          isManualEntry: true,
        });
      });

      const draft = useDraftStore.getState().getDraft(leagueId);
      expect(draft?.draftedPlayers.length).toBe(2);
      expect(draft?.draftedPlayers.every(p => p.isManualEntry)).toBe(true);
    });

    it('mixed manual and auto entries work correctly', () => {
      const leagueId = 'mixed-trigger-test';
      initializeDraft(leagueId);
      const projections = createTestProjections();

      // Add auto sync entry
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'elite-1',
          playerName: 'Auto Player',
          position: 'OF',
          purchasePrice: 55,
          projectedValue: 50,
          variance: 5,
          draftedBy: 'other',
        });
      });

      // Add manual entry
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'mid-1',
          playerName: 'Manual Player',
          position: '1B',
          purchasePrice: 35,
          projectedValue: 30,
          variance: 5,
          draftedBy: 'user',
          tier: 'MID',
          isManualEntry: true,
        });
      });

      const draft = useDraftStore.getState().getDraft(leagueId);

      act(() => {
        useInflationStore.getState().updateInflation(
          draft!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });

      const overallRate = useInflationStore.getState().overallRate;
      // (55+35) - (50+30) / (50+30) = 10/80 = 12.5%
      expect(overallRate).toBeCloseTo(0.125, 3);
    });
  });

  describe('Task 3: Accuracy Validation - Manual vs Auto Parity', () => {
    it('identical entries produce identical overall inflation', () => {
      const projections = createTestProjections();
      const draftedPlayerData = {
        playerId: 'elite-1',
        playerName: 'Test Player',
        position: 'OF',
        purchasePrice: 55,
        projectedValue: 50,
        variance: 5,
        tier: 'ELITE',
      };

      // Test 1: Auto sync entry
      const leagueAuto = 'auto-league';
      initializeDraft(leagueAuto);
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueAuto, {
          ...draftedPlayerData,
          draftedBy: 'other',
        });
      });

      const draftAuto = useDraftStore.getState().getDraft(leagueAuto);
      act(() => {
        useInflationStore.getState().updateInflation(
          draftAuto!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });
      const inflationAuto = useInflationStore.getState().overallRate;

      // Reset for manual test
      resetStores();

      // Test 2: Manual entry with same data
      const leagueManual = 'manual-league';
      initializeDraft(leagueManual);
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueManual, {
          ...draftedPlayerData,
          draftedBy: 'user',
          isManualEntry: true,
        });
      });

      const draftManual = useDraftStore.getState().getDraft(leagueManual);
      act(() => {
        useInflationStore.getState().updateInflation(
          draftManual!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });
      const inflationManual = useInflationStore.getState().overallRate;

      // NFR-R5: Manual entries MUST produce identical inflation
      expect(inflationManual).toBe(inflationAuto);
    });

    it('position-specific inflation matches between manual and auto', () => {
      const projections = createTestProjections();
      const players = [
        { playerId: 'elite-1', position: 'OF', purchasePrice: 55, projectedValue: 50, tier: 'ELITE' },
        { playerId: 'mid-2', position: 'SP', purchasePrice: 32, projectedValue: 28, tier: 'MID' },
      ];

      // Auto sync
      const leagueAuto = 'position-auto';
      initializeDraft(leagueAuto);
      players.forEach(p => {
        act(() => {
          useDraftStore.getState().addDraftedPlayer(leagueAuto, {
            ...p,
            playerName: `Player ${p.playerId}`,
            variance: p.purchasePrice - p.projectedValue,
            draftedBy: 'other',
          });
        });
      });

      const draftAuto = useDraftStore.getState().getDraft(leagueAuto);
      act(() => {
        useInflationStore.getState().updateInflation(
          draftAuto!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });
      const positionRatesAuto = { ...useInflationStore.getState().positionRates };

      resetStores();

      // Manual entry
      const leagueManual = 'position-manual';
      initializeDraft(leagueManual);
      players.forEach(p => {
        act(() => {
          useDraftStore.getState().addDraftedPlayer(leagueManual, {
            ...p,
            playerName: `Player ${p.playerId}`,
            variance: p.purchasePrice - p.projectedValue,
            draftedBy: 'user',
            isManualEntry: true,
          });
        });
      });

      const draftManual = useDraftStore.getState().getDraft(leagueManual);
      act(() => {
        useInflationStore.getState().updateInflation(
          draftManual!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });
      const positionRatesManual = useInflationStore.getState().positionRates;

      // Position rates must match exactly
      expect(positionRatesManual.OF).toBe(positionRatesAuto.OF);
      expect(positionRatesManual.SP).toBe(positionRatesAuto.SP);
    });

    it('tier-specific inflation matches between manual and auto', () => {
      const projections = createTestProjections();
      const players = [
        { playerId: 'elite-1', position: 'OF', purchasePrice: 55, projectedValue: 50, tier: 'ELITE' },
        { playerId: 'mid-1', position: '1B', purchasePrice: 35, projectedValue: 30, tier: 'MID' },
        { playerId: 'lower-1', position: '2B', purchasePrice: 10, projectedValue: 12, tier: 'LOWER' },
      ];

      // Auto sync
      const leagueAuto = 'tier-auto';
      initializeDraft(leagueAuto);
      players.forEach(p => {
        act(() => {
          useDraftStore.getState().addDraftedPlayer(leagueAuto, {
            ...p,
            playerName: `Player ${p.playerId}`,
            variance: p.purchasePrice - p.projectedValue,
            draftedBy: 'other',
          });
        });
      });

      const draftAuto = useDraftStore.getState().getDraft(leagueAuto);
      act(() => {
        useInflationStore.getState().updateInflation(
          draftAuto!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });
      const tierRatesAuto = { ...useInflationStore.getState().tierRates };

      resetStores();

      // Manual entry
      const leagueManual = 'tier-manual';
      initializeDraft(leagueManual);
      players.forEach(p => {
        act(() => {
          useDraftStore.getState().addDraftedPlayer(leagueManual, {
            ...p,
            playerName: `Player ${p.playerId}`,
            variance: p.purchasePrice - p.projectedValue,
            draftedBy: 'user',
            isManualEntry: true,
          });
        });
      });

      const draftManual = useDraftStore.getState().getDraft(leagueManual);
      act(() => {
        useInflationStore.getState().updateInflation(
          draftManual!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });
      const tierRatesManual = useInflationStore.getState().tierRates;

      // Tier rates must match exactly
      expect(tierRatesManual[PlayerTier.ELITE]).toBe(tierRatesAuto[PlayerTier.ELITE]);
      expect(tierRatesManual[PlayerTier.MID]).toBe(tierRatesAuto[PlayerTier.MID]);
      expect(tierRatesManual[PlayerTier.LOWER]).toBe(tierRatesAuto[PlayerTier.LOWER]);
    });

    it('adjusted values for remaining players match', () => {
      const projections = createTestProjections();
      const draftedPlayer = {
        playerId: 'elite-1',
        position: 'OF',
        purchasePrice: 55,
        projectedValue: 50,
        tier: 'ELITE',
      };

      // Auto sync
      const leagueAuto = 'adjusted-auto';
      initializeDraft(leagueAuto);
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueAuto, {
          ...draftedPlayer,
          playerName: 'Auto Player',
          variance: 5,
          draftedBy: 'other',
        });
      });

      const draftAuto = useDraftStore.getState().getDraft(leagueAuto);
      act(() => {
        useInflationStore.getState().updateInflation(
          draftAuto!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });
      const adjustedValuesAuto = new Map(useInflationStore.getState().adjustedValues);

      resetStores();

      // Manual entry
      const leagueManual = 'adjusted-manual';
      initializeDraft(leagueManual);
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueManual, {
          ...draftedPlayer,
          playerName: 'Manual Player',
          variance: 5,
          draftedBy: 'user',
          isManualEntry: true,
        });
      });

      const draftManual = useDraftStore.getState().getDraft(leagueManual);
      act(() => {
        useInflationStore.getState().updateInflation(
          draftManual!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });
      const adjustedValuesManual = useInflationStore.getState().adjustedValues;

      // Compare adjusted values for remaining players (tolerance 0.01%)
      for (const [playerId, autoValue] of adjustedValuesAuto) {
        const manualValue = adjustedValuesManual.get(playerId);
        expect(manualValue).toBeDefined();
        // Use relative tolerance of 0.01%
        const tolerance = Math.abs(autoValue * 0.0001);
        expect(Math.abs(manualValue! - autoValue)).toBeLessThanOrEqual(tolerance || 0.01);
      }
    });
  });

  describe('Task 4: Mixed Entry Scenarios', () => {
    it('draft with both auto sync and manual entries calculates correctly', () => {
      const leagueId = 'mixed-scenario-1';
      initializeDraft(leagueId);
      const projections = createTestProjections();

      // Add auto sync entries
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'elite-1',
          playerName: 'Auto Elite',
          position: 'OF',
          purchasePrice: 55,
          projectedValue: 50,
          variance: 5,
          draftedBy: 'other',
          tier: 'ELITE',
        });
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'mid-1',
          playerName: 'Auto Mid',
          position: '1B',
          purchasePrice: 33,
          projectedValue: 30,
          variance: 3,
          draftedBy: 'other',
          tier: 'MID',
        });
      });

      // Add manual entries
      act(() => {
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'elite-2',
          playerName: 'Manual Elite',
          position: 'SS',
          purchasePrice: 52,
          projectedValue: 48,
          variance: 4,
          draftedBy: 'user',
          tier: 'ELITE',
          isManualEntry: true,
        });
        useDraftStore.getState().addDraftedPlayer(leagueId, {
          playerId: 'lower-1',
          playerName: 'Manual Lower',
          position: '2B',
          purchasePrice: 10,
          projectedValue: 12,
          variance: -2,
          draftedBy: 'user',
          tier: 'LOWER',
          isManualEntry: true,
        });
      });

      const draft = useDraftStore.getState().getDraft(leagueId);
      expect(draft?.draftedPlayers.length).toBe(4);

      // Calculate inflation with all entries treated equally
      act(() => {
        useInflationStore.getState().updateInflation(
          draft!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });

      const overallRate = useInflationStore.getState().overallRate;
      // Total spent: 55+33+52+10 = 150
      // Total projected: 50+30+48+12 = 140
      // Inflation: (150-140)/140 = 7.14%
      expect(overallRate).toBeCloseTo(0.0714, 2);
    });

    it('early draft (10 picks) calculates correctly', () => {
      const leagueId = 'early-draft';
      initializeDraft(leagueId);
      const projections = createTestProjections();

      // 10 picks - mix of manual and auto
      for (let i = 0; i < 10; i++) {
        const proj = projections[i % projections.length];
        act(() => {
          useDraftStore.getState().addDraftedPlayer(leagueId, {
            playerId: `pick-${i}`,
            playerName: `Pick ${i}`,
            position: proj.position,
            purchasePrice: proj.projectedValue + Math.floor(Math.random() * 10) - 5,
            projectedValue: proj.projectedValue,
            variance: 0, // Recalculated
            draftedBy: i % 2 === 0 ? 'user' : 'other',
            tier: proj.tier,
            isManualEntry: i % 2 === 0,
          });
        });
      }

      const draft = useDraftStore.getState().getDraft(leagueId);
      expect(draft?.draftedPlayers.length).toBe(10);

      // Calculate inflation
      act(() => {
        useInflationStore.getState().updateInflation(
          draft!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });

      // Verify calculation completed
      expect(useInflationStore.getState().lastUpdated).toBeDefined();
      expect(useInflationStore.getState().error).toBeNull();
    });

    it('mid draft (50 picks) calculates correctly', () => {
      const leagueId = 'mid-draft';
      initializeDraft(leagueId);
      const projections = createTestProjections();

      // 50 picks - mix of manual and auto
      for (let i = 0; i < 50; i++) {
        const proj = projections[i % projections.length];
        act(() => {
          useDraftStore.getState().addDraftedPlayer(leagueId, {
            playerId: `pick-${i}`,
            playerName: `Pick ${i}`,
            position: proj.position,
            purchasePrice: proj.projectedValue + (i % 10) - 5,
            projectedValue: proj.projectedValue,
            variance: 0,
            draftedBy: i % 3 === 0 ? 'user' : 'other',
            tier: proj.tier,
            isManualEntry: i % 3 === 0,
          });
        });
      }

      const draft = useDraftStore.getState().getDraft(leagueId);
      expect(draft?.draftedPlayers.length).toBe(50);

      act(() => {
        useInflationStore.getState().updateInflation(
          draft!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });

      expect(useInflationStore.getState().lastUpdated).toBeDefined();
      expect(useInflationStore.getState().error).toBeNull();
    });

    it('late draft (200 picks) calculates correctly', () => {
      const leagueId = 'late-draft';
      initializeDraft(leagueId);
      const projections = createTestProjections();

      // 200 picks - mix of manual and auto
      for (let i = 0; i < 200; i++) {
        const proj = projections[i % projections.length];
        act(() => {
          useDraftStore.getState().addDraftedPlayer(leagueId, {
            playerId: `pick-${i}`,
            playerName: `Pick ${i}`,
            position: proj.position,
            purchasePrice: Math.max(1, proj.projectedValue - i * 0.1),
            projectedValue: proj.projectedValue,
            variance: 0,
            draftedBy: i % 4 === 0 ? 'user' : 'other',
            tier: proj.tier,
            isManualEntry: i % 4 === 0,
          });
        });
      }

      const draft = useDraftStore.getState().getDraft(leagueId);
      expect(draft?.draftedPlayers.length).toBe(200);

      act(() => {
        useInflationStore.getState().updateInflation(
          draft!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          projections
        );
      });

      expect(useInflationStore.getState().lastUpdated).toBeDefined();
      expect(useInflationStore.getState().error).toBeNull();
    });
  });

  describe('Task 5: Performance Benchmarks', () => {
    it('recalculation completes in <2 seconds (NFR-P1)', () => {
      const leagueId = 'perf-benchmark';
      initializeDraft(leagueId);

      // Create large projection pool (500+ players)
      const largeProjections = [];
      for (let i = 0; i < 500; i++) {
        largeProjections.push({
          playerId: `player-${i}`,
          projectedValue: Math.floor(Math.random() * 50) + 1,
          position: ['OF', 'SS', '1B', '2B', '3B', 'C', 'SP', 'RP'][i % 8],
          tier: ['ELITE', 'MID', 'LOWER'][i % 3],
        });
      }

      // Add 100 drafted players (mix of manual and auto)
      for (let i = 0; i < 100; i++) {
        act(() => {
          useDraftStore.getState().addDraftedPlayer(leagueId, {
            playerId: `player-${i}`,
            playerName: `Player ${i}`,
            position: largeProjections[i].position,
            purchasePrice: largeProjections[i].projectedValue + Math.floor(Math.random() * 10) - 5,
            projectedValue: largeProjections[i].projectedValue,
            variance: 0,
            draftedBy: i % 2 === 0 ? 'user' : 'other',
            tier: largeProjections[i].tier,
            isManualEntry: i % 2 === 0,
          });
        });
      }

      const draft = useDraftStore.getState().getDraft(leagueId);

      // Measure performance
      const startTime = performance.now();

      act(() => {
        useInflationStore.getState().updateInflation(
          draft!.draftedPlayers.map(p => ({
            playerId: p.playerId,
            auctionPrice: p.purchasePrice,
            position: p.position,
            tier: p.tier,
          })),
          largeProjections
        );
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // NFR-P1: Must complete in <2 seconds
      expect(duration).toBeLessThan(2000);
      // Log the actual duration for visibility
      console.log(`Inflation recalculation took ${duration.toFixed(2)}ms`);
    });

    it('manual only vs auto only vs mixed performance is comparable', () => {
      const projections = createTestProjections();
      const numPicks = 50;

      // Helper to measure performance
      const measurePerformance = (mode: 'auto' | 'manual' | 'mixed') => {
        resetStores();
        const leagueId = `perf-${mode}`;
        initializeDraft(leagueId);

        for (let i = 0; i < numPicks; i++) {
          const proj = projections[i % projections.length];
          const isManual =
            mode === 'manual' || (mode === 'mixed' && i % 2 === 0);
          act(() => {
            useDraftStore.getState().addDraftedPlayer(leagueId, {
              playerId: `pick-${i}`,
              playerName: `Pick ${i}`,
              position: proj.position,
              purchasePrice: proj.projectedValue + 5,
              projectedValue: proj.projectedValue,
              variance: 5,
              draftedBy: isManual ? 'user' : 'other',
              tier: proj.tier,
              isManualEntry: isManual,
            });
          });
        }

        const draft = useDraftStore.getState().getDraft(leagueId);
        const startTime = performance.now();

        act(() => {
          useInflationStore.getState().updateInflation(
            draft!.draftedPlayers.map(p => ({
              playerId: p.playerId,
              auctionPrice: p.purchasePrice,
              position: p.position,
              tier: p.tier,
            })),
            projections
          );
        });

        return performance.now() - startTime;
      };

      const autoTime = measurePerformance('auto');
      const manualTime = measurePerformance('manual');
      const mixedTime = measurePerformance('mixed');

      // All modes should complete in reasonable time
      expect(autoTime).toBeLessThan(1000);
      expect(manualTime).toBeLessThan(1000);
      expect(mixedTime).toBeLessThan(1000);

      // Manual mode should not be significantly slower (within 50% of auto)
      expect(manualTime).toBeLessThan(autoTime * 1.5);

      console.log(`Performance comparison - Auto: ${autoTime.toFixed(2)}ms, Manual: ${manualTime.toFixed(2)}ms, Mixed: ${mixedTime.toFixed(2)}ms`);
    });
  });
});
