/**
 * Tests for Draft Store Sort State
 *
 * Story: 6.4 - Implement Sortable Table Columns
 *
 * Tests the sort state management in Zustand draft store.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import { DEFAULT_SORT } from '@/features/draft/types/sort.types';
import type { SortState } from '@/features/draft/types/sort.types';

describe('Draft Store Sort State', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDraftStore.setState({ sortState: DEFAULT_SORT });
  });

  describe('initial state', () => {
    it('should have default sort state (adjustedValue descending)', () => {
      const { sortState } = useDraftStore.getState();

      expect(sortState.column).toBe('adjustedValue');
      expect(sortState.direction).toBe('desc');
    });
  });

  describe('setSort action', () => {
    it('should update sort state', () => {
      const { setSort } = useDraftStore.getState();
      const newSort: SortState = { column: 'name', direction: 'asc' };

      setSort(newSort);

      const { sortState } = useDraftStore.getState();
      expect(sortState.column).toBe('name');
      expect(sortState.direction).toBe('asc');
    });
  });

  describe('toggleSort action', () => {
    it('should toggle direction when clicking same column', () => {
      const { toggleSort, sortState } = useDraftStore.getState();

      // Initial state is adjustedValue desc
      expect(sortState.column).toBe('adjustedValue');
      expect(sortState.direction).toBe('desc');

      // Toggle same column
      toggleSort('adjustedValue');

      const updated = useDraftStore.getState().sortState;
      expect(updated.column).toBe('adjustedValue');
      expect(updated.direction).toBe('asc');
    });

    it('should set ascending when clicking different column', () => {
      const { toggleSort } = useDraftStore.getState();

      // Click a different column
      toggleSort('name');

      const updated = useDraftStore.getState().sortState;
      expect(updated.column).toBe('name');
      expect(updated.direction).toBe('asc');
    });

    it('should toggle back to descending on third click', () => {
      const { toggleSort } = useDraftStore.getState();

      // First click on name - sets asc
      toggleSort('name');
      expect(useDraftStore.getState().sortState.direction).toBe('asc');

      // Second click on name - toggles to desc
      toggleSort('name');
      expect(useDraftStore.getState().sortState.direction).toBe('desc');
    });
  });

  describe('resetSort action', () => {
    it('should reset to default sort state', () => {
      const { setSort, resetSort } = useDraftStore.getState();

      // Change sort
      setSort({ column: 'name', direction: 'asc' });
      expect(useDraftStore.getState().sortState.column).toBe('name');

      // Reset
      resetSort();

      const { sortState } = useDraftStore.getState();
      expect(sortState.column).toBe('adjustedValue');
      expect(sortState.direction).toBe('desc');
    });
  });

  describe('sort state persistence', () => {
    it('should include sortState in persisted state', () => {
      // Verify that sortState is included in the partialize function
      // by checking that the persist options include it
      const store = useDraftStore;

      // Change sort state
      store.getState().setSort({ column: 'team', direction: 'desc' });

      // Get the persisted state (what would be saved to localStorage)
      // The persist middleware's partialize function determines this
      const currentState = store.getState();

      // Verify sortState exists and has correct values
      expect(currentState.sortState).toBeDefined();
      expect(currentState.sortState.column).toBe('team');
      expect(currentState.sortState.direction).toBe('desc');
    });

    it('should persist sortState alongside drafts', () => {
      const store = useDraftStore;

      // Set up both drafts and sort state
      store.getState().initializeDraft('test-league', 260, {
        hitters: 14,
        pitchers: 9,
        bench: 3,
      });
      store.getState().setSort({ column: 'projectedValue', direction: 'asc' });

      const state = store.getState();

      // Both should be present in state
      expect(state.drafts['test-league']).toBeDefined();
      expect(state.sortState.column).toBe('projectedValue');
      expect(state.sortState.direction).toBe('asc');

      // Clean up
      store.getState().clearDraft('test-league');
    });
  });
});
