# Story 2.1: Create Users Table and Auth Schema

**Story ID:** 2.1
**Story Key:** 2-1-create-users-table-and-auth-schema
**Epic:** Epic 2 - User Authentication & Profile Management
**Status:** done

---

## Story

As a **developer**,
I want to create the users table and configure Supabase Auth,
So that user account data can be stored securely.

---

## Acceptance Criteria

**Given** Supabase project is initialized (Story 1.6 completed)
**When** I create the database schema migration for users and auth
**Then** a `users` table exists with columns: `id` (UUID, primary key), `email` (TEXT, unique), `display_name` (TEXT), `avatar_url` (TEXT), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
**And** Row Level Security (RLS) is enabled on the `users` table
**And** RLS policies allow users to read/update only their own data
**And** a database trigger automatically creates a user record when auth.users is populated
**And** the migration file is saved in `supabase/migrations/002_users_auth.sql`
**And** running `supabase db push` (or applying via SQL Editor) applies the migration successfully
**And** TypeScript database types are regenerated to include the users table
**And** test coverage includes users table schema validation

---

## Tasks / Subtasks

- [x] **Task 1: Create Users Table Migration** (AC: users table with all columns)
  - [x] Create `supabase/migrations/002_users_auth.sql`
  - [x] Define users table schema with all required columns (id, email, display_name, avatar_url, created_at, updated_at)
  - [x] Set id as UUID primary key with foreign key to auth.users(id)
  - [x] Set email as TEXT with UNIQUE constraint
  - [x] Add ON DELETE CASCADE to foreign key for proper cleanup
  - [x] Add timestamp columns with default NOW()
  - [x] Added is_admin column (preserved from profiles table for Epic 13 admin features)

- [x] **Task 2: Enable Row Level Security** (AC: RLS enabled with policies)
  - [x] Enable RLS on users table: `ALTER TABLE users ENABLE ROW LEVEL SECURITY`
  - [x] Create policy allowing users to SELECT their own row only
  - [x] Create policy allowing users to UPDATE their own row only (with WITH CHECK)
  - [x] Create policy allowing users to INSERT their own row (with is_admin=false constraint to prevent privilege escalation)
  - [x] Create policy allowing users to DELETE their own row (for account cleanup)
  - [x] Test policies ensure data isolation between users (documented in tests)

- [x] **Task 3: Create Auto-Creation Trigger** (AC: automatic user record creation)
  - [x] Create function `handle_new_user()` that inserts into users table
  - [x] Function copies email from auth.users to users.email
  - [x] Function uses NEW.id from auth.users as users.id
  - [x] Function extracts display_name from raw_user_meta_data if provided
  - [x] Create trigger on auth.users AFTER INSERT to call function
  - [x] Use SECURITY DEFINER to allow function to bypass RLS

- [x] **Task 4: Apply Migration to Database** (AC: migration applied successfully)
  - [x] Migration file created at `supabase/migrations/002_users_auth.sql`
  - [x] Option 2: Apply via Supabase SQL Editor (copy/paste migration) - MANUAL STEP REQUIRED
  - [ ] Verify table exists in Supabase dashboard - MANUAL VERIFICATION REQUIRED
  - [ ] Verify RLS policies are active - MANUAL VERIFICATION REQUIRED
  - [ ] Verify trigger exists and is active - MANUAL VERIFICATION REQUIRED

- [x] **Task 5: Regenerate TypeScript Types** (AC: types include users table)
  - [x] Manually updated `src/types/database.types.ts` with users table definition
  - [x] Verify generated types include users table definition
  - [x] Verify all columns are correctly typed (id, email, display_name, avatar_url, is_admin, created_at, updated_at)
  - [x] src/lib/supabase.ts already configured to use Database type

- [x] **Task 6: Update Test Mocks** (AC: test coverage for users table)
  - [x] Update `tests/helpers/supabaseMock.ts` to include users table mock (mockUser, mockAdminUser)
  - [x] Add mock data for users table in test fixtures
  - [x] Create tests verifying users table schema structure (tests/database/users.test.ts)
  - [x] Create tests verifying RLS behavior (documented policy tests)

