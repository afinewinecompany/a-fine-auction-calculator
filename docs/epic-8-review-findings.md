# Epic 8 Code Review Findings

This document outlines the findings from the code review of Epic 8 stories, along with suggested improvements and fixes.

## Story 8.1 - 8.7: InflationTracker Component and Hooks

### File: `src/features/draft/components/InflationTracker.tsx`

This component is the main UI for displaying inflation metrics. It covers functionality from stories 8.1 through 8.7.

#### Review Findings:

**1. Overloaded Component (God Component)**

*   **Observation:** The `InflationTracker` component has a large number of props and responsibilities. It handles data fetching logic (via props), data processing (trend calculation, position sorting), and presentation.
*   **Problem:** This violates the Single Responsibility Principle, making the component difficult to test, maintain, and reason about. Logic that could be in hooks or parent components is contained within this presentational component.
*   **Suggested Fix:**
    *   Refactor the trend calculation logic (`calculateInflationTrend`, `getTrendIcon`, etc.) into a dedicated hook like `useInflationTrend` or move it into the existing `useInflationTracker` hook. The `InflationTracker` component should receive the final `trend` object as a prop, not raw data like `inflationHistory`.
    *   Remove legacy support for the `variance` prop to simplify the component. The conditional logic to handle both `variance` and `draftedPlayers` adds unnecessary complexity for a new feature.
    *   Move the decision of whether to show `VarianceDisplay` to the parent component.

**2. Inefficient Calculations**

*   **Observation:** The `sortPositionsByRate` function is called on every render of the `InflationTracker` component.
*   **Problem:** This is an unnecessary recalculation that can be avoided. While the performance impact is likely small, it's a good practice to memoize such calculations.
*   **Suggested Fix:**
    *   Wrap the `sortPositionsByRate` call in a `useMemo` hook, with `positionRates` as a dependency. This will ensure the sorting only happens when the position inflation data changes.
    ```typescript
    const sortedPositions = useMemo(() => sortPositionsByRate(positionRates), [positionRates]);
    ```

**3. Accessibility Issues**

*   **Observation:**
    1.  Clickable `div` elements with `role="button"` are used as `TooltipTrigger`.
    2.  Redundant `aria-label` attributes are present on elements that already have descriptive text content.
*   **Problem:**
    1.  Using non-native button elements can lead to inconsistent keyboard interactions (e.g., not activating on Spacebar press) and a poorer experience for screen reader users.
    2.  Redundant `aria-label`s can cause screen readers to announce the same text twice, which is verbose and annoying.
*   **Suggested Fix:**
    1.  Replace the `div` with `role="button"` with a native `<button>` element inside the `TooltipTrigger`. This provides correct semantics and keyboard behavior out of the box.
    2.  Remove the `aria-label` from the `<span>` that displays the position-specific inflation rate. The text content of the span is sufficient for screen readers.

**4. Magic Numbers and Strings**

*   **Observation:** The `getPositionRateColor` function contains hardcoded numerical thresholds (`15`, `10`, `5`) and color strings (`'text-red-500'`, `'text-orange-500'`).
*   **Problem:** This makes the code harder to maintain. If thresholds or colors need to be updated, a developer has to find and modify this specific function.
*   **Suggested Fix:**
    *   Extract these values into a configuration object. This makes them easier to manage and modify.
    ```typescript
    const POSITION_RATE_THRESHOLDS = [
      { threshold: 15, color: 'text-red-500' },
      { threshold: 10, color: 'text-orange-500' },
      { threshold: 5, color: 'text-amber-500' },
      { threshold: 0, color: 'text-emerald-500' },
      // ... for negative values
    ];

    // Refactor getPositionRateColor to use this config object.
    ```
---

### File: `src/features/draft/hooks/useInflationTracker.ts`

This hook serves as a connector between the `InflationTracker` component and the `inflationStore`, providing the necessary data for display.

#### Review Findings:

**1. Inefficient State Selection from Zustand Store**

*   **Observation:** The hook uses multiple individual selector hooks (`useOverallInflation`, `usePositionInflation`, etc.) and direct `useInflationStore` calls to gather its data.
*   **Problem:** Each `use...` hook that calls `useInflationStore` creates a separate subscription to the store. When any part of the store updates, all subscriptions are checked. For a component that needs multiple pieces of data, it is more performant to create a single subscription that selects all the required data in one go. This avoids unnecessary re-renders.
*   **Suggested Fix:**
    *   Refactor the hook to use a single `useInflationStore` call with a selector function that returns an object of all the needed data. This will create only one subscription and will only cause a re-render if the selected state properties have changed.

    ```typescript
    // Before
    export function useInflationTracker(): InflationTrackerData {
      const inflationRate = useOverallInflation();
      const positionRates = usePositionInflation();
      // ... more calls
      return { inflationRate, positionRates, ... };
    }

    // After
    export function useInflationTracker(): InflationTrackerData {
      const data = useInflationStore(state => ({
        inflationRate: state.overallRate,
        positionRates: state.positionRates,
        tierRates: state.tierRates,
        isCalculating: state.isCalculating,
        lastUpdated: state.lastUpdated,
        error: state.error,
      }));
      return data;
    }
    ```

