/**
 * Sheet Validation Utilities Tests
 *
 * Story: 4.3 - Import Projections from Google Sheets
 */

import { describe, it, expect } from 'vitest';
import {
  isValidPosition,
  parsePositions,
  formatImportErrors,
  getSheetFormatHelp,
  VALID_POSITIONS,
  HITTER_STAT_FIELDS,
  PITCHER_STAT_FIELDS,
} from '@/features/projections/utils/sheetValidation';

describe('sheetValidation', () => {
  describe('isValidPosition', () => {
    it('returns true for valid positions', () => {
      expect(isValidPosition('C')).toBe(true);
      expect(isValidPosition('1B')).toBe(true);
      expect(isValidPosition('SS')).toBe(true);
      expect(isValidPosition('OF')).toBe(true);
      expect(isValidPosition('SP')).toBe(true);
      expect(isValidPosition('RP')).toBe(true);
      expect(isValidPosition('DH')).toBe(true);
    });

    it('returns true for valid positions regardless of case', () => {
      expect(isValidPosition('c')).toBe(true);
      expect(isValidPosition('sp')).toBe(true);
      expect(isValidPosition('Of')).toBe(true);
    });

    it('returns false for invalid positions', () => {
      expect(isValidPosition('XX')).toBe(false);
      expect(isValidPosition('INVALID')).toBe(false);
      expect(isValidPosition('')).toBe(false);
    });
  });

  describe('parsePositions', () => {
    it('parses comma-separated positions', () => {
      expect(parsePositions('OF,SS,2B')).toEqual(['OF', 'SS', '2B']);
    });

    it('parses slash-separated positions', () => {
      expect(parsePositions('SP/RP')).toEqual(['SP', 'RP']);
    });

    it('handles mixed separators', () => {
      expect(parsePositions('OF,SS/2B')).toEqual(['OF', 'SS', '2B']);
    });

    it('filters out invalid positions', () => {
      expect(parsePositions('OF,INVALID,SS')).toEqual(['OF', 'SS']);
    });

    it('trims whitespace', () => {
      expect(parsePositions(' OF , SS , 2B ')).toEqual(['OF', 'SS', '2B']);
    });

    it('returns empty array for empty string', () => {
      expect(parsePositions('')).toEqual([]);
    });

    it('returns empty array for all invalid positions', () => {
      expect(parsePositions('XX,YY,ZZ')).toEqual([]);
    });

    it('normalizes case to uppercase', () => {
      expect(parsePositions('of,sp,rp')).toEqual(['OF', 'SP', 'RP']);
    });
  });

  describe('formatImportErrors', () => {
    it('formats single error', () => {
      const errors = [{ row: 5, message: 'Missing player name' }];
      const result = formatImportErrors(errors);
      expect(result).toBe('Row 5: Missing player name');
    });

    it('formats multiple errors', () => {
      const errors = [
        { row: 2, message: 'Error 1' },
        { row: 5, message: 'Error 2' },
        { row: 10, message: 'Error 3' },
      ];
      const result = formatImportErrors(errors);
      expect(result).toContain('Row 2: Error 1');
      expect(result).toContain('Row 5: Error 2');
      expect(result).toContain('Row 10: Error 3');
    });

    it('limits displayed errors with summary', () => {
      const errors = Array.from({ length: 10 }, (_, i) => ({
        row: i + 1,
        message: `Error ${i + 1}`,
      }));
      const result = formatImportErrors(errors, 5);
      expect(result).toContain('Row 1: Error 1');
      expect(result).toContain('Row 5: Error 5');
      expect(result).toContain('...and 5 more errors');
      expect(result).not.toContain('Row 6');
    });

    it('returns empty string for no errors', () => {
      expect(formatImportErrors([])).toBe('');
    });

    it('respects custom maxDisplay parameter', () => {
      const errors = Array.from({ length: 5 }, (_, i) => ({
        row: i + 1,
        message: `Error ${i + 1}`,
      }));
      const result = formatImportErrors(errors, 2);
      expect(result).toContain('...and 3 more errors');
    });
  });

  describe('getSheetFormatHelp', () => {
    it('returns help text with required columns', () => {
      const help = getSheetFormatHelp();
      expect(help).toContain('Required columns');
      expect(help).toContain('Player Name');
    });

    it('returns help text with optional columns', () => {
      const help = getSheetFormatHelp();
      expect(help).toContain('Optional columns');
      expect(help).toContain('Team');
      expect(help).toContain('HR');
      expect(help).toContain('ERA');
    });

    it('includes valid positions', () => {
      const help = getSheetFormatHelp();
      expect(help).toContain('Position values');
      VALID_POSITIONS.forEach(pos => {
        expect(help).toContain(pos);
      });
    });
  });

  describe('constants', () => {
    it('exports all valid MLB positions', () => {
      expect(VALID_POSITIONS).toContain('C');
      expect(VALID_POSITIONS).toContain('1B');
      expect(VALID_POSITIONS).toContain('2B');
      expect(VALID_POSITIONS).toContain('3B');
      expect(VALID_POSITIONS).toContain('SS');
      expect(VALID_POSITIONS).toContain('OF');
      expect(VALID_POSITIONS).toContain('DH');
      expect(VALID_POSITIONS).toContain('SP');
      expect(VALID_POSITIONS).toContain('RP');
    });

    it('exports hitter stat fields', () => {
      expect(HITTER_STAT_FIELDS).toContain('hr');
      expect(HITTER_STAT_FIELDS).toContain('rbi');
      expect(HITTER_STAT_FIELDS).toContain('avg');
      expect(HITTER_STAT_FIELDS).toContain('obp');
    });

    it('exports pitcher stat fields', () => {
      expect(PITCHER_STAT_FIELDS).toContain('w');
      expect(PITCHER_STAT_FIELDS).toContain('era');
      expect(PITCHER_STAT_FIELDS).toContain('whip');
      expect(PITCHER_STAT_FIELDS).toContain('sv');
    });
  });
});
