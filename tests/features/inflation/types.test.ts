import { describe, it, expect } from 'vitest';
import {
  isPosition,
  isPlayerTier,
  createDefaultPositionRates,
  createDefaultTierRates,
  createDefaultInflationState,
  PlayerTier,
  POSITIONS,
  PLAYER_TIERS,
  type Position,
  type PositionInflationRate,
  type TierInflationRate,
  type InflationState,
} from '@/features/inflation';

describe('Inflation Types', () => {
  describe('Position type and constants', () => {
    it('should have all 9 baseball positions defined', () => {
      expect(POSITIONS).toHaveLength(9);
      expect(POSITIONS).toContain('C');
      expect(POSITIONS).toContain('1B');
      expect(POSITIONS).toContain('2B');
      expect(POSITIONS).toContain('SS');
      expect(POSITIONS).toContain('3B');
      expect(POSITIONS).toContain('OF');
      expect(POSITIONS).toContain('SP');
      expect(POSITIONS).toContain('RP');
      expect(POSITIONS).toContain('UT');
    });
  });

  describe('PlayerTier enum', () => {
    it('should have ELITE, MID, and LOWER tiers', () => {
      expect(PlayerTier.ELITE).toBe('ELITE');
      expect(PlayerTier.MID).toBe('MID');
      expect(PlayerTier.LOWER).toBe('LOWER');
    });

    it('should have 3 tiers in PLAYER_TIERS array', () => {
      expect(PLAYER_TIERS).toHaveLength(3);
      expect(PLAYER_TIERS).toContain(PlayerTier.ELITE);
      expect(PLAYER_TIERS).toContain(PlayerTier.MID);
      expect(PLAYER_TIERS).toContain(PlayerTier.LOWER);
    });
  });

  describe('isPosition type guard', () => {
    it('should return true for valid positions', () => {
      expect(isPosition('C')).toBe(true);
      expect(isPosition('1B')).toBe(true);
      expect(isPosition('2B')).toBe(true);
      expect(isPosition('SS')).toBe(true);
      expect(isPosition('3B')).toBe(true);
      expect(isPosition('OF')).toBe(true);
      expect(isPosition('SP')).toBe(true);
      expect(isPosition('RP')).toBe(true);
      expect(isPosition('UT')).toBe(true);
    });

    it('should return false for invalid positions', () => {
      expect(isPosition('DH')).toBe(false);
      expect(isPosition('LF')).toBe(false);
      expect(isPosition('CF')).toBe(false);
      expect(isPosition('RF')).toBe(false);
      expect(isPosition('')).toBe(false);
      expect(isPosition('invalid')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isPosition(null)).toBe(false);
      expect(isPosition(undefined)).toBe(false);
      expect(isPosition(123)).toBe(false);
      expect(isPosition({})).toBe(false);
      expect(isPosition([])).toBe(false);
    });

    it('should narrow type correctly', () => {
      const value: unknown = 'SS';
      if (isPosition(value)) {
        // TypeScript should narrow this to Position
        const position: Position = value;
        expect(position).toBe('SS');
      }
    });
  });

  describe('isPlayerTier type guard', () => {
    it('should return true for valid player tiers', () => {
      expect(isPlayerTier('ELITE')).toBe(true);
      expect(isPlayerTier('MID')).toBe(true);
      expect(isPlayerTier('LOWER')).toBe(true);
      expect(isPlayerTier(PlayerTier.ELITE)).toBe(true);
      expect(isPlayerTier(PlayerTier.MID)).toBe(true);
      expect(isPlayerTier(PlayerTier.LOWER)).toBe(true);
    });

    it('should return false for invalid player tiers', () => {
      expect(isPlayerTier('HIGH')).toBe(false);
      expect(isPlayerTier('LOW')).toBe(false);
      expect(isPlayerTier('elite')).toBe(false); // case sensitive
      expect(isPlayerTier('')).toBe(false);
      expect(isPlayerTier('invalid')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isPlayerTier(null)).toBe(false);
      expect(isPlayerTier(undefined)).toBe(false);
      expect(isPlayerTier(1)).toBe(false);
      expect(isPlayerTier({})).toBe(false);
      expect(isPlayerTier([])).toBe(false);
    });

    it('should narrow type correctly', () => {
      const value: unknown = 'ELITE';
      if (isPlayerTier(value)) {
        // TypeScript should narrow this to PlayerTier
        const tier: PlayerTier = value;
        expect(tier).toBe(PlayerTier.ELITE);
      }
    });
  });

  describe('createDefaultPositionRates', () => {
    it('should create rates for all positions initialized to 0', () => {
      const rates = createDefaultPositionRates();

      expect(rates.C).toBe(0);
      expect(rates['1B']).toBe(0);
      expect(rates['2B']).toBe(0);
      expect(rates.SS).toBe(0);
      expect(rates['3B']).toBe(0);
      expect(rates.OF).toBe(0);
      expect(rates.SP).toBe(0);
      expect(rates.RP).toBe(0);
      expect(rates.UT).toBe(0);
    });

    it('should have exactly 9 position keys', () => {
      const rates = createDefaultPositionRates();
      expect(Object.keys(rates)).toHaveLength(9);
    });

    it('should be typed as PositionInflationRate', () => {
      const rates: PositionInflationRate = createDefaultPositionRates();
      // Type check - if this compiles, the type is correct
      expect(rates).toBeDefined();
    });
  });

  describe('createDefaultTierRates', () => {
    it('should create rates for all tiers initialized to 0', () => {
      const rates = createDefaultTierRates();

      expect(rates[PlayerTier.ELITE]).toBe(0);
      expect(rates[PlayerTier.MID]).toBe(0);
      expect(rates[PlayerTier.LOWER]).toBe(0);
    });

    it('should have exactly 3 tier keys', () => {
      const rates = createDefaultTierRates();
      expect(Object.keys(rates)).toHaveLength(3);
    });

    it('should be typed as TierInflationRate', () => {
      const rates: TierInflationRate = createDefaultTierRates();
      // Type check - if this compiles, the type is correct
      expect(rates).toBeDefined();
    });
  });

  describe('createDefaultInflationState', () => {
    it('should create initial state with provided player count', () => {
      const state = createDefaultInflationState(300);

      expect(state.overallRate).toBe(0);
      expect(state.budgetDepleted).toBe(0);
      expect(state.playersRemaining).toBe(300);
    });

    it('should initialize positionRates to defaults', () => {
      const state = createDefaultInflationState(100);

      POSITIONS.forEach((position) => {
        expect(state.positionRates[position]).toBe(0);
      });
    });

    it('should initialize tierRates to defaults', () => {
      const state = createDefaultInflationState(100);

      PLAYER_TIERS.forEach((tier) => {
        expect(state.tierRates[tier]).toBe(0);
      });
    });

    it('should be typed as InflationState', () => {
      const state: InflationState = createDefaultInflationState(100);
      // Type check - if this compiles, the type is correct
      expect(state).toBeDefined();
    });

    it('should handle zero players', () => {
      const state = createDefaultInflationState(0);
      expect(state.playersRemaining).toBe(0);
    });
  });
});
