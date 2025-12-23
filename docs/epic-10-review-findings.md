# Epic 10 Code Review Findings

This document outlines the findings from the code review of Epic 10 stories, which focus on gracefully handling API connection failures and implementing a manual sync mode.

---

## Story 10.1: Detect API Connection Failures

### File: `src/features/draft/utils/classifyError.ts`

This new utility file is responsible for classifying errors from the sync process into 'transient' or 'persistent' categories to determine the correct follow-up action (retry or enter manual mode).

#### Review Findings:

**1. Brittle Error Classification Based on String Matching**

*   **Observation:** The `classifyNetworkError` function determines the type of an error by parsing the error's message string for keywords like 'timeout', 'network', or '401'.
*   **Problem:** This is a fragile and unreliable method. The text of error messages from network libraries (like `fetch`) or the Supabase client is not part of a stable public API and can change between library versions. An update to a dependency could easily break this error classification logic, causing the system to misdiagnose errors (e.g., treating a persistent auth error as a transient one).
*   **Suggested Fix:**
    *   The error handling logic in the calling code (e.g., `useDraftSync` hook) should be improved to catch more structured error objects whenever possible, instead of generic `Error` instances.
    *   For example, if the Supabase client throws an error object that contains a `status` property, that status code should be used for classification instead of parsing the message string. String matching should be the last resort for when no other information is available.

**2. Overlapping and Unclear Classification Logic**

*   **Observation:** The file contains multiple classification functions (`classifyEdgeFunctionError`, `classifyNetworkError`, `classifyHttpStatus`). The `classifyNetworkError` function partially duplicates the logic of `classifyHttpStatus` by looking for status codes inside the error message string.
*   **Problem:** This creates confusing and overlapping responsibilities. It's not clear which function takes precedence, and it could lead to inconsistent error classification. The main exported function, `classifyError`, tries to orchestrate this, but the underlying functions are not cleanly separated.
*   **Suggested Fix:**
    *   Consolidate the error classification strategy. The primary method should always be to use a structured `code` from the edge function's response or an HTTP `status` from the network client's error.
    *   The `classifyNetworkError` function should be simplified to *only* handle true network-level errors where no status code is available (e.g., DNS resolution failure, user is offline). It should not be responsible for parsing status codes from strings.
    *   The main `classifyError` function should be updated to clearly prioritize the classification methods: 1. Check for `SyncErrorResponse`. 2. Check for an error object with a `status` property. 3. Fall back to the simplified `classifyNetworkError` for generic `Error` objects.

---

### File: `tests/features/draft/useDraftSync.failureDetection.test.tsx` (Missing)

This test file was specified in the story to test the new failure detection and retry logic in the `useDraftSync` hook.

#### Review Findings:

**1. Critical Issue: Missing Test Suite for Core Feature Logic**

*   **Observation:** The file `tests/features/draft/useDraftSync.failureDetection.test.tsx`, which is explicitly listed as a required test file in the story description, does not exist.
*   **Problem:** This is a critical omission. The new failure detection and retry logic added to the `useDraftSync` hook is the most complex part of this story's implementation. My review of the hook has already identified a critical bug in its state management (using local `useState` instead of the global `draftStore`). A dedicated test suite for this new logic would almost certainly have caught this bug, as the test developer would have been forced to confront the two conflicting sources of truth. Shipping this complex, buggy code without any test coverage is a major risk.
*   **Suggested Fix:**
    *   **High Priority:** A test suite must be created for the `useDraftSync` hook.
    *   These tests must validate the failure handling logic by mocking the API response and asserting that the *global `draftStore`* is updated correctly. Key scenarios to test include:
        1.  A single transient failure increments the failure count in the store.
        2.  A single persistent failure enables manual mode in the store.
        3.  Three consecutive transient failures enable manual mode in the store.
        4.  A successful sync after a failure resets the failure count in the store.
        5.  The exponential backoff delay is calculated and applied correctly between retries.

---

### File: `src/features/draft/stores/draftStore.ts` (Changes for Epic 10)

This store was modified to include state and actions for tracking synchronization failures.

#### Review Findings:

**1. Architectural Observation: Growing Store Complexity**

