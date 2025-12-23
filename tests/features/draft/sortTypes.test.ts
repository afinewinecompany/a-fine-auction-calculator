/**
 * Tests for Sort Types
 *
 * Story: 6.4 - Implement Sortable Table Columns
 *
 * Tests type definitions for sort state management.
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SORT,
  type SortColumn,
  type SortDirection,
  type SortState,
} from '@/features/draft/types/sort.types';

describe('Sort Types', () => {
  describe('DEFAULT_SORT', () => {
    it('should default to adjustedValue descending', () => {
      expect(DEFAULT_SORT.column).toBe('adjustedValue');
      expect(DEFAULT_SORT.direction).toBe('desc');
    });
  });

  describe('SortColumn', () => {
    it('should allow valid column values', () => {
      const columns: SortColumn[] = [
        'name',
        'positions',
        'team',
        'projectedValue',
        'adjustedValue',
        'tier',
        'status',
      ];

      expect(columns).toHaveLength(7);
    });
  });

  describe('SortDirection', () => {
    it('should allow asc and desc values', () => {
      const directions: SortDirection[] = ['asc', 'desc'];

      expect(directions).toContain('asc');
      expect(directions).toContain('desc');
    });
  });

  describe('SortState', () => {
    it('should have column and direction properties', () => {
      const sortState: SortState = {
        column: 'adjustedValue',
        direction: 'desc',
      };

      expect(sortState.column).toBe('adjustedValue');
      expect(sortState.direction).toBe('desc');
    });

    it('should support all column types', () => {
      const columns: SortColumn[] = [
        'name',
        'positions',
        'team',
        'projectedValue',
        'adjustedValue',
        'tier',
        'status',
      ];

      columns.forEach(column => {
        const sortState: SortState = {
          column,
          direction: 'asc',
        };
        expect(sortState.column).toBe(column);
      });
    });
  });
});