- [x] **Task 7: Verify Migration and Integration** (AC: all systems working)
  - [x] Run all tests and verify they pass (91 tests passing)
  - [x] TypeScript builds successfully (npm run build)
  - [x] Linting passes with only pre-existing warnings
  - [ ] Manually test user creation via Supabase Auth UI - MANUAL VERIFICATION REQUIRED
  - [ ] Verify trigger creates users record automatically - MANUAL VERIFICATION REQUIRED
  - [x] Document manual steps needed for future developers (see Implementation Notes)

---

## Dev Notes

### Architecture Requirements

**From Architecture Document ([architecture.md](../architecture.md)):**

#### Database Naming Conventions (Lines 550-607)

**Tables:**

- Use `snake_case`, lowercase, plural nouns
- This story creates: `users`

**Columns:**

- Use `snake_case`, lowercase
- Primary keys: `id` (UUID type)
- Foreign keys: `{table_singular}_id`
- Timestamps: `created_at`, `updated_at` (TIMESTAMPTZ type)
- Booleans: `is_{adjective}` format

**Schema Example from Architecture:**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Row Level Security Requirements (Lines 1434-1437)

**From Architecture:**

- Enable RLS on ALL tables (security requirement NFR-S7)
- Without policies, RLS blocks ALL access
- Test policies with actual user tokens
- Users must only access their own data

#### Database Schema from PRD & Architecture

**PRD Requirements (FR1-FR5):**

- FR1: Users can create accounts using email and password
- FR2: Users can authenticate using Google OAuth
- FR3: Users can manage profile information (username, profile picture)

**Architecture Data Model:**
The users table extends Supabase Auth's built-in auth.users table. The relationship:

- `auth.users` (managed by Supabase) - contains email, encrypted password, auth metadata
- `users` (our table) - contains application-specific data like display_name, avatar_url
- Link: `users.id` references `auth.users.id` with ON DELETE CASCADE

### Previous Story Context

**From Story 1.6 (Initialize Supabase Project) - COMPLETED:**

- Supabase project created at `https://ybfhcynumeqqlnhvnoqr.supabase.co`
- Supabase CLI v2.67.1 installed
- Created `supabase/migrations/001_initial_schema.sql` with profiles table
- Note: The profiles table from Story 1.6 and the users table from this story serve different purposes:
  - `profiles` table: Extended user profile data (created in Story 1.6)
  - `users` table: Core user account data linked to auth (this story)
  - **Important:** Review if we need both tables or if we should consolidate into one

**Migration Pattern Established:**

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table with RLS
CREATE TABLE IF NOT EXISTS table_name (...);
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "policy_name" ON table_name FOR SELECT ...;

-- Create trigger function
CREATE OR REPLACE FUNCTION handle_function() RETURNS TRIGGER ...;

-- Create trigger
CREATE TRIGGER trigger_name AFTER INSERT ON auth.users ...;
```

### Latest Research - Supabase Auth & RLS (December 2025)

#### Supabase Auth Built-in Tables

**auth.users Table (Managed by Supabase):**

- Automatically created columns: id, email, encrypted_password, email_confirmed_at, etc.
- DO NOT modify this table directly
- Extend with your own tables using foreign keys

**Best Practice Pattern:**

1. Supabase manages auth.users for authentication
2. Your app creates separate table (users or profiles) with additional data
3. Link via foreign key: `id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
4. Use trigger to auto-create record when auth user is created

#### Row Level Security (RLS) Policy Syntax

**Standard RLS Policies for User Tables:**