---

### File: `src/features/inflation/stores/inflationStore.ts`

This is the central Zustand store for managing all inflation-related data and calculations.

#### Review Findings:

**1. Proliferation of Single-Purpose Selector Hooks**

*   **Observation:** The store exports a large number of fine-grained selector hooks (e.g., `useOverallInflation`, `usePositionInflation`, `useTierInflationRate`, `useInflationCalculating`).
*   **Problem:** While these hooks are convenient for components that need only a single piece of information, they encourage developers to use them to assemble complex data objects, as seen in `useInflationTracker.ts`. This leads to the inefficient multiple-subscription pattern. The store itself is promoting a potential performance anti-pattern.
*   **Suggested Fix:**
    *   In addition to the granular hooks, provide one or more hooks that select commonly used collections of data. For example, creating a `useInflationTrackerData` hook directly in the store would be a good solution.
    *   Add comments to the selector hooks section of the file, guiding developers to create a combined selector if they need multiple pieces of state, to ensure better performance.

    ```typescript
    // In inflationStore.ts, a new hook could be added:
    /**
     * Selects a combined object of data needed for the InflationTracker UI.
     * Recommended for performance to avoid multiple store subscriptions.
     */
    export const useInflationTrackerData = () =>
      useInflationStore(state => ({
        inflationRate: state.overallRate,
        positionRates: state.positionRates,
        tierRates: state.tierRates,
        isCalculating: state.isCalculating,
        lastUpdated: state.lastUpdated,
        error: state.error,
      }));
    ```

---

### File: `tests/features/draft/InflationTracker.test.tsx`

This file contains the test suite for the `InflationTracker` component.

#### Review Findings:

**1. Brittle Tests Due to Testing Implementation Details**

*   **Observation:** A significant number of tests assert the presence of specific Tailwind CSS classes (e.g., `text-emerald-500`, `bg-slate-900`, `text-3xl`).
*   **Problem:** This makes the tests fragile and coupled to the component's styling. A simple design change (like updating a color or font size) would cause these tests to fail, even if the component's functionality remains correct. Unit and integration tests should focus on behavior and functionality, not visual styling details.
*   **Suggested Fix:**
    *   Remove tests that assert the presence of specific CSS classes related to visual styling (colors, fonts, backgrounds). These are better covered by visual regression tests or storybook snapshots.
    *   Focus tests on user-perceivable behavior. For example, instead of checking for a specific color class, test that a certain state is reflected in an attribute that is not tied to a specific style (e.g., `data-state="positive"`).

**2. Tests Reinforcing Accessibility Anti-Patterns**

*   **Observation:** The test suite includes a test, `should have proper aria-label for each position rate`, which checks for the existence of `aria-label` attributes that were identified as redundant and problematic in the component review.
*   **Problem:** The test validates and enforces an accessibility issue. If a developer fixes the accessibility issue in the component by removing the redundant `aria-label`, this test will fail, discouraging the fix.
*   **Suggested Fix:**
    *   Delete this test case. The tests should ensure that the position and rate are displayed correctly as text, which is sufficient for accessibility in this case. Tests should enforce good practices, not anti-patterns.

**3. Brittle DOM Traversal**

*   **Observation:** Some tests use `parentElement` to navigate the DOM to find elements to assert against.
*   **Problem:** This is a fragile testing strategy that depends on a specific HTML structure. If a `div` is added or removed for styling purposes, the test will break, even if the component still renders correctly for the user.
*   **Suggested Fix:**
    *   Refactor these tests to use more resilient queries from React Testing Library. Use `data-testid`, `role`, or other accessible attributes to select elements instead of relying on DOM structure.

---

### File: `src/features/draft/index.ts`

This is a "barrel" file that exports all public components, hooks, types, and utilities from the entire `draft` feature.

#### Review Findings:

**1. Overly Large Barrel File**

*   **Observation:** The file is extremely large, exporting a vast number of items. It serves as a single entry point for a very complex feature.
*   **Problem:**
    1.  **Developer Experience:** A giant list of exports makes it difficult for developers to understand the feature's public API. It can also slow down IDEs and intellisense.
    2.  **Bundle Size:** While modern bundlers with tree-shaking are good, they are not perfect. Large barrel files can sometimes cause more code to be included in the final bundle than necessary.
    3.  **Maintainability:** As the feature grows, this file will become even more unwieldy and difficult to manage.
*   **Suggested Fix:**
    *   Adopt a more granular approach to exports. Instead of a single `index.ts` for the entire feature, create barrel files within subdirectories (e.g., `components/index.ts`, `hooks/index.ts`, `types/index.ts`).
    *   This allows consumers to import from more specific paths, which can improve clarity and potentially help with tree-shaking. For example:
        ```typescript
        // Instead of this:
        import { PlayerQueue, useDraft, DraftedPlayer } from '@/features/draft';

        // Developers could do this:
        import { PlayerQueue } from '@/features/draft/components';
        import { useDraft } from '@/features/draft/hooks';
        import type { DraftedPlayer } from '@/features/draft/types';
        ```
    *   This makes the dependency graph clearer and the feature easier to navigate.

