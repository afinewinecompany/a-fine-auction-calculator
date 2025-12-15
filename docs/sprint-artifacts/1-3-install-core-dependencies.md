# Story 1.3: Install Core Dependencies

**Story ID:** 1.3
**Story Key:** 1-3-install-core-dependencies
**Epic:** Epic 1 - Project Foundation & Setup
**Status:** done

---

## Story

As a **developer**,
I want to install and configure the core architectural dependencies (Zustand, React Router, React Hook Form, date-fns, Supabase client),
So that the foundational libraries are available for feature implementation with correct versions and configurations.

---

## Acceptance Criteria

**Given** the Vite + React + TypeScript project is initialized (Story 1.1) and shadcn/ui is configured (Story 1.2)
**When** I install the core dependencies specified in the architecture document
**Then** all dependencies are installed with correct versions matching the architecture
**And** the bundle size remains under 500KB gzipped (NFR-P10 requirement)
**And** all TypeScript types are configured correctly with no type errors
**And** basic configuration files are created for each library
**And** dependency compatibility is verified (no version conflicts)

---

## Tasks / Subtasks

- [x] **Task 1: Install State Management (Zustand)** (AC: Zustand v5.0.9+ installed)
  - [x] Run: `npm install zustand` - Installed v5.0.9
  - [x] Verify version 5.x in `package.json` - ✓ zustand@5.0.9
  - [x] TypeScript types included and working

- [x] **Task 2: Install Client-Side Routing (React Router)** (AC: React Router v7.x installed)
  - [x] Run: `npm install react-router-dom` - Installed v7.10.1
  - [x] Verify version 7.x in `package.json` - ✓ react-router-dom@7.10.1
  - [x] TypeScript types are built-in for v7

- [x] **Task 3: Install Form Handling (React Hook Form)** (AC: React Hook Form v7.x installed)
  - [x] Already installed from existing project - v7.68.0
  - [x] Upgraded from v7.55.0 to v7.68.0
  - [x] TypeScript types work correctly

- [x] **Task 4: Install Date/Time Handling (date-fns)** (AC: date-fns v4.x installed)
  - [x] Run: `npm install date-fns` - Installed v4.1.0
  - [x] Verify version 4.x in `package.json` - ✓ date-fns@4.1.0
  - [x] Time zone support available (v4 feature)

- [x] **Task 5: Install Backend Client (Supabase)** (AC: Supabase client installed)
  - [x] Run: `npm install @supabase/supabase-js` - Installed v2.87.1
  - [x] Create `src/lib/supabase.ts` with placeholder configuration
  - [x] Create `.env.example` with Supabase variable names
  - [x] Actual credentials to be configured in Story 1.6

- [x] **Task 6: Verify Bundle Size** (AC: Bundle size under 500KB)
  - [x] Run: `npx vite build` - Build successful
  - [x] JS Bundle: 284.70 KB → 79.85 KB gzipped
  - [x] CSS Bundle: 66.54 KB → 10.00 KB gzipped
  - [x] **Total gzipped: ~90 KB** - Well under 500KB limit ✓

- [x] **Task 7: Verify TypeScript Configuration** (AC: No new TypeScript errors)
  - [x] Created `src/vite-env.d.ts` for Vite environment types
  - [x] No new TypeScript errors from dependencies
  - [x] Pre-existing TS errors from Story 1.2 documented and acceptable

- [x] **Task 8: Create Library Configuration Files**
  - [x] Created `src/lib/supabase.ts` - Supabase client initialization (placeholder)
  - [x] Created `src/vite-env.d.ts` - Vite environment type definitions
  - [x] Created `.env.example` with Supabase variable names

- [x] **Task 9: Update Documentation**
  - [x] Document installed dependencies and versions in completion notes
  - [x] Document environment variable requirements in `.env.example`
  - [x] Document bundle size impact

---

## Dev Notes

### Architecture Requirements

**From Architecture Document ([architecture.md](../architecture.md)):**

#### Mandatory Library Versions

