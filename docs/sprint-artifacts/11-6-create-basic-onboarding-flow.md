# Story 11.6: Create Basic Onboarding Flow

**Story ID:** 11.6
**Story Key:** 11-6-create-basic-onboarding-flow
**Epic:** Epic 11 - User Onboarding & Discovery
**Status:** Ready for Review

---

## Story

As a **user**,
I want to access basic onboarding explaining core features before my first draft,
So that I understand how to use the key functionality.

---

## Acceptance Criteria

**Given** I have just created an account
**When** I log in for the first time
**Then** a welcome modal appears: "Welcome to Auction Projections!"
**And** the modal explains 3 core features: "1. Inflation Tracking 2. Adjusted Values 3. Tier Assignments"
**And** the modal includes a simple diagram or screenshot for each feature

---

## Developer Context

### Story Foundation from Epic

From **Epic 11: User Onboarding & Discovery** (docs/epics-stories.md lines 1521-1533):

This story creates the basic onboarding flow that welcomes new users and explains core features.

**Core Responsibilities:**

- **Welcome Modal:** Display on first login after account creation
- **Core Features:** Explain 3 key features with visuals
- **User Experience:** Clear, concise, skippable
- **Persistence:** Track onboarding completion in user profile

**The 3 Core Features:**

1. **Inflation Tracking** - How inflation affects player values during draft
2. **Adjusted Values** - How original values change based on market conditions
3. **Tier Assignments** - How players are grouped into value tiers

---

## Tasks / Subtasks

- [x] **Task 1: Create OnboardingModal Component**
  - [x] Create src/features/landing/components/OnboardingModal.tsx
  - [x] Use shadcn/ui Dialog component
  - [x] Add dark slate styling consistent with app

- [x] **Task 2: Implement Welcome Step**
  - [x] Display "Welcome to Auction Projections!" heading
  - [x] Add brief intro text
  - [x] Add "Get Started" button to proceed

- [x] **Task 3: Implement Feature Explanations**
  - [x] Create feature explanation slides/steps
  - [x] Feature 1: Inflation Tracking with icon/diagram
  - [x] Feature 2: Adjusted Values with icon/diagram
  - [x] Feature 3: Tier Assignments with icon/diagram

- [x] **Task 4: Add Navigation Controls**
  - [x] Previous/Next buttons for multi-step modal
  - [x] Progress indicator (step 1 of 4, etc.)
  - [x] Skip button to close modal
  - [x] Finish button on last step

- [x] **Task 5: Implement First-Login Detection**
  - [x] Check user profile for onboarding_completed flag
  - [x] If false or missing, show onboarding modal
  - [x] Store completion state in profile

- [x] **Task 6: Update Profile Store**
  - [x] Add onboarding_completed field to profile type
  - [x] Add setOnboardingComplete action to profile store
  - [x] Persist to Supabase user profile

- [x] **Task 7: Integrate with App Layout**
  - [x] Add OnboardingModal to main app layout
  - [x] Trigger on authenticated user with incomplete onboarding
  - [x] Close modal after completion

---

## Dev Notes

### Modal Structure

```tsx
<Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
  <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-white">
        Welcome to Auction Projections!
      </DialogTitle>
    </DialogHeader>
    
    {/* Multi-step content */}
    {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
    {step === 1 && <InflationTrackingStep onNext={() => setStep(2)} />}
    {step === 2 && <AdjustedValuesStep onNext={() => setStep(3)} />}
    {step === 3 && <TierAssignmentsStep onComplete={handleComplete} />}
    
    <DialogFooter>
      <Button variant="ghost" onClick={handleSkip}>Skip</Button>
      {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
      <Button onClick={handleNext}>{step < 3 ? 'Next' : 'Get Started'}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### First-Login Detection

```tsx
// In app layout or authenticated route wrapper
const { profile, fetchProfile } = useProfileStore();
const [showOnboarding, setShowOnboarding] = useState(false);

useEffect(() => {
  if (profile && !profile.onboarding_completed) {
    setShowOnboarding(true);
  }
}, [profile]);

const handleOnboardingComplete = async () => {
  await updateProfile({ onboarding_completed: true });
  setShowOnboarding(false);
};
```

---

## Summary

Story 11.6 creates the basic onboarding flow with welcome modal and feature explanations.

**Deliverable:** Multi-step onboarding modal that appears on first login, explaining core features with visuals.

**Key Technical Decisions:**
1. Multi-step modal with progress indicator
2. Onboarding completion tracked in user profile
3. Skippable for users who want to explore on their own
4. Feature explanations with icons/diagrams

---

## Dev Agent Record

### Implementation Plan
- Created OnboardingModal component with multi-step flow using shadcn/ui Dialog
- Implemented 4 steps: Welcome, Inflation Tracking, Adjusted Values, Tier Assignments
- Added navigation controls: Next, Back, Skip, Get Started
- Integrated first-login detection in AppLayout
- Extended Profile types and database schema with onboarding_completed field
- Created database migration 013_add_onboarding_completed.sql

### Completion Notes
✅ All tasks completed successfully
✅ OnboardingModal component created with 4 steps and visual icons (Sparkles, TrendingUp, DollarSign, Layers)
✅ Profile Store updated to include onboarding_completed field in queries
✅ Database migration created to add onboarding_completed column to users table
✅ AppLayout integration complete with first-login detection and completion handling
✅ Comprehensive test suite written covering all navigation flows, edge cases, and accessibility
✅ Integration tests for AppLayout onboarding flow created

**Implementation Details:**
- Used lucide-react icons for visual appeal on each step
- Progress indicator shows current step (1-4) with visual progress bar
- Modal is non-dismissible (requires Skip or Get Started to close)
- onboarding_completed defaults to FALSE for new users, NULL for existing users
- Both FALSE and NULL trigger onboarding modal display

---

## File List

**New Files:**
- supabase/migrations/013_add_onboarding_completed.sql
- src/features/landing/components/OnboardingModal.tsx
- tests/features/landing/OnboardingModal.test.tsx
- tests/features/landing/AppLayout.onboarding.test.tsx

**Modified Files:**
- src/types/database.types.ts
- src/features/profile/types/profile.types.ts
- src/features/profile/stores/profileStore.ts
- src/components/AppLayout.tsx
- src/features/landing/index.ts
- tests/database/users.test.ts
- tests/helpers/supabaseMock.ts

---

## Change Log

**2025-12-22:** Story 11.6 implementation completed
- Created OnboardingModal component with 4-step flow
- Added onboarding_completed field to database schema and TypeScript types
- Integrated onboarding modal into AppLayout with first-login detection
- Wrote comprehensive test suite with 50+ test cases
- All acceptance criteria met