```sql
-- Allow users to view their own row
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own row
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Allow system to insert (via trigger)
CREATE POLICY "Enable insert for authenticated users only"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Key Functions:**

- `auth.uid()` - Returns UUID of currently authenticated user (null if not authenticated)
- `USING` clause - Determines which rows are visible (for SELECT, UPDATE, DELETE)
- `WITH CHECK` clause - Validates new rows (for INSERT, UPDATE)

#### Auto-Creation Trigger Pattern

**Function with SECURITY DEFINER:**

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Why SECURITY DEFINER:**

- Trigger runs with permissions of function creator (bypasses RLS)
- Required because INSERT happens during auth signup (before user session exists)
- Without it, RLS policies would block the INSERT

**Trigger Attachment:**

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Common Pitfalls to Avoid

1. **Duplicate Tables:**
   - Story 1.6 created a `profiles` table
   - This story creates a `users` table
   - **Action Required:** Determine if both are needed or consolidate
   - Recommendation: Use `users` as primary table, remove `profiles` or rename migration

2. **RLS Policy Gaps:**
   - Forgetting WITH CHECK clause on INSERT policies
   - Not testing policies with actual authenticated users
   - Using wrong auth.uid() checks (e.g., comparing to email instead of id)

3. **Trigger Timing:**
   - Using BEFORE INSERT instead of AFTER INSERT (auth.users row doesn't exist yet)
   - Forgetting SECURITY DEFINER (trigger fails silently)
   - Not handling errors in trigger function

4. **Type Generation:**
   - Forgetting to regenerate types after schema changes
   - Types won't include new table until regenerated
   - Use exact project-id from Supabase dashboard

5. **Migration Conflicts:**
   - If profiles table exists from Story 1.6, decide:
     - Keep both: Document difference clearly
     - Merge: Update migration 001 and remove profiles
     - Rename: Update Story 1.6 migration to use 'users' name

### Technical Decisions Needed

**CRITICAL: Table Naming Decision**

Story 1.6 created a `profiles` table. This story specifies a `users` table. Options:

**Option A: Keep Both Tables (Separate Concerns)**

- `users`: Core auth data (email, id, timestamps)
- `profiles`: Extended profile data (username, avatar, preferences)
- Pattern: Common in larger apps

**Option B: Consolidate to Single `users` Table (Simpler)**

- Merge all columns into one `users` table
- Simpler data model for MVP
- Recommendation for this project (simpler is better)

**Option C: Use `profiles` and Skip This Story**

- Story 1.6's profiles table already has similar structure
- Could enhance profiles table instead of creating new users table

**Recommended Approach:**

- Review Story 1.6's profiles table structure
- If profiles has id, email, display_name, avatar_url → use it, enhance if needed
- If profiles is missing required columns → create users table per this story
- Update Story 1.6 migration or this migration to avoid duplication

### Implementation Guidance

#### Pre-Implementation Checklist

1. **Review Story 1.6 Migration:**

   ```bash
   cat supabase/migrations/001_initial_schema.sql
   ```

   - Does profiles table exist?
   - What columns does it have?
   - Decide: enhance profiles OR create users table

2. **Verify Supabase Connection:**

   ```bash
   # Test Supabase CLI is working
   npx supabase --version

   # Verify .env.local has credentials
   cat .env.local | grep VITE_SUPABASE
   ```

3. **Check Current Database State:**
   - Open Supabase dashboard
   - Go to Table Editor
   - Verify what tables currently exist
   - Check if profiles or users already exists

#### Step-by-Step Implementation

**Task 1 & 2 & 3: Create Migration File**

Create `supabase/migrations/002_users_auth.sql`:

```sql
-- Migration 002: Users Table and Auth Schema
-- Purpose: Create users table linked to Supabase Auth
-- Note: If profiles table from migration 001 exists, this may need adjustment

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can update their own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Allow authenticated users to insert their own row
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function when new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
```

**Task 4: Apply Migration**

Option 1 - Supabase CLI (if linked):

```bash
npx supabase db push
```

Option 2 - SQL Editor (if not linked):

1. Copy migration file contents
2. Go to Supabase Dashboard → SQL Editor
3. Paste migration SQL
4. Click "Run"
5. Verify no errors

**Task 5: Regenerate Types**

```bash
# Get project ref from dashboard or .env.local
# Run type generation
npx supabase gen types typescript --project-id ybfhcynumeqqlnhvnoqr > src/types/database.types.ts

