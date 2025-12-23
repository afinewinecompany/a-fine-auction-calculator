/**
 * League Validation Tests
 *
 * Tests for Zod validation schema and helper functions.
 *
 * Story: 3.2 - Implement Create League Form
 */

import { describe, it, expect } from 'vitest';
import {
  leagueFormSchema,
  parseOptionalNumber,
  defaultLeagueFormValues,
} from '@/features/leagues/utils/leagueValidation';
import { LEAGUE_VALIDATION } from '@/features/leagues/types/league.types';

describe('leagueFormSchema', () => {
  describe('name field', () => {
    it('should accept valid league name', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'My League',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name over 100 characters', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'A'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from name', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: '  My League  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('My League');
      }
    });
  });

  describe('teamCount field', () => {
    it('should accept valid team count (12)', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        teamCount: 12,
      });
      expect(result.success).toBe(true);
    });

    it('should accept minimum team count (8)', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        teamCount: 8,
      });
      expect(result.success).toBe(true);
    });

    it('should accept maximum team count (20)', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        teamCount: 20,
      });
      expect(result.success).toBe(true);
    });

    it('should reject team count below 8', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        teamCount: 7,
      });
      expect(result.success).toBe(false);
    });

    it('should reject team count above 20', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        teamCount: 21,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer team count', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        teamCount: 12.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('budget field', () => {
    it('should accept valid budget (260)', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        budget: 260,
      });
      expect(result.success).toBe(true);
    });

    it('should accept minimum budget (100)', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        budget: 100,
      });
      expect(result.success).toBe(true);
    });

    it('should accept maximum budget (500)', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        budget: 500,
      });
      expect(result.success).toBe(true);
    });

    it('should reject budget below 100', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        budget: 99,
      });
      expect(result.success).toBe(false);
    });

    it('should reject budget above 500', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        budget: 501,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional roster fields', () => {
    it('should accept null roster spots', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        rosterSpotsHitters: null,
        rosterSpotsPitchers: null,
        rosterSpotsBench: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid roster spots', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        rosterSpotsHitters: 14,
        rosterSpotsPitchers: 9,
        rosterSpotsBench: 3,
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative roster spots', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        rosterSpotsHitters: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject hitter spots over 30', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        rosterSpotsHitters: 31,
      });
      expect(result.success).toBe(false);
    });

    it('should reject bench spots over 20', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        rosterSpotsBench: 21,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('scoringType field', () => {
    it('should accept null scoring type', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        scoringType: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept 5x5 scoring type', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        scoringType: '5x5',
      });
      expect(result.success).toBe(true);
    });

    it('should accept 6x6 scoring type', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        scoringType: '6x6',
      });
      expect(result.success).toBe(true);
    });

    it('should accept points scoring type', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        scoringType: 'points',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid scoring type', () => {
      const result = leagueFormSchema.safeParse({
        ...defaultLeagueFormValues,
        name: 'Test',
        scoringType: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('parseOptionalNumber', () => {
  it('should return null for empty string', () => {
    expect(parseOptionalNumber('')).toBeNull();
  });

  it('should return null for undefined', () => {
    expect(parseOptionalNumber(undefined)).toBeNull();
  });

  it('should return null for null', () => {
    expect(parseOptionalNumber(null)).toBeNull();
  });

  it('should parse valid string number', () => {
    expect(parseOptionalNumber('14')).toBe(14);
  });

  it('should return number as-is', () => {
    expect(parseOptionalNumber(9)).toBe(9);
  });

  it('should return null for invalid number string', () => {
    expect(parseOptionalNumber('abc')).toBeNull();
  });
});

describe('defaultLeagueFormValues', () => {
  it('should have correct default team count', () => {
    expect(defaultLeagueFormValues.teamCount).toBe(LEAGUE_VALIDATION.teamCount.default);
  });

  it('should have correct default budget', () => {
    expect(defaultLeagueFormValues.budget).toBe(LEAGUE_VALIDATION.budget.default);
  });

  it('should have empty name', () => {
    expect(defaultLeagueFormValues.name).toBe('');
  });

  it('should have null optional fields', () => {
    expect(defaultLeagueFormValues.rosterSpotsHitters).toBeNull();
    expect(defaultLeagueFormValues.rosterSpotsPitchers).toBeNull();
    expect(defaultLeagueFormValues.rosterSpotsBench).toBeNull();
    expect(defaultLeagueFormValues.scoringType).toBeNull();
  });
});
