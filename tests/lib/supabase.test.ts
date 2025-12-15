import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, mockProfile, createMockUser, createMockSession } from '../helpers/supabaseMock';

describe('Supabase Mock', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
  });

  describe('Database operations', () => {
    it('should return empty data for unknown tables', async () => {
      const result = await mockSupabase.from('unknown_table').select('*');
      expect(result).toEqual({ data: [], error: null });
    });

    it('should provide chainable query methods', () => {
      const query = mockSupabase.from('profiles');
      expect(query.select).toBeDefined();
      expect(query.eq).toBeDefined();
      expect(query.order).toBeDefined();
    });

    it('should allow method chaining', () => {
      const chain = mockSupabase
        .from('profiles')
        .select('*')
        .eq('id', 'test-id')
        .order('created_at')
        .limit(10);

      expect(chain).toBeDefined();
    });
  });

  describe('Auth operations', () => {
    it('should mock signInWithPassword', async () => {
      const result = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.error).toBeNull();
    });

    it('should mock signUp', async () => {
      const result = await mockSupabase.auth.signUp({
        email: 'new@example.com',
        password: 'password123',
      });
      expect(result.error).toBeNull();
    });

    it('should mock signOut', async () => {
      const result = await mockSupabase.auth.signOut();
      expect(result.error).toBeNull();
    });

    it('should mock getSession', async () => {
      const result = await mockSupabase.auth.getSession();
      expect(result.data.session).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should mock getUser', async () => {
      const result = await mockSupabase.auth.getUser();
      expect(result.data.user).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should mock onAuthStateChange', () => {
      const callback = vi.fn();
      const result = mockSupabase.auth.onAuthStateChange(callback);
      expect(result.data.subscription.unsubscribe).toBeDefined();
    });
  });

  describe('Mock helpers', () => {
    it('should export mockProfile with correct structure', () => {
      expect(mockProfile).toHaveProperty('id');
      expect(mockProfile).toHaveProperty('username');
      expect(mockProfile).toHaveProperty('avatar_url');
      expect(mockProfile).toHaveProperty('is_admin');
      expect(mockProfile).toHaveProperty('created_at');
      expect(mockProfile).toHaveProperty('updated_at');
    });

    it('should create mock user with defaults', () => {
      const user = createMockUser();
      expect(user.id).toBe('test-user-id-123');
      expect(user.email).toBe('test@example.com');
      expect(user.aud).toBe('authenticated');
    });

    it('should create mock user with overrides', () => {
      const user = createMockUser({ id: 'custom-id', email: 'custom@example.com' });
      expect(user.id).toBe('custom-id');
      expect(user.email).toBe('custom@example.com');
    });

    it('should create mock session with user', () => {
      const session = createMockSession();
      expect(session.access_token).toBe('mock-access-token');
      expect(session.refresh_token).toBe('mock-refresh-token');
      expect(session.user).toBeDefined();
      expect(session.user.id).toBe('test-user-id-123');
    });
  });

  describe('Storage operations', () => {
    it('should mock upload', async () => {
      const result = await mockSupabase.storage.from('avatars').upload('test.jpg', new Blob());
      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('path');
    });

    it('should mock getPublicUrl', () => {
      const result = mockSupabase.storage.from('avatars').getPublicUrl('test.jpg');
      expect(result.data.publicUrl).toBe('https://example.com/file.jpg');
    });
  });

  describe('Realtime subscriptions', () => {
    it('should mock channel subscription', () => {
      const channel = mockSupabase
        .channel('test-channel')
        .on('postgres_changes', { event: '*', schema: 'public' }, vi.fn())
        .subscribe();

      expect(channel).toBeDefined();
      expect(channel.unsubscribe).toBeDefined();
    });
  });
});

describe('Supabase Client Configuration', () => {
  it('should export supabase client from lib', async () => {
    // Dynamic import to check export structure
    const supabaseModule = await import('../../src/lib/supabase');
    // supabase can be null if env vars not set, but export should exist
    expect('supabase' in supabaseModule).toBe(true);
    expect(supabaseModule.Database).toBeUndefined(); // Type exports don't exist at runtime
  });

  it('should export helper functions', async () => {
    const supabaseModule = await import('../../src/lib/supabase');
    expect(supabaseModule.getSupabase).toBeDefined();
    expect(supabaseModule.isSupabaseConfigured).toBeDefined();
    expect(typeof supabaseModule.isSupabaseConfigured).toBe('function');
  });

  it('should return boolean from isSupabaseConfigured', async () => {
    const { isSupabaseConfigured } = await import('../../src/lib/supabase');
    const result = isSupabaseConfigured();
    expect(typeof result).toBe('boolean');
  });
});

describe('Supabase Health Check', () => {
  it('should verify Supabase connection is configured (integration)', async () => {
    const { supabase, isSupabaseConfigured } = await import('../../src/lib/supabase');

    // This test verifies the configuration is valid
    // In CI/test environments without real credentials, this checks graceful handling
    if (isSupabaseConfigured() && supabase) {
      // Real connection test - verify we can reach Supabase
      // This just checks the client was created, not that auth works
      expect(supabase.auth).toBeDefined();
      expect(supabase.from).toBeDefined();

      // Optional: Uncomment to test actual connection (requires real credentials)
      // const { error } = await supabase.from('profiles').select('count').limit(0);
      // expect(error).toBeNull();
    } else {
      // Graceful handling when not configured
      expect(supabase).toBeNull();
      console.log('[Test] Supabase not configured - skipping connection test');
    }
  });

  it('should throw helpful error when getSupabase called without config', async () => {
    // This test is environment-dependent
    // If env vars are set, getSupabase works; if not, it throws
    const { getSupabase, isSupabaseConfigured } = await import('../../src/lib/supabase');

    if (!isSupabaseConfigured()) {
      expect(() => getSupabase()).toThrow('Supabase client not initialized');
    } else {
      expect(() => getSupabase()).not.toThrow();
    }
  });
});
