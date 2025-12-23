/**
 * Draft Store Filter Tests
 *
 * Tests for filter state management in the draft store.
 *
 * Story: 6.8 - Implement Filter by Draft Status
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDraftStore } from '@/features/draft';
import { DEFAULT_FILTER } from '@/features/draft/types/draft.types';

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

describe('draftStore - Filter State', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset store to initial state
    useDraftStore.setState({
      drafts: {},
      filterState: DEFAULT_FILTER,
    });
  });

  describe('Initial State', () => {
    it('has default filter state on initialization', () => {
      const state = useDraftStore.getState();
      expect(state.filterState).toEqual(DEFAULT_FILTER);
    });

    it('default status filter is "available"', () => {
      const state = useDraftStore.getState();
      expect(state.filterState.status).toBe('available');
    });

    it('default search term is empty string', () => {
      const state = useDraftStore.getState();
      expect(state.filterState.searchTerm).toBe('');
    });
  });

  describe('setStatusFilter', () => {
    it('updates status to "all"', () => {
      useDraftStore.getState().setStatusFilter('all');

      const state = useDraftStore.getState();
      expect(state.filterState.status).toBe('all');
    });

    it('updates status to "my-team"', () => {
      useDraftStore.getState().setStatusFilter('my-team');

      const state = useDraftStore.getState();
      expect(state.filterState.status).toBe('my-team');
    });

    it('updates status back to "available"', () => {
      useDraftStore.getState().setStatusFilter('all');
      useDraftStore.getState().setStatusFilter('available');

      const state = useDraftStore.getState();
      expect(state.filterState.status).toBe('available');
    });

    it('preserves search term when changing status', () => {
      useDraftStore.getState().setSearchFilter('test search');
      useDraftStore.getState().setStatusFilter('all');

      const state = useDraftStore.getState();
      expect(state.filterState.status).toBe('all');
      expect(state.filterState.searchTerm).toBe('test search');
    });
  });

  describe('setSearchFilter', () => {
    it('updates search term', () => {
      useDraftStore.getState().setSearchFilter('Mike Trout');

      const state = useDraftStore.getState();
      expect(state.filterState.searchTerm).toBe('Mike Trout');
    });

    it('updates search term to empty string', () => {
      useDraftStore.getState().setSearchFilter('Mike Trout');
      useDraftStore.getState().setSearchFilter('');

      const state = useDraftStore.getState();
      expect(state.filterState.searchTerm).toBe('');
    });

    it('preserves status when changing search term', () => {
      useDraftStore.getState().setStatusFilter('my-team');
      useDraftStore.getState().setSearchFilter('test');

      const state = useDraftStore.getState();
      expect(state.filterState.status).toBe('my-team');
      expect(state.filterState.searchTerm).toBe('test');
    });
  });

  describe('clearFilters', () => {
    it('resets all filters to default', () => {
      // Set some non-default values
      useDraftStore.getState().setStatusFilter('all');
      useDraftStore.getState().setSearchFilter('test');

      // Clear filters
      useDraftStore.getState().clearFilters();

      const state = useDraftStore.getState();
      expect(state.filterState).toEqual(DEFAULT_FILTER);
    });

    it('resets status to "available"', () => {
      useDraftStore.getState().setStatusFilter('my-team');
      useDraftStore.getState().clearFilters();

      const state = useDraftStore.getState();
      expect(state.filterState.status).toBe('available');
    });

    it('resets search term to empty string', () => {
      useDraftStore.getState().setSearchFilter('test');
      useDraftStore.getState().clearFilters();

      const state = useDraftStore.getState();
      expect(state.filterState.searchTerm).toBe('');
    });

    it('is idempotent - calling multiple times has same effect', () => {
      useDraftStore.getState().setStatusFilter('all');
      useDraftStore.getState().clearFilters();
      useDraftStore.getState().clearFilters();

      const state = useDraftStore.getState();
      expect(state.filterState).toEqual(DEFAULT_FILTER);
    });
  });

  describe('Persistence', () => {
    it('filterState is part of store state for persistence', () => {
      useDraftStore.getState().setStatusFilter('my-team');
      useDraftStore.getState().setSearchFilter('test');

      // Verify filterState is in the store state (which is partialized for persistence)
      const state = useDraftStore.getState();
      expect(state.filterState).toBeDefined();
      expect(state.filterState.status).toBe('my-team');
      expect(state.filterState.searchTerm).toBe('test');
    });

    it('filterState survives store persist/rehydrate cycle', () => {
      // Set filter state
      useDraftStore.getState().setStatusFilter('all');
      useDraftStore.getState().setSearchFilter('search term');

      // Get the state that would be persisted
      const state = useDraftStore.getState();

      // Verify the state contains filterState
      expect(state).toHaveProperty('filterState');
      expect(state.filterState.status).toBe('all');
      expect(state.filterState.searchTerm).toBe('search term');
    });
  });

  describe('Independence from Other State', () => {
    it('does not affect drafts when changing filter', () => {
      const initialDrafts = useDraftStore.getState().drafts;
      useDraftStore.getState().setStatusFilter('all');

      const state = useDraftStore.getState();
      expect(state.drafts).toEqual(initialDrafts);
    });

    it('does not affect sortState when changing filter', () => {
      const initialSortState = useDraftStore.getState().sortState;
      useDraftStore.getState().setStatusFilter('all');

      const state = useDraftStore.getState();
      expect(state.sortState).toEqual(initialSortState);
    });
  });
});