1. **Zustand v5.x** (State Management)
   - Minimal bundle footprint (~1KB)
   - TypeScript support
   - Persist middleware for draft state recovery
   - References:
     - [Zustand npm](https://www.npmjs.com/package/zustand)
     - [Zustand Documentation](https://zustand.docs.pmnd.rs/)

2. **React Router v7.x** (Client-Side Routing)
   - Industry standard routing
   - TypeScript support with type-safe routing
   - Code splitting and lazy loading support
   - References:
     - [React Router Documentation](https://reactrouter.com/)
     - [react-router-dom npm](https://www.npmjs.com/package/react-router-dom)

3. **React Hook Form v7.x** (Form Handling)
   - Minimal re-renders (performance optimized)
   - Excellent TypeScript and shadcn/ui integration
   - Small bundle size (~9KB)
   - References:
     - [React Hook Form Documentation](https://react-hook-form.com/)
     - [React Hook Form npm](https://www.npmjs.com/package/react-hook-form)

4. **date-fns v4.x** (Date/Time Handling)
   - Modular imports enable tree-shaking (~2KB typical usage)
   - First-class time zone support in v4.0
   - Excellent TypeScript support with branded types
   - References:
     - [date-fns npm](https://www.npmjs.com/package/date-fns)
     - [date-fns v4.0 with Time Zone Support](https://blog.date-fns.org/v40-with-time-zone-support/)

5. **@supabase/supabase-js v2.x** (Backend Client)
   - PostgreSQL database access
   - Built-in authentication
   - Edge Functions for API proxying
   - References:
     - [Supabase Official Documentation](https://supabase.com/docs)

#### Bundle Budget Allocation (Target: <500KB gzipped)

From Architecture Document lines 528-536:
- React + ReactDOM: ~45KB
- React Router: ~10KB
- Zustand: ~1KB
- React Hook Form: ~9KB
- date-fns (modular): ~2-5KB
- shadcn/ui components (48 est.): ~100-150KB
- Supabase client: ~50KB
- Application code: ~150-200KB
- **Estimated Total: ~367-470KB** (comfortable margin)

### Performance Requirements

- **NFR-P10:** JavaScript bundle must remain under 500KB gzipped
- **NFR-P1:** Must support <2 second inflation recalculation (client-side)
- Efficient state updates critical for real-time UI

### Implementation Patterns

**From Architecture Document: Zustand Store Structure**

```typescript
// Example Zustand store pattern
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExampleState {
  value: string | null;
  isLoading: boolean;
  error: string | null;
  setValue: (value: string) => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set) => ({
      value: null,
      isLoading: false,
      error: null,
      setValue: (value) => set({ value }),
      reset: () => set({ value: null })
    }),
    {
      name: 'example-storage',
      partialize: (state) => ({ value: state.value })
    }
  )
);
```

**From Architecture Document: React Router Pattern**

```typescript
// Example React Router configuration
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/leagues',
    element: <ProtectedRoute><LeagueList /></ProtectedRoute>
  }
]);
```

**Supabase Client Configuration**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Placeholder - actual credentials configured in Story 1.6
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Latest Technical Research (December 2025)

### Zustand v5.x
- Latest stable version with full TypeScript support
- React 18+ and React 19 compatible
- Persist middleware included
- ~1KB bundle size

### React Router v7.x
- Latest stable version (v7 released 2024)
- Built-in TypeScript types (no @types package needed)
- Type-safe routing with full TypeScript inference
- React 19 compatible
- Lazy loading and code splitting support

### React Hook Form v7.x
- Latest stable v7 release
- Full React 19 compatibility
- Excellent shadcn/ui integration
- TypeScript first-class support
- ~9KB bundle size

### date-fns v4.x
- Latest stable v4 release
- **NEW in v4.0:** First-class time zone support
- Modular tree-shakeable imports
- TypeScript branded types
- ~2-5KB typical usage after tree-shaking

### Supabase JS Client v2.x
- Latest stable v2 client
- Full TypeScript support
- PostgreSQL + Auth + Edge Functions
- ~50KB bundle size

### Common Pitfalls to Avoid

1. **Version Mismatches:**
   - Use latest stable versions
   - Check React 19 compatibility for all libraries

2. **Bundle Size Issues:**
   - DO use modular imports for date-fns: `import { format } from 'date-fns'`
   - DO NOT import entire library: `import * as dateFns from 'date-fns'`
   - DO verify bundle size after installation

3. **TypeScript Configuration:**
   - DO ensure tsconfig.json has `strict: true`
   - DO verify all library types are recognized

4. **Supabase Credentials:**
   - DO NOT commit real Supabase credentials yet (Story 1.6)
   - DO use placeholder values for now
   - DO create `.env.example` with variable names

---

## Testing Requirements

### Verification Tests for This Story

1. **Installation Verification:**
   - All dependencies appear in `package.json` with correct versions
   - `node_modules` contains all libraries
   - Zero npm install warnings or peer dependency conflicts (or documented)

2. **TypeScript Verification:**
   - Run `npx tsc --noEmit` - no new errors from dependencies
   - All library types recognized by TypeScript
   - IntelliSense works for all libraries

3. **Bundle Size Verification:**
   - Build succeeds: `npm run build`
   - Total gzipped bundle size < 500KB
   - Document bundle size in completion notes

4. **Basic Functionality Tests:**
   - Import Zustand - verify types work
   - Import React Router - verify types work
   - Import React Hook Form - verify types work
   - Format date with date-fns - verify output
   - Import Supabase client - verify no errors

### Full Testing Coverage (Story 1.4)
Comprehensive test framework configuration happens in **Story 1.4**. This story only requires basic smoke tests to verify installations.

---

## File Structure Requirements

After completing this story, the following files MUST be created or updated:

### Updated Files

**package.json** - Add dependencies:
```json
{
  "dependencies": {
    "zustand": "^5.x.x",
    "react-router-dom": "^7.x.x",
    "react-hook-form": "^7.x.x",
    "date-fns": "^4.x.x",
    "@supabase/supabase-js": "^2.x.x"
  }
}
```

### New Files to Create

**src/lib/supabase.ts** - Supabase client initialization:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**.env.example** - Environment variable template:
```
# Supabase Configuration (to be filled in Story 1.6)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Dev Agent Record

### Context Reference

**Previous Story:** 1-2-configure-shadcn-ui-design-system (done)
- Configured Tailwind CSS v4.1.18
- Configured shadcn/ui with dark slate theme
- 48+ UI components available
- Path aliases working (@/)

**Current Story:** 1-3-install-core-dependencies
**Next Story:** 1-4-configure-testing-framework

### Implementation Guidance

#### Step-by-Step Implementation

1. **Pre-flight Check:**
   - Verify Stories 1.1 and 1.2 are completed (both marked done)
   - Verify project builds successfully: `npm run build`
   - Document current bundle size before adding dependencies

2. **Install Dependencies:**
   ```bash
   # State Management
   npm install zustand

   # Client-Side Routing
   npm install react-router-dom

   # Form Handling
   npm install react-hook-form

   # Date/Time Handling
   npm install date-fns

   # Backend Client
   npm install @supabase/supabase-js
   ```

   Or all at once:
   ```bash
   npm install zustand react-router-dom react-hook-form date-fns @supabase/supabase-js
   ```

3. **Verify Installations:**
   - Check `package.json` for all 5 dependencies
   - Run `npm list zustand react-router-dom react-hook-form date-fns @supabase/supabase-js`
   - Document exact versions installed

4. **Create Library Configuration Files:**
   - Create `src/lib/supabase.ts` with placeholder configuration
   - Create `.env.example` with Supabase variable names

5. **Build and Verify Bundle Size:**
   ```bash
   npm run build
   ```
   - Navigate to `dist/assets/`
   - Check `.js` file sizes
   - Verify total gzipped size < 500KB
   - Document bundle size in completion notes

6. **Verify TypeScript:**
   ```bash
   npx tsc --noEmit
   ```
   - No new TypeScript errors from dependencies
   - Pre-existing errors from Story 1.2 are acceptable

7. **Update Documentation:**
   - Document installed versions in completion notes
   - Document bundle size before and after

#### What NOT to Do
- ❌ DO NOT install different major versions than architecture specifies
- ❌ DO NOT commit real Supabase credentials (use placeholders)
- ❌ DO NOT implement full features yet (just library setup)
- ❌ DO NOT configure full routing yet (that's in feature stories)
- ❌ DO NOT create Zustand stores for features yet (that's in feature stories)

#### What TO Do
- ✅ Install latest stable versions within major version constraints
- ✅ Create placeholder configuration files
- ✅ Verify TypeScript types work for all libraries
- ✅ Verify bundle size stays under 500KB
- ✅ Create `.env.example` with variable names only
- ✅ Document actual bundle size impact
- ✅ Use `--legacy-peer-deps` if needed (as done in Story 1.1)

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References
- PostCSS configuration required update for Tailwind CSS v4 compatibility
- Renamed `postcss.config.js` to `postcss.config.cjs` for ESM compatibility
- Installed `@tailwindcss/postcss` plugin required by Tailwind CSS v4
- Created `src/vite-env.d.ts` for Vite environment variable types

### Completion Notes

**Implementation Summary:**
Successfully installed all 5 core architectural dependencies with correct versions. Fixed build configuration issues related to Tailwind CSS v4 PostCSS plugin.

**Installed Versions:**
| Dependency | Version | Status |
|------------|---------|--------|
| zustand | 5.0.9 | ✓ Matches architecture |
| react-router-dom | 7.10.1 | ✓ Matches architecture |
| react-hook-form | 7.68.0 | ✓ Matches architecture (upgraded from 7.55.0) |
| date-fns | 4.1.0 | ✓ Matches architecture |
| @supabase/supabase-js | 2.87.1 | ✓ Matches architecture |

**Bundle Size Analysis:**
- **Before dependencies:** Not measured (build was failing due to pre-existing issues)
- **After dependencies:**
  - JS Bundle: 284.70 KB → **79.85 KB gzipped**
  - CSS Bundle: 66.54 KB → **10.00 KB gzipped**
  - **Total: ~90 KB gzipped** (well under 500KB NFR-P10 requirement)

**Issues Encountered & Resolutions:**
1. **PostCSS ESM Error:** `postcss.config.js` using CommonJS in ESM project
   - Resolution: Renamed to `postcss.config.cjs`
2. **Tailwind CSS v4 PostCSS Plugin:** Direct `tailwindcss` plugin no longer works
   - Resolution: Installed `@tailwindcss/postcss` and updated config
3. **Vite Environment Types:** `import.meta.env` not recognized
   - Resolution: Created `src/vite-env.d.ts` with proper type definitions

**Pre-existing TypeScript Errors:**
Multiple pre-existing TS errors in `src/components/ui/*.tsx` files (shadcn components with version suffixes in imports) and `src/components/*.tsx` files. These were documented in Story 1.2 and are outside scope of this story.

**Dev Server Verification:**
- Vite dev server starts successfully
- Build completes in 7.45 seconds
- HMR operational

### File List

**New Files Created:**
- `src/lib/supabase.ts` - Supabase client placeholder
- `src/vite-env.d.ts` - Vite environment type definitions
- `.env.example` - Environment variables template

**Files Modified:**
- `package.json` - Added 4 new dependencies (zustand, react-router-dom, date-fns, @supabase/supabase-js)
- `package-lock.json` - Updated with new dependencies
- `postcss.config.cjs` - Renamed from .js, updated to use @tailwindcss/postcss

**Files Removed:**
- `postcss.config.js` - Renamed to .cjs

### Change Log

**2025-12-13: Story 1.3 Implementation Complete**
- Installed zustand@5.0.9 for state management
- Installed react-router-dom@7.10.1 for client-side routing
- Upgraded react-hook-form from 7.55.0 to 7.68.0
- Installed date-fns@4.1.0 for date/time handling
- Installed @supabase/supabase-js@2.87.1 for backend client
- Created src/lib/supabase.ts with placeholder configuration
- Created src/vite-env.d.ts for Vite environment types
- Created .env.example with Supabase variable placeholders
- Fixed PostCSS configuration for Tailwind CSS v4 (renamed to .cjs, installed @tailwindcss/postcss)
- Verified bundle size: ~90 KB gzipped (well under 500KB limit)
- Verified dev server starts successfully
- All acceptance criteria met

---

## References

### Source Documents
- **Epic Definition:** [docs/epics-stories.md](../epics-stories.md#story-13-install-core-dependencies)
- **Architecture:** [docs/architecture.md](../architecture.md) - Sections:
  - Frontend Architecture (lines 284-410)
  - Backend Architecture (lines 412-441)
  - Bundle Budget Allocation (lines 528-536)
  - Implementation Patterns (lines 547-1098)
- **PRD:** [docs/prd.md](../prd.md) - Technology Stack, Performance Requirements

### External Documentation
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [React Router v7 Documentation](https://reactrouter.com/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [date-fns v4.0 Documentation](https://date-fns.org/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

### Related Stories
- **Previous Story:** 1.2 - Configure shadcn/ui Design System (done)
- **Next Story:** 1.4 - Configure Testing Framework
- **Depends On:** 1.1 (Vite initialization), 1.2 (shadcn/ui)
- **Blocks:** All feature implementation stories (Epics 2-13)

---

**CRITICAL SUCCESS CRITERIA:**
1. ✅ Zustand v5.x installed with TypeScript types working
2. ✅ React Router v7.x installed with TypeScript types working
3. ✅ React Hook Form v7.x installed with TypeScript types working
4. ✅ date-fns v4.x installed with time zone support verified
5. ✅ @supabase/supabase-js v2.x installed with placeholder configuration
6. ✅ Bundle size remains under 500KB gzipped (NFR-P10)
7. ✅ No new TypeScript errors from dependencies
8. ✅ `src/lib/supabase.ts` created with placeholder
9. ✅ `.env.example` created with Supabase variable placeholders
10. ✅ Project builds successfully with all dependencies
