/**
 * Users Table Schema Validation Tests
 *
 * These tests validate that the users table schema defined in
 * supabase/migrations/002_users_auth.sql is correctly represented
 * in the TypeScript types and mock data.
 *
 * Story: 2.1 - Create Users Table and Auth Schema
 */

import { describe, it, expect } from 'vitest';
import type { Database } from '../../src/types/database.types';
import { mockUser, mockAdminUser } from '../helpers/supabaseMock';

// Type aliases for clarity
type UsersTable = Database['public']['Tables']['users'];
type UserRow = UsersTable['Row'];
type UserInsert = UsersTable['Insert'];
type UserUpdate = UsersTable['Update'];

describe('Users Table Schema', () => {
  describe('Row type validation', () => {
    it('should have all required columns defined', () => {
      // This test validates the TypeScript types match the SQL schema
      const requiredColumns: (keyof UserRow)[] = [
        'id',
        'email',
        'display_name',
        'avatar_url',
        'onboarding_completed',
        'is_admin',
        'created_at',
        'updated_at',
      ];

      // Type-level check: if UserRow is missing any column, this would fail to compile
      const row: UserRow = {
        id: 'test-uuid',
        email: 'test@example.com',
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        onboarding_completed: false,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      requiredColumns.forEach(column => {
        expect(row).toHaveProperty(column);
      });
    });

    it('should have correct types for each column', () => {
      const row: UserRow = mockUser;

      // id: string (UUID)
      expect(typeof row.id).toBe('string');

      // email: string (NOT NULL)
      expect(typeof row.email).toBe('string');

      // display_name: string | null
      expect(row.display_name === null || typeof row.display_name === 'string').toBe(true);

      // avatar_url: string | null
      expect(row.avatar_url === null || typeof row.avatar_url === 'string').toBe(true);

      // is_admin: boolean
      expect(typeof row.is_admin).toBe('boolean');

      // created_at: string (TIMESTAMPTZ serialized)
      expect(typeof row.created_at).toBe('string');

      // updated_at: string (TIMESTAMPTZ serialized)
      expect(typeof row.updated_at).toBe('string');
    });

    it('should allow null for nullable columns', () => {
      const rowWithNulls: UserRow = {
        id: 'test-uuid',
        email: 'test@example.com',
        display_name: null, // nullable
        avatar_url: null, // nullable
        onboarding_completed: null, // nullable
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(rowWithNulls.display_name).toBeNull();
      expect(rowWithNulls.avatar_url).toBeNull();
      expect(rowWithNulls.onboarding_completed).toBeNull();
    });
  });

  describe('Insert type validation', () => {
    it('should require id and email for insert', () => {
      // Minimum required fields for insert
      const minimalInsert: UserInsert = {
        id: 'new-user-uuid',
        email: 'new@example.com',
      };

      expect(minimalInsert.id).toBeDefined();
      expect(minimalInsert.email).toBeDefined();
    });

    it('should allow optional fields to be omitted', () => {
      const insertWithOptionals: UserInsert = {
        id: 'new-user-uuid',
        email: 'new@example.com',
        display_name: 'New User',
        avatar_url: 'https://example.com/new-avatar.jpg',
        is_admin: false,
      };

      expect(insertWithOptionals.display_name).toBe('New User');
      expect(insertWithOptionals.is_admin).toBe(false);
    });

    it('should allow timestamps to be omitted (defaults in DB)', () => {
      const insertWithoutTimestamps: UserInsert = {
        id: 'new-user-uuid',
        email: 'new@example.com',
      };

      // created_at and updated_at should be optional (DB defaults to NOW())
      expect(insertWithoutTimestamps.created_at).toBeUndefined();
      expect(insertWithoutTimestamps.updated_at).toBeUndefined();
    });
  });

  describe('Update type validation', () => {
    it('should allow partial updates', () => {
      // Update should allow any subset of updatable fields
      const updateDisplayName: UserUpdate = {
        display_name: 'Updated Name',
      };

      const updateAvatar: UserUpdate = {
        avatar_url: 'https://example.com/new-avatar.jpg',
      };

      const updateMultiple: UserUpdate = {
        display_name: 'Updated Name',
        avatar_url: 'https://example.com/new-avatar.jpg',
        is_admin: true,
      };

      expect(updateDisplayName.display_name).toBe('Updated Name');
      expect(updateAvatar.avatar_url).toBeDefined();
      expect(updateMultiple.is_admin).toBe(true);
    });

    it('should not allow updating id (primary key)', () => {
      // TypeScript should prevent this - id is typed as 'never' in Update
      // This is a compile-time check, runtime test just documents the constraint
      const update: UserUpdate = {
        display_name: 'New Name',
      };

      // id should not be in the update object
      expect('id' in update && update.id !== undefined).toBe(false);
    });
  });

  describe('Mock data validation', () => {
    it('mockUser should match UserRow schema', () => {
      const user: UserRow = mockUser;

      expect(user.id).toBe('550e8400-e29b-41d4-a716-446655440000'); // Valid UUID
      expect(user.email).toBe('test@example.com');
      expect(user.display_name).toBe('Test User');
      expect(user.avatar_url).toBe('https://example.com/avatar.jpg');
      expect(user.is_admin).toBe(false);
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it('mockAdminUser should have is_admin set to true', () => {
      const admin: UserRow = mockAdminUser;

      expect(admin.is_admin).toBe(true);
      expect(admin.email).toBe('admin@example.com');
      expect(admin.display_name).toBe('Admin User');
    });

    it('mock users should have valid UUID format', () => {
      // UUID format: 8-4-4-4-12 hex characters
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(mockUser.id)).toBe(true);
      expect(uuidRegex.test(mockAdminUser.id)).toBe(true);
      expect(mockUser.id).not.toBe(mockAdminUser.id);
    });

    it('mock users should have valid email addresses', () => {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(mockUser.email)).toBe(true);
      expect(emailRegex.test(mockAdminUser.email)).toBe(true);
    });

    it('mock users should have valid ISO timestamps', () => {
      // Timestamps should be parseable as dates
      expect(() => new Date(mockUser.created_at)).not.toThrow();
      expect(() => new Date(mockUser.updated_at)).not.toThrow();

      const createdAt = new Date(mockUser.created_at);
      const updatedAt = new Date(mockUser.updated_at);

      expect(createdAt.getTime()).not.toBeNaN();
      expect(updatedAt.getTime()).not.toBeNaN();
    });
  });

  describe('RLS policy documentation (NOT integration tests - requires real Supabase)', () => {
    /**
     * DOCUMENTATION ONLY - These tests do NOT verify actual RLS enforcement.
     * They document the expected policy configuration from migration 002_users_auth.sql.
     *
     * To test actual RLS behavior, you need integration tests with a real Supabase
     * connection using authenticated user tokens.
     *
     * Policies from migration 002_users_auth.sql:
     * 1. "Users can view own profile" - SELECT where auth.uid() = id
     * 2. "Users can update own profile" - UPDATE where auth.uid() = id
     * 3. "Users can insert own profile" - INSERT where auth.uid() = id AND is_admin = false
     * 4. "Users can delete own profile" - DELETE where auth.uid() = id
     */

    it('[DOC] SELECT policy - users can only view their own row', () => {
      // RLS Policy: USING (auth.uid() = id)
      // This means: SELECT * FROM users WHERE id = <current_user_id>
      const policy = {
        name: 'Users can view own profile',
        operation: 'SELECT',
        using: 'auth.uid() = id',
      };

      expect(policy.operation).toBe('SELECT');
      expect(policy.using).toContain('auth.uid()');
    });

    it('[DOC] UPDATE policy - users can only update their own row', () => {
      // RLS Policy: USING (auth.uid() = id) WITH CHECK (auth.uid() = id)
      const policy = {
        name: 'Users can update own profile',
        operation: 'UPDATE',
        using: 'auth.uid() = id',
        withCheck: 'auth.uid() = id',
      };

      expect(policy.operation).toBe('UPDATE');
      expect(policy.using).toContain('auth.uid()');
      expect(policy.withCheck).toContain('auth.uid()');
    });

    it('[DOC] INSERT policy - users can only insert own row with is_admin=false', () => {
      // RLS Policy: WITH CHECK (auth.uid() = id AND is_admin = false)
      // Trigger inserts with SECURITY DEFINER to bypass this
      // The is_admin constraint prevents privilege escalation via direct INSERT
      const policy = {
        name: 'Users can insert own profile',
        operation: 'INSERT',
        withCheck: 'auth.uid() = id AND is_admin = false',
      };

      expect(policy.operation).toBe('INSERT');
      expect(policy.withCheck).toContain('auth.uid()');
      expect(policy.withCheck).toContain('is_admin = false');
    });

    it('[DOC] DELETE policy - users can delete their own row', () => {
      // RLS Policy: USING (auth.uid() = id)
      // Allows users to delete their own profile for account cleanup
      const policy = {
        name: 'Users can delete own profile',
        operation: 'DELETE',
        using: 'auth.uid() = id',
      };

      expect(policy.operation).toBe('DELETE');
      expect(policy.using).toContain('auth.uid()');
    });
  });

  describe('Trigger behavior documentation (NOT integration tests - requires real Supabase)', () => {
    /**
     * DOCUMENTATION ONLY - These tests do NOT verify actual trigger execution.
     * They document the expected trigger configuration from migration 002_users_auth.sql.
     *
     * To test actual trigger behavior, you need integration tests with a real Supabase
     * connection that creates auth users.
     *
     * Trigger from migration 002_users_auth.sql:
     * - on_auth_user_created: AFTER INSERT ON auth.users
     * - Calls handle_new_user() with SECURITY DEFINER
     * - Copies id and email from auth.users to users table
     * - Includes exception handling for edge cases
     */

    it('[DOC] auto-creation trigger configuration', () => {
      const trigger = {
        name: 'on_auth_user_created',
        event: 'AFTER INSERT',
        table: 'auth.users',
        function: 'handle_new_user',
        securityDefiner: true,
      };

      expect(trigger.event).toBe('AFTER INSERT');
      expect(trigger.table).toBe('auth.users');
      expect(trigger.securityDefiner).toBe(true);
    });

    it('[DOC] handle_new_user function behavior', () => {
      const functionBehavior = {
        name: 'handle_new_user',
        inserts: {
          id: 'NEW.id (from auth.users)',
          email: 'NEW.email (from auth.users)',
          display_name: "COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)",
        },
        securityDefiner: true,
        bypassesRLS: true,
        hasExceptionHandling: true,
      };

      expect(functionBehavior.inserts.id).toContain('NEW.id');
      expect(functionBehavior.inserts.email).toContain('NEW.email');
      expect(functionBehavior.bypassesRLS).toBe(true);
      expect(functionBehavior.hasExceptionHandling).toBe(true);
    });
  });
});

describe('Database Type Helpers', () => {
  /**
   * These tests validate that type helpers work at compile time.
   * Type exports don't exist at runtime, so we use type-level assertions.
   */

  it('should have Tables helper type that extracts Row types', () => {
    // This is a compile-time check - if it compiles, the helper works
    // Tables<'users'> should be equivalent to UserRow
    type UsersRowViaHelper = import('../../src/types/database.types').Tables<'users'>;

    // Validate at compile time by assigning mock data
    const user: UsersRowViaHelper = mockUser;
    expect(user.id).toBe(mockUser.id);
    expect(user.email).toBe(mockUser.email);
  });

  it('should have InsertTables helper type for insert operations', () => {
    // InsertTables<'users'> should be equivalent to UserInsert
    type UsersInsertViaHelper = import('../../src/types/database.types').InsertTables<'users'>;

    // Validate at compile time
    const insert: UsersInsertViaHelper = {
      id: 'new-id',
      email: 'new@example.com',
    };
    expect(insert.id).toBe('new-id');
  });

  it('should have UpdateTables helper type for update operations', () => {
    // UpdateTables<'users'> should be equivalent to UserUpdate
    type UsersUpdateViaHelper = import('../../src/types/database.types').UpdateTables<'users'>;

    // Validate at compile time
    const update: UsersUpdateViaHelper = {
      display_name: 'Updated Name',
    };
    expect(update.display_name).toBe('Updated Name');
  });
});
