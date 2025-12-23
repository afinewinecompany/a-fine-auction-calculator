/**
 * filterPlayers Utility Tests
 *
 * Tests for the player filtering logic.
 *
 * Story: 6.3 - Implement Instant Player Search
 */

import { filterPlayers } from '@/features/draft/utils/filterPlayers';
import type { Player } from '@/features/draft/types/player.types';

// Create a test player helper
function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: '1',
    name: 'Test Player',
    positions: ['OF'],
    team: 'TST',
    projectedValue: 30,
    adjustedValue: 32,
    tier: 'MID',
    status: 'available',
    ...overrides,
  };
}

// Test data
const testPlayers: Player[] = [
  createPlayer({ id: '1', name: 'Ronald Acuña Jr.' }),
  createPlayer({ id: '2', name: 'Shohei Ohtani' }),
  createPlayer({ id: '3', name: 'Mike Trout' }),
  createPlayer({ id: '4', name: 'Mookie Betts' }),
  createPlayer({ id: '5', name: 'Freddie Freeman' }),
  createPlayer({ id: '6', name: 'José Ramírez' }),
  createPlayer({ id: '7', name: 'Corey Seager' }),
  createPlayer({ id: '8', name: 'Trea Turner' }),
];

describe('filterPlayers', () => {
  describe('Empty Search', () => {
    it('returns all players when search is empty string', () => {
      const result = filterPlayers(testPlayers, '');
      expect(result).toHaveLength(testPlayers.length);
    });

    it('returns all players when search is whitespace', () => {
      const result = filterPlayers(testPlayers, '   ');
      expect(result).toHaveLength(testPlayers.length);
    });

    it('returns empty array when player list is empty', () => {
      const result = filterPlayers([], 'test');
      expect(result).toHaveLength(0);
    });
  });

  describe('Partial Matching', () => {
    it('matches beginning of name', () => {
      const result = filterPlayers(testPlayers, 'Ron');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Ronald Acuña Jr.');
    });

    it('matches middle of name', () => {
      const result = filterPlayers(testPlayers, 'oht');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Shohei Ohtani');
    });

    it('matches end of name', () => {
      const result = filterPlayers(testPlayers, 'Jr.');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Ronald Acuña Jr.');
    });

    it('matches single character', () => {
      const result = filterPlayers(testPlayers, 'r');
      // Ronald, Trout, Freddie, Turner, Corey, Ramirez
      expect(result.length).toBeGreaterThan(1);
    });
  });

  describe('Case Insensitivity', () => {
    it('matches lowercase search', () => {
      const result = filterPlayers(testPlayers, 'trout');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Mike Trout');
    });

    it('matches uppercase search', () => {
      const result = filterPlayers(testPlayers, 'TROUT');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Mike Trout');
    });

    it('matches mixed case search', () => {
      const result = filterPlayers(testPlayers, 'TrOuT');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Mike Trout');
    });
  });

  describe('Special Characters (Accents)', () => {
    it('matches accented name with unaccented search', () => {
      const result = filterPlayers(testPlayers, 'Acuna');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Ronald Acuña Jr.');
    });

    it('matches accented name with accented search', () => {
      const result = filterPlayers(testPlayers, 'Acuña');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Ronald Acuña Jr.');
    });

    it('matches name with tilde using plain character', () => {
      const result = filterPlayers(testPlayers, 'Ramirez');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('José Ramírez');
    });

    it('matches name with accent using plain character', () => {
      const result = filterPlayers(testPlayers, 'Jose');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('José Ramírez');
    });
  });

  describe('Multiple Results', () => {
    it('returns multiple matching players', () => {
      const result = filterPlayers(testPlayers, 'e');
      // Should match: Shohei, Mike, Mookie, Freddie, Jose, Corey, Seager, Trea
      expect(result.length).toBeGreaterThan(1);
    });

    it('returns players in original order', () => {
      const result = filterPlayers(testPlayers, 'e');
      // Verify order is preserved
      const originalIndices = result.map(p => testPlayers.findIndex(tp => tp.id === p.id));
      const isSorted = originalIndices.every((val, i, arr) => i === 0 || arr[i - 1] < val);
      expect(isSorted).toBe(true);
    });
  });

  describe('No Matches', () => {
    it('returns empty array when no matches found', () => {
      const result = filterPlayers(testPlayers, 'xyz123');
      expect(result).toHaveLength(0);
    });

    it('returns empty array for very long search string', () => {
      const result = filterPlayers(testPlayers, 'this is a very long search string that matches nothing');
      expect(result).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('handles large player lists efficiently', () => {
      // Create 2000 players
      const largePlayers = Array.from({ length: 2000 }, (_, i) =>
        createPlayer({ id: String(i), name: `Player ${i}` })
      );
      largePlayers.push(createPlayer({ id: '2001', name: 'Unique Target Name' }));

      const start = performance.now();
      const result = filterPlayers(largePlayers, 'Unique Target');
      const duration = performance.now() - start;

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Unique Target Name');
      // Should complete in less than 100ms per NFR-P6
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('handles search with leading spaces', () => {
      const result = filterPlayers(testPlayers, '  Trout');
      expect(result).toHaveLength(1);
    });

    it('handles search with trailing spaces', () => {
      const result = filterPlayers(testPlayers, 'Trout  ');
      expect(result).toHaveLength(1);
    });

    it('handles search with numbers', () => {
      const playersWithNumbers = [
        createPlayer({ id: '1', name: 'Player 1' }),
        createPlayer({ id: '2', name: 'Player 2' }),
      ];
      const result = filterPlayers(playersWithNumbers, '1');
      expect(result).toHaveLength(1);
    });
  });
});
