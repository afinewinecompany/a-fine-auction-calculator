/**
 * Draft Hooks Tests
 *
 * Tests for draft state hooks.
 *
 * Story: 3.7 - Implement Resume Draft Functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHasDraftInProgress, useDraft, useDraftStore } from '@/features/draft';

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

describe('useHasDraftInProgress', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useDraftStore.setState({ drafts: {} });
  });

  it('returns false when no draft exists', () => {
    const { result } = renderHook(() => useHasDraftInProgress('league-1'));
    expect(result.current).toBe(false);
  });

  it('returns false when draft exists but no players drafted', () => {
    useDraftStore.getState().initializeDraft('league-1', 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const { result } = renderHook(() => useHasDraftInProgress('league-1'));
    expect(result.current).toBe(false);
  });

  it('returns true when draft has players', () => {
    useDraftStore.getState().initializeDraft('league-1', 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    useDraftStore.getState().addDraftedPlayer('league-1', {
      playerId: 'player-1',
      playerName: 'Test Player',
      position: 'OF',
      purchasePrice: 25,
      projectedValue: 20,
      variance: 5,
      draftedBy: 'user',
    });

    const { result } = renderHook(() => useHasDraftInProgress('league-1'));
    expect(result.current).toBe(true);
  });

  it('returns false when leagueId is undefined', () => {
    const { result } = renderHook(() => useHasDraftInProgress(undefined));
    expect(result.current).toBe(false);
  });

  it('updates when draft state changes', () => {
    const { result, rerender } = renderHook(() => useHasDraftInProgress('league-1'));

    expect(result.current).toBe(false);

    act(() => {
      useDraftStore.getState().initializeDraft('league-1', 260, {
        hitters: 14,
        pitchers: 9,
        bench: 3,
      });
      useDraftStore.getState().addDraftedPlayer('league-1', {
        playerId: 'player-1',
        playerName: 'Test Player',
        position: 'OF',
        purchasePrice: 25,
        projectedValue: 20,
        variance: 5,
        draftedBy: 'user',
      });
    });

    rerender();
    expect(result.current).toBe(true);
  });
});

describe('useDraft', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useDraftStore.setState({ drafts: {} });
  });

  it('returns undefined draft when none exists', () => {
    const { result } = renderHook(() => useDraft('league-1'));

    expect(result.current.draft).toBeUndefined();
    expect(result.current.hasDraft).toBe(false);
    expect(result.current.hasDraftInProgress).toBe(false);
  });

  it('returns draft state when it exists', () => {
    useDraftStore.getState().initializeDraft('league-1', 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const { result } = renderHook(() => useDraft('league-1'));

    expect(result.current.draft).toBeDefined();
    expect(result.current.hasDraft).toBe(true);
    expect(result.current.draft?.initialBudget).toBe(260);
  });

  it('provides initializeDraft action', () => {
    const { result } = renderHook(() => useDraft('league-1'));

    act(() => {
      result.current.initializeDraft(260, { hitters: 14, pitchers: 9, bench: 3 });
    });

    expect(result.current.draft).toBeDefined();
    expect(result.current.draft?.initialBudget).toBe(260);
  });

  it('provides updateBudget action', () => {
    useDraftStore.getState().initializeDraft('league-1', 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const { result } = renderHook(() => useDraft('league-1'));

    act(() => {
      result.current.updateBudget(235);
    });

    expect(result.current.draft?.remainingBudget).toBe(235);
  });

  it('provides addDraftedPlayer action', () => {
    useDraftStore.getState().initializeDraft('league-1', 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const { result } = renderHook(() => useDraft('league-1'));

    act(() => {
      result.current.addDraftedPlayer({
        playerId: 'player-1',
        playerName: 'Test Player',
        position: 'OF',
        purchasePrice: 25,
        projectedValue: 20,
        variance: 5,
        draftedBy: 'user',
      });
    });

    expect(result.current.draft?.draftedPlayers).toHaveLength(1);
    expect(result.current.hasDraftInProgress).toBe(true);
  });

  it('provides clearDraft action', () => {
    useDraftStore.getState().initializeDraft('league-1', 260, {
      hitters: 14,
      pitchers: 9,
      bench: 3,
    });

    const { result } = renderHook(() => useDraft('league-1'));

    expect(result.current.hasDraft).toBe(true);

    act(() => {
      result.current.clearDraft();
    });

    expect(result.current.draft).toBeUndefined();
    expect(result.current.hasDraft).toBe(false);
  });

  it('returns no-op functions when leagueId is undefined', () => {
    const { result } = renderHook(() => useDraft(undefined));

    // These should not throw
    expect(() => {
      act(() => {
        result.current.initializeDraft(260, { hitters: 14, pitchers: 9, bench: 3 });
        result.current.updateBudget(235);
        result.current.clearDraft();
      });
    }).not.toThrow();

    // Store should still be empty
    expect(Object.keys(useDraftStore.getState().drafts)).toHaveLength(0);
  });
});
