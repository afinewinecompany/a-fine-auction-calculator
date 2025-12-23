/**
 * League Hooks Tests
 *
 * Tests for custom React hooks for league operations.
 *
 * Story: 3.2 - Implement Create League Form
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the league store
const mockFetchLeagues = vi.fn();
const mockFetchLeague = vi.fn();
const mockCreateLeague = vi.fn();
const mockUpdateLeague = vi.fn();
const mockDeleteLeague = vi.fn();
const mockClearError = vi.fn();

let mockIsLoading = false;
let mockIsCreating = false;
let mockIsUpdating = false;
let mockIsDeleting = false;
let mockError: string | null = null;
let mockLeagues: unknown[] = [];
let mockCurrentLeague: unknown = null;

vi.mock('@/features/leagues/stores/leagueStore', () => ({
  useLeagueStore: (selector: (state: unknown) => unknown) => {
    const state = {
      leagues: mockLeagues,
      currentLeague: mockCurrentLeague,
      isLoading: mockIsLoading,
      isCreating: mockIsCreating,
      isUpdating: mockIsUpdating,
      isDeleting: mockIsDeleting,
      error: mockError,
      fetchLeagues: mockFetchLeagues,
      fetchLeague: mockFetchLeague,
      createLeague: mockCreateLeague,
      updateLeague: mockUpdateLeague,
      deleteLeague: mockDeleteLeague,
      clearError: mockClearError,
    };
    return selector(state);
  },
}));

// Import hooks after mocking
import {
  useLeaguesList,
  useCreateLeague,
  useLeague,
  useUpdateLeague,
  useDeleteLeague,
} from '@/features/leagues/hooks/useLeagues';

// Wrapper component for hooks that use router
function wrapper({ children }: { children: ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('useLeaguesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
    mockLeagues = [];
  });

  it('should return leagues list', () => {
    mockLeagues = [
      { id: '1', name: 'League 1' },
      { id: '2', name: 'League 2' },
    ];

    const { result } = renderHook(() => useLeaguesList(), { wrapper });

    expect(result.current.leagues).toHaveLength(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should not call fetchLeagues on mount (component controls fetching)', () => {
    renderHook(() => useLeaguesList(), { wrapper });

    // Hook no longer auto-fetches - components control when to fetch
    expect(mockFetchLeagues).not.toHaveBeenCalled();
  });

  it('should provide refresh function', () => {
    const { result } = renderHook(() => useLeaguesList(), { wrapper });

    result.current.refresh();

    expect(mockFetchLeagues).toHaveBeenCalledTimes(1); // Only called when refresh is invoked
  });

  it('should provide clearError function', () => {
    const { result } = renderHook(() => useLeaguesList(), { wrapper });

    result.current.clearError();

    expect(mockClearError).toHaveBeenCalled();
  });
});

describe('useCreateLeague', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsCreating = false;
    mockError = null;
  });

  it('should return isCreating state', () => {
    mockIsCreating = true;

    const { result } = renderHook(() => useCreateLeague(), { wrapper });

    expect(result.current.isCreating).toBe(true);
  });

  it('should return error state', () => {
    mockError = 'Test error';

    const { result } = renderHook(() => useCreateLeague(), { wrapper });

    expect(result.current.error).toBe('Test error');
  });

  it('should call createLeague and navigate on success', async () => {
    const newLeague = { id: 'new-league-123', name: 'New League' };
    mockCreateLeague.mockResolvedValue(newLeague);

    const { result } = renderHook(() => useCreateLeague(), { wrapper });

    const formData = {
      name: 'New League',
      teamCount: 12,
      budget: 260,
      rosterSpotsHitters: null,
      rosterSpotsPitchers: null,
      rosterSpotsBench: null,
      scoringType: null,
    };

    await result.current.createLeague(formData);

    expect(mockCreateLeague).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/leagues/new-league-123');
    });
  });

  it('should redirect to list when redirectToList option is true', async () => {
    const newLeague = { id: 'new-league-123', name: 'New League' };
    mockCreateLeague.mockResolvedValue(newLeague);

    const { result } = renderHook(() => useCreateLeague(), { wrapper });

    const formData = {
      name: 'New League',
      teamCount: 12,
      budget: 260,
      rosterSpotsHitters: null,
      rosterSpotsPitchers: null,
      rosterSpotsBench: null,
      scoringType: null,
    };

    await result.current.createLeague(formData, { redirectToList: true });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/leagues');
    });
  });

  it('should not navigate when creation fails', async () => {
    mockCreateLeague.mockResolvedValue(null);

    const { result } = renderHook(() => useCreateLeague(), { wrapper });

    const formData = {
      name: 'New League',
      teamCount: 12,
      budget: 260,
      rosterSpotsHitters: null,
      rosterSpotsPitchers: null,
      rosterSpotsBench: null,
      scoringType: null,
    };

    await result.current.createLeague(formData);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('useLeague', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
    mockCurrentLeague = null;
  });

  it('should fetch league on mount when leagueId is provided', () => {
    renderHook(() => useLeague('league-123'), { wrapper });

    expect(mockFetchLeague).toHaveBeenCalledWith('league-123');
  });

  it('should not fetch league when leagueId is undefined', () => {
    renderHook(() => useLeague(undefined), { wrapper });

    expect(mockFetchLeague).not.toHaveBeenCalled();
  });

  it('should return current league', () => {
    mockCurrentLeague = { id: 'league-123', name: 'Test League' };

    const { result } = renderHook(() => useLeague('league-123'), { wrapper });

    expect(result.current.league).toEqual(mockCurrentLeague);
  });

  it('should return loading state', () => {
    mockIsLoading = true;

    const { result } = renderHook(() => useLeague('league-123'), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return error state', () => {
    mockError = 'League not found';

    const { result } = renderHook(() => useLeague('league-123'), { wrapper });

    expect(result.current.error).toBe('League not found');
  });
});

describe('useUpdateLeague', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsUpdating = false;
    mockError = null;
  });

  it('should return isUpdating state', () => {
    mockIsUpdating = true;

    const { result } = renderHook(() => useUpdateLeague(), { wrapper });

    expect(result.current.isUpdating).toBe(true);
  });

  it('should return updateLeague function', () => {
    const { result } = renderHook(() => useUpdateLeague(), { wrapper });

    expect(result.current.updateLeague).toBe(mockUpdateLeague);
  });

  it('should return error state', () => {
    mockError = 'Update failed';

    const { result } = renderHook(() => useUpdateLeague(), { wrapper });

    expect(result.current.error).toBe('Update failed');
  });

  it('should provide clearError function', () => {
    const { result } = renderHook(() => useUpdateLeague(), { wrapper });

    result.current.clearError();

    expect(mockClearError).toHaveBeenCalled();
  });
});

describe('useDeleteLeague', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDeleting = false;
    mockError = null;
  });

  it('should return isDeleting state', () => {
    mockIsDeleting = true;

    const { result } = renderHook(() => useDeleteLeague(), { wrapper });

    expect(result.current.isDeleting).toBe(true);
  });

  it('should call deleteLeague and navigate on success', async () => {
    mockDeleteLeague.mockResolvedValue(true);

    const { result } = renderHook(() => useDeleteLeague(), { wrapper });

    await result.current.deleteLeague('league-123');

    expect(mockDeleteLeague).toHaveBeenCalledWith('league-123');
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/leagues');
    });
  });

  it('should not navigate when redirectAfterDelete is false', async () => {
    mockDeleteLeague.mockResolvedValue(true);

    const { result } = renderHook(() => useDeleteLeague(), { wrapper });

    await result.current.deleteLeague('league-123', false);

    expect(mockDeleteLeague).toHaveBeenCalledWith('league-123');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should not navigate when deletion fails', async () => {
    mockDeleteLeague.mockResolvedValue(false);

    const { result } = renderHook(() => useDeleteLeague(), { wrapper });

    await result.current.deleteLeague('league-123');

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should return error state', () => {
    mockError = 'Delete failed';

    const { result } = renderHook(() => useDeleteLeague(), { wrapper });

    expect(result.current.error).toBe('Delete failed');
  });
});