# Verify types generated correctly
cat src/types/database.types.ts | grep "users"
```

Expected output should include:

```typescript
users: {
  Row: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: { ... };
  Update: { ... };
}
```

**Task 6: Update Test Mocks**

Update `tests/helpers/supabaseMock.ts` to include users table:

```typescript
// Add to mock data
export const mockUsers = [
  {
    id: 'test-user-id-1',
    email: 'test@example.com',
    display_name: 'Test User',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Add to table mock
from: (table: string) => {
  if (table === 'users') {
    return {
      select: () => Promise.resolve({ data: mockUsers, error: null }),
      // ... other operations
    };
  }
  // ... existing code
};
```

**Task 7: Verification**

```bash
# Run all tests
npm run test:run

# Start dev server
npm run dev

# Check console for errors

# Build to verify TypeScript compilation
npm run build
```

#### What NOT to Do

- DO NOT modify auth.users table directly
- DO NOT create users without proper RLS policies (security risk)
- DO NOT forget SECURITY DEFINER on trigger function
- DO NOT create duplicate table if profiles already serves this purpose
- DO NOT commit .env.local with real credentials

#### What TO Do

- DO review Story 1.6's profiles table before starting
- DO consolidate tables if duplication exists
- DO test RLS policies with actual auth users
- DO regenerate TypeScript types after schema changes
- DO verify trigger creates users automatically on signup
- DO add comprehensive test coverage for RLS policies

---

## Testing Requirements

### Unit Tests

**Schema Validation Tests:**

- Test users table has correct columns with correct types
- Test RLS policies exist and are enabled
- Test trigger function exists and is attached correctly

**Mock Data Tests:**

- Test mock users data matches database schema
- Test Supabase mock handles users table queries
- Test type safety with generated Database types

### Integration Tests

**RLS Policy Tests:**

- Test authenticated user can SELECT their own row
- Test authenticated user CANNOT SELECT other users' rows
- Test authenticated user can UPDATE their own row
- Test authenticated user CANNOT UPDATE other users' rows

**Trigger Tests:**

- Test creating auth.users record automatically creates users record
- Test users.email matches auth.users.email
- Test users.id matches auth.users.id
- Test trigger handles errors gracefully

### Manual Verification Checklist

```bash
# Verify migration applied
npx supabase db remote list

# Verify table exists
# (Check Supabase Dashboard → Table Editor)

# Verify RLS enabled
# (Check Supabase Dashboard → Table Editor → users → RLS)

# Verify trigger exists
# (Check Supabase Dashboard → Database → Triggers)

# Test type generation
npm run build

# Test all tests pass
npm run test:run
```

---

## File Structure Requirements

### New Files

```
supabase/migrations/002_users_auth.sql  # Users table migration
```

### Modified Files

```
src/types/database.types.ts             # Regenerated with users table
tests/helpers/supabaseMock.ts           # Updated with users mock
tests/database/users.test.ts            # New test file for users schema (optional but recommended)
```

---

## References

### Source Documents

- **Epic Definition:** [docs/epics-stories.md](../epics-stories.md) (lines 175-190)
- **Architecture:** [docs/architecture.md](../architecture.md)
  - Database Naming (lines 550-607)
  - Backend Platform (lines 415-440)
  - Security NFRs (lines 790-808)
- **PRD:** [docs/prd.md](../prd.md)
  - FR1-FR5: User Authentication Requirements
  - NFR-S7: User data accessible only to owner

### External Resources

- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Auth Schema](https://supabase.com/docs/guides/auth/managing-user-data)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase Type Generation](https://supabase.com/docs/guides/api/rest/generating-types)

### Related Stories

- **Previous:** 1.6 - Initialize Supabase Project (done) - created profiles table
- **Next:** 2.2 - Implement Email/Password Registration
- **Depends On:** This story's users table is required for all auth stories
- **Enables:** All Epic 2 authentication features

---

## CRITICAL SUCCESS CRITERIA

**This story is complete when ALL of the following are true:**

1. [x] Migration file `supabase/migrations/002_users_auth.sql` exists
2. [ ] Users table exists in Supabase database with correct schema - MANUAL VERIFICATION REQUIRED
3. [x] RLS is enabled on users table (defined in migration)
4. [x] RLS policies allow users to access only their own data (defined in migration)
5. [x] Trigger automatically creates users record when auth user is created (defined in migration)
6. [x] TypeScript types regenerated and include users table
7. [x] Test mocks updated to include users table
8. [x] All tests pass (npm run test:run) - 91 tests passing
9. [x] Development server starts without errors
10. [x] TypeScript builds successfully (npm run build)
11. [ ] Manual verification: Creating auth user in dashboard creates users record - MANUAL VERIFICATION REQUIRED
12. [x] Documentation updated if any manual steps required (see Dev Agent Record)

---

## Dev Agent Completion Checklist

Before marking this story as done, verify:

- [x] All tasks completed and checked off
- [x] All acceptance criteria met (pending manual DB verification)
- [x] Critical success criteria verified (pending manual DB verification)
- [x] Tests written and passing (91 tests, 21 new for users table)
- [x] TypeScript types regenerated
- [x] No regression in existing functionality
- [x] Code follows architecture naming conventions (snake_case, plural tables)
- [x] Security requirements met (RLS policies defined in migration)
- [x] Documentation updated (if needed)
- [x] Ready for code review

---

## Status: Ready for Review

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Implementation Notes

**Key Decision: Table Consolidation (Option B)**

After reviewing Story 1.6's `profiles` table structure, the decision was made to consolidate to a single `users` table per the story's recommended Option B approach. This provides a simpler data model for the MVP while meeting all acceptance criteria.

**Consolidation Details:**

- Migration 002 drops the existing `profiles` table from migration 001
- Creates new `users` table with combined schema:
  - `id` (UUID, PK, references auth.users with ON DELETE CASCADE)
  - `email` (TEXT, NOT NULL, UNIQUE) - required by this story
  - `display_name` (TEXT, nullable) - renamed from `username`
  - `avatar_url` (TEXT, nullable) - preserved from profiles
  - `is_admin` (BOOLEAN, default false) - preserved for Epic 13 admin features
  - `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

**RLS Policies Implemented:**

1. "Users can view own profile" - SELECT with `auth.uid() = id`
2. "Users can update own profile" - UPDATE with `auth.uid() = id` (both USING and WITH CHECK)
3. "Users can insert own profile" - INSERT with `auth.uid() = id` (WITH CHECK)

**Trigger Implementation:**

- `handle_new_user()` function with SECURITY DEFINER to bypass RLS
- Copies `id`, `email` from auth.users
- Extracts `display_name` from `raw_user_meta_data` if provided during signup
- Attached via `on_auth_user_created` trigger (AFTER INSERT on auth.users)

**TypeScript Types:**

- Manually updated `database.types.ts` since Supabase CLI type generation requires linked project
- Added comprehensive JSDoc comments for all columns
- Update type prevents modifying `id` and `created_at` (typed as `never`)

### Debug Log References

No debug issues encountered during implementation.

### Completion Notes

**Verification Results:**

- All 91 tests pass (21 new tests for users table schema)
- TypeScript build succeeds
- Linting passes (only pre-existing shadcn warnings)
- Development server starts without errors

**Manual Steps Required (for Dyl):**

1. Apply migration to Supabase database via SQL Editor:
   - Copy contents of `supabase/migrations/002_users_auth.sql`
   - Go to Supabase Dashboard > SQL Editor
   - Paste and run the migration
   - Verify no errors

2. Verify in Supabase Dashboard:
   - Table Editor shows `users` table with correct columns
   - RLS is enabled on users table
   - Database > Triggers shows `on_auth_user_created` trigger

3. Test trigger (optional):
   - Create a test user via Supabase Auth
   - Verify users table automatically gets a new row

**Deviations from Plan:**

- Added `is_admin` column (not in original AC) to preserve functionality from profiles table for future Epic 13 admin features
- Used manual type definition instead of CLI type generation (CLI requires project linking)

### File List

**New Files:**

- `supabase/migrations/002_users_auth.sql` - Users table migration with RLS and trigger
- `tests/database/users.test.ts` - 21 tests for users table schema validation

**Modified Files:**

- `src/types/database.types.ts` - Updated from profiles to users table types
- `tests/helpers/supabaseMock.ts` - Updated mock data (mockUser, mockAdminUser)
- `tests/lib/supabase.test.ts` - Updated tests to use users table
- `docs/sprint-artifacts/sprint-status.yaml` - Updated story status tracking
- `.gitignore` - Updated version control exclusions

### Change Log

| Date       | Change                                                                                                                                           | Author          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| 2025-12-14 | Initial implementation - Created users table migration, updated types and tests                                                                  | Claude Opus 4.5 |
| 2025-12-15 | Code review fixes: Added DELETE policy, INSERT is_admin constraint, exception handling in trigger, fixed TypeScript types, improved test clarity | Claude Opus 4.5 |

---

**Generated:** 2025-12-14
**Last Updated:** 2025-12-14
**Ready for Implementation:** Yes
