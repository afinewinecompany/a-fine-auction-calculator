/**
 * Profile Store Tests
 *
 * Tests for the Zustand profile store (state management and actions).
 *
 * Story: 2.6 - Implement Profile Management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock the Supabase client
vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
}));

// Import after mocking
import {
  useProfileStore,
  useProfile,
  useProfileLoading,
  useProfileUploading,
  useProfileSaving,
  useProfileError,
} from '@/features/profile/stores/profileStore';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// Mock profile data
const mockProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-06-15T10:30:00.000Z',
  updated_at: '2024-06-15T10:30:00.000Z',
};

// Create mock Supabase client
const createMockSupabase = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        maybeSingle: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn(() => ({
        data: { publicUrl: 'https://example.com/new-avatar.jpg' },
      })),
    })),
  },
});

describe('profileStore', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    // Reset store state before each test
    const { getState } = useProfileStore;
    act(() => {
      getState().reset();
    });

    // Create fresh mock
    mockSupabase = createMockSupabase();
    vi.mocked(getSupabase).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof getSupabase>
    );
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have null profile initially', () => {
      const { result } = renderHook(() => useProfile());
      expect(result.current).toBeNull();
    });

    it('should not be loading initially', () => {
      const { result } = renderHook(() => useProfileLoading());
      expect(result.current).toBe(false);
    });

    it('should not be uploading initially', () => {
      const { result } = renderHook(() => useProfileUploading());
      expect(result.current).toBe(false);
    });

    it('should not be saving initially', () => {
      const { result } = renderHook(() => useProfileSaving());
      expect(result.current).toBe(false);
    });

    it('should have no error initially', () => {
      const { result } = renderHook(() => useProfileError());
      expect(result.current).toBeNull();
    });
  });

  describe('fetchProfile action', () => {
    it('should fetch and set profile on success', async () => {
      // Setup mock to return profile (using maybeSingle)
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      mockSupabase.from = vi.fn(() => ({ select: mockSelect })) as typeof mockSupabase.from;

      const { result } = renderHook(() => useProfileStore());

      await act(async () => {
        await result.current.fetchProfile(mockProfile.id);
      });

      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set error on fetch failure', async () => {
      // Setup mock to return error (using maybeSingle)
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
      });
      const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      mockSupabase.from = vi.fn(() => ({ select: mockSelect })) as typeof mockSupabase.from;

      const { result } = renderHook(() => useProfileStore());

      await act(async () => {
        await result.current.fetchProfile(mockProfile.id);
      });

      expect(result.current.profile).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Profile not found');
    });

    it('should set isLoading during fetch', async () => {
      let resolvePromise: (value: unknown) => void;
      const fetchPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      const mockMaybeSingle = vi.fn(() => fetchPromise);
      const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      mockSupabase.from = vi.fn(() => ({ select: mockSelect })) as typeof mockSupabase.from;

      const { result } = renderHook(() => useProfileStore());

      // Start fetch (don't await)
      act(() => {
        result.current.fetchProfile(mockProfile.id);
      });

      // Check loading is true during operation
      expect(result.current.isLoading).toBe(true);

      // Complete the fetch
      await act(async () => {
        resolvePromise!({ data: mockProfile, error: null });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle Supabase not configured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const { result } = renderHook(() => useProfileStore());

      await act(async () => {
        await result.current.fetchProfile(mockProfile.id);
      });

      expect(result.current.error).toBe('Profile service is not configured');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('updateProfile action', () => {
    it('should update profile and return true on success', async () => {
      // Set initial profile
      const { result } = renderHook(() => useProfileStore());
      act(() => {
        result.current.setProfile(mockProfile);
      });

      // Setup mocks for update (using maybeSingle for refetch)
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { ...mockProfile, display_name: 'New Name' },
        error: null,
      });
      const mockSelectEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'users') {
          return { update: mockUpdate, select: mockSelect };
        }
        return { update: mockUpdate, select: mockSelect };
      }) as typeof mockSupabase.from;

      let success: boolean = false;
      await act(async () => {
        success = await result.current.updateProfile(mockProfile.id, { display_name: 'New Name' });
      });

      expect(success).toBe(true);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should rollback optimistic update on failure', async () => {
      const { result } = renderHook(() => useProfileStore());

      // Set initial profile
      act(() => {
        result.current.setProfile(mockProfile);
      });

      // Setup mock to fail
      const mockUpdateEq = vi.fn().mockResolvedValue({
        error: { message: 'Update failed' },
      });
      const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
      mockSupabase.from = vi.fn(() => ({ update: mockUpdate })) as typeof mockSupabase.from;

      let success: boolean = true;
      await act(async () => {
        success = await result.current.updateProfile(mockProfile.id, { display_name: 'New Name' });
      });

      expect(success).toBe(false);
      expect(result.current.profile?.display_name).toBe(mockProfile.display_name);
      expect(result.current.error).toBeTruthy();
    });

    it('should trim display name before update', async () => {
      const { result } = renderHook(() => useProfileStore());
      act(() => {
        result.current.setProfile(mockProfile);
      });

      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const mockSelectEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));

      mockSupabase.from = vi.fn(() => ({
        update: mockUpdate,
        select: mockSelect,
      })) as typeof mockSupabase.from;

      await act(async () => {
        await result.current.updateProfile(mockProfile.id, { display_name: '  Trimmed Name  ' });
      });

      // Check that update was called with trimmed name
      expect(mockUpdate).toHaveBeenCalledWith({ display_name: 'Trimmed Name' });
    });
  });

  describe('uploadAvatar action', () => {
    it('should upload avatar and update profile on success', async () => {
      const { result } = renderHook(() => useProfileStore());
      act(() => {
        result.current.setProfile(mockProfile);
      });

      // Setup storage mock
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      const mockRemove = vi.fn().mockResolvedValue({ error: null });
      const mockGetPublicUrl = vi.fn(() => ({
        data: { publicUrl: 'https://example.com/new-avatar.jpg' },
      }));

      mockSupabase.storage.from = vi.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
      }));

      // Setup profile update mock (using maybeSingle for refetch)
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { ...mockProfile, avatar_url: 'https://example.com/new-avatar.jpg' },
        error: null,
      });
      const mockSelectEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));

      mockSupabase.from = vi.fn(() => ({
        update: mockUpdate,
        select: mockSelect,
      })) as typeof mockSupabase.from;

      // Create test file
      const testFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });

      let uploadResult: { url: string; path: string } | null = null;
      await act(async () => {
        uploadResult = await result.current.uploadAvatar(mockProfile.id, testFile);
      });

      expect(uploadResult).not.toBeNull();
      expect(uploadResult?.url).toBe('https://example.com/new-avatar.jpg');
      expect(result.current.isUploading).toBe(false);
    });

    it('should set error on upload failure', async () => {
      const { result } = renderHook(() => useProfileStore());
      act(() => {
        result.current.setProfile(mockProfile);
      });

      // Setup storage mock to fail
      const mockUpload = vi.fn().mockResolvedValue({
        error: { message: 'Upload failed' },
      });

      mockSupabase.storage.from = vi.fn(() => ({
        upload: mockUpload,
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      }));

      const testFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });

      let uploadResult: unknown = {};
      await act(async () => {
        uploadResult = await result.current.uploadAvatar(mockProfile.id, testFile);
      });

      expect(uploadResult).toBeNull();
      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('clearError action', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useProfileStore());

      // Set an error
      act(() => {
        useProfileStore.setState({ error: 'Test error' });
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset action', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useProfileStore());

      // Set some state
      act(() => {
        result.current.setProfile(mockProfile);
        useProfileStore.setState({ error: 'Test error', isLoading: true });
      });

      expect(result.current.profile).toBeDefined();
      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.profile).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('setProfile action', () => {
    it('should set profile directly', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
      });

      expect(result.current.profile).toEqual(mockProfile);
    });

    it('should allow setting profile to null', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
      });

      expect(result.current.profile).toBeDefined();

      act(() => {
        result.current.setProfile(null);
      });

      expect(result.current.profile).toBeNull();
    });
  });
});