*   **Observation:** The `draftStore` has been updated to include a `syncStatus` slice of state and several actions to manage it (`incrementFailureCount`, `resetFailureCount`, etc.).
*   **Problem:** This is a minor architectural point, not a bug. The `draftStore` is growing to encompass multiple concerns: the core draft data (roster, players), UI state (sorting, filtering), and now the state of the network synchronization process. As the application grows, such large stores can become difficult to maintain. An alternative architecture would be to have a separate `syncStore` that is only responsible for the state of the API synchronization, keeping the `draftStore` focused on the draft data itself.
*   **Suggested Fix:** No immediate change is needed. The current implementation is logical, as the sync status is tightly coupled to a specific draft. However, the team should be mindful of the growing complexity of this store and consider if future state management additions might be better placed in their own dedicated stores to improve separation of concerns.

---

## Story 10.2: Enable Manual Sync Mode

### File: `src/features/draft/components/BidInput.tsx`

This new component is an input field for manually entering player bid amounts.

#### Review Findings:

**1. Major Issue: Over-engineering with `react-hook-form`**

*   **Observation:** The component uses the `react-hook-form` library to manage the state and validation of a single input field. This involves setting up `useForm`, `register`, `handleSubmit`, `useEffect` to sync props, and `useCallback` for handlers.
*   **Problem:** This is a clear case of over-engineering. Using a full-featured form library for a single input adds significant and unnecessary complexity, increases the component's code size (~150 lines), and adds to the application's bundle size. A simple `useState` hook to manage the input's value would be far more straightforward and performant. This implementation also directly contradicts the guidance in the story file for 10.2, which says: "Use native input validation (simpler than React Hook Form for inline fields)".
*   **Suggested Fix:**
    *   **High Priority:** Refactor this component to remove the dependency on `react-hook-form`.
    *   Use a simple `useState` hook to hold the input's string value.
    *   Perform validation manually inside the `onSubmit` handler before calling the `onSubmit` prop. A second `useState` can be used to hold and display any validation error message.
    *   This will make the component much simpler, smaller, more performant, and easier for other developers to understand and maintain.

---

### File: `src/features/draft/components/PlayerQueue.tsx` (Changes for Epic 10)

This component was modified to conditionally render new columns and inputs for Manual Sync Mode.

#### Review Findings:

**1. Major Issue: Confusing Local State Management in `PlayerRow`**

*   **Observation:** The `PlayerRow` sub-component introduces its own local state for the "My Team" checkbox (`const [localIsMyTeam, setLocalIsMyTeam] = useState(...)`). This local state is then used to determine the value passed up in the `onBidSubmit` callback, ignoring the state that the child `BidInput` component might have.
*   **Problem:** This creates a confusing and bug-prone data flow with multiple sources of truth for the "is my team" status. The status exists as a prop (`player.status`), as local state in the row (`localIsMyTeam`), and is also passed up from the `BidInput`. It's very difficult to reason about which state is correct at any given time. This pattern is likely to lead to bugs where the checkbox UI and the submitted bid data are out of sync.
*   **Suggested Fix:**
    *   **High Priority:** Remove the local state from `PlayerRow`. The state for manual bid entries (the bid amount and the "is my team" status for a specific player) should be held in the global `draftStore`.
    *   The `PlayerRow` should read this "pending bid" state from the store and call store actions to update it. This ensures there is only one source of truth. The `MyTeamCheckbox` and `BidInput` would both be controlled by data from the central store, eliminating the confusing local state and the need to pass state back and forth between them.

**2. Architectural Observation: Prop Drilling**

*   **Observation:** The `PlayerQueue` component now accepts several new props (`isManualMode`, `onBidSubmit`, `onMyTeamToggle`, `remainingBudget`) and passes them directly down to every `PlayerRow` component it renders.
*   **Problem:** This is a classic example of "prop drilling." The `PlayerQueue` component itself doesn't use these props; it only acts as a pass-through. As more interactive features are added to the rows, this component will become increasingly bloated with props it has to pass down, making it harder to maintain.
*   **Suggested Fix:** Refactor `PlayerRow` to be more self-sufficient. Instead of receiving all its data and callbacks as props, it could be a "container component" that uses the `useDraftStore` and `useLeagueStore` hooks itself to get the data it needs (like `isManualMode` and `remainingBudget`) and the actions it needs to call (`onBidSubmit`). This is consistent with the project's apparent architecture of using hooks directly in components and would decouple `PlayerRow` from `PlayerQueue`.
