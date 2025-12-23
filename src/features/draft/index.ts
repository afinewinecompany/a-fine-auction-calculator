/**
 * Draft Feature Exports
 *
 * Central export point for draft feature.
 * Provides clean imports for other features and components.
 *
 * Story: 3.7 - Implement Resume Draft Functionality
 * Story: 6.2 - Implement PlayerQueue Component Foundation
 * Story: 6.3 - Implement Instant Player Search
 * Story: 6.5 - Display Adjusted Values with Prominent Styling
 * Story: 6.6 - Implement Color-Coded Value Indicators
 * Story: 6.8 - Implement Filter by Draft Status
 *
 * @example
 * ```typescript
 * import { useDraftStore, useHasDraftInProgress, useDraft, PlayerQueue, PlayerQueueWithSearch, StatusFilter, ValueDisplay, ValueIndicator, formatCurrency } from '@/features/draft';
 * import type { LeagueDraftState, DraftedPlayer, Player, ValueDisplayProps, ValueClassification, FilterState, StatusFilter as StatusFilterType } from '@/features/draft';
 * ```
 */

// Store
export { useDraftStore } from './stores/draftStore';

// Hooks
export { useHasDraftInProgress, useDraft } from './hooks/useDraft';
export { useInflationTracker } from './hooks/useInflationTracker';
export { useDraftSync } from './hooks/useDraftSync';

// Pages
export { DraftPage } from './pages/DraftPage';
export { DraftSummaryPage } from './pages/DraftSummaryPage';

// Components
export { PlayerQueue } from './components/PlayerQueue';
export { PlayerSearch } from './components/PlayerSearch';
export { PlayerQueueWithSearch } from './components/PlayerQueueWithSearch';
export { StatusFilter } from './components/StatusFilter';
export { ClearFiltersButton } from './components/ClearFiltersButton';
export { StatusBadge } from './components/StatusBadge';
export { ValueDisplay } from './components/ValueDisplay';
export { ValueIndicator } from './components/ValueIndicator';
export { TierBadge } from './components/TierBadge';
export { PlayerDetailModal } from './components/PlayerDetailModal';
export { BudgetDisplay } from './components/BudgetDisplay';
export { RosterPanel } from './components/RosterPanel';
export { SpendingBreakdown } from './components/SpendingBreakdown';
export { DraftProgress } from './components/DraftProgress';
export { InflationTracker } from './components/InflationTracker';
export { VarianceDisplay } from './components/VarianceDisplay';
export { TierBreakdown } from './components/TierBreakdown';
export { ConnectionStatusBadge } from './components/ConnectionStatusBadge';
export { DraftSummary } from './components/DraftSummary';
export { RosterOverview } from './components/RosterOverview';
export { BudgetUtilization } from './components/BudgetUtilization';
export { ValueAnalysis } from './components/ValueAnalysis';

// Utilities
export { formatCurrency, formatBudget } from './utils/formatCurrency';
export {
  filterPlayers,
  filterByStatus,
  getFilterCounts,
  hasActiveFilters,
} from './utils/filterPlayers';
export {
  classifyValue,
  getValueBackgroundColor,
  getValueLabel,
  calculatePercentDiff,
  getValueRowBackground,
  VALUE_BACKGROUND_COLORS,
  VALUE_LABELS,
  CLASSIFICATION_THRESHOLD,
} from './utils/classifyValue';

// Types - Value Classification
export type { ValueClassification } from './utils/classifyValue';

// Types - Draft State
export type {
  RosterSlot,
  DraftedPlayer,
  InflationData,
  LeagueDraftState,
  DraftStoreState,
  DraftStoreActions,
  RosterConfig,
  FilterState,
  StatusFilter as StatusFilterType,
  FilterCounts,
} from './types/draft.types';

// Constants - Filter
export { DEFAULT_FILTER } from './types/draft.types';

// Types - Player Queue
export type {
  Player,
  PlayerTier,
  DraftStatus,
  PlayerQueueProps,
  PlayerQueueColumn,
} from './types/player.types';

// Types - Tier (Story 6.9)
export type { TierInfo } from './types/tier.types';
export type { TierBadgeProps } from './components/TierBadge';
export type { PlayerDetailModalProps } from './components/PlayerDetailModal';
export { TIER_CONFIG, TIER_SHORT_LABELS, getTierInfo, getTierShortLabel } from './types/tier.types';

// Types - Value Display
export type { ValueDisplayProps } from './components/ValueDisplay';

// Types - Value Indicator
export type { ValueIndicatorProps } from './components/ValueIndicator';

// Types - Status Badge
export type { StatusBadgeProps } from './components/StatusBadge';

// Types - Status Filter (Story 6.8)
export type { StatusFilterProps } from './components/StatusFilter';

// Types - Clear Filters Button (Story 6.8)
export type { ClearFiltersButtonProps } from './components/ClearFiltersButton';

// Types - Roster Panel (Story 7.1, 7.2)
export type {
  BudgetData,
  RosterData,
  LeagueSettingsData,
  RosterPanelProps,
  BudgetDisplayProps,
  DraftedPlayer as RosterDraftedPlayer,
  SpendingBreakdownProps,
} from './types/roster.types';
export { LOW_BUDGET_THRESHOLD } from './types/roster.types';

// Types - Draft Progress (Story 7.8)
export type { DraftProgressProps } from './components/DraftProgress';

// Types - Inflation Tracker (Story 8.1, 8.2)
export type { InflationTrackerProps } from './components/InflationTracker';
export type { InflationTrackerData } from './hooks/useInflationTracker';

// Types - Variance (Story 8.3)
export type { VarianceDisplayProps } from './components/VarianceDisplay';
export type {
  VarianceCategory,
  PlayerVariance,
  VarianceSummary,
} from './utils/varianceCalculations';
export {
  VARIANCE_THRESHOLD,
  calculateVariancePercent,
  categorizeVariance,
  calculatePlayerVariance,
  calculateVarianceSummary,
  formatVariancePercent,
  getVarianceColor,
  getVarianceBackground,
} from './utils/varianceCalculations';

// Types - Tier Breakdown (Story 8.5)
export type { TierBreakdownProps } from './components/TierBreakdown';

// Types - Connection Status Badge (Story 9.2)
export type { ConnectionStatusBadgeProps } from './components/ConnectionStatusBadge';

// Types - Sync (Story 9.3)
export type {
  DraftPick,
  CurrentAuction,
  PlayerStats,
  PlayerInfo,
  AuctionInfo,
  SyncSuccessResponse,
  SyncErrorResponse,
  SyncResponse,
  SyncStatus,
  SyncRequest,
  SyncErrorCode,
} from './types/sync.types';
export { DEFAULT_SYNC_STATUS } from './types/sync.types';

// Types - useDraftSync Hook (Story 9.3)
export type { UseDraftSyncReturn } from './hooks/useDraftSync';

// Types - Summary (Story 12.1)
export type {
  DraftSummaryProps,
  SummaryMetrics,
  BudgetState,
  RosterSummary,
  RosterOverviewProps,
  BudgetUtilizationProps,
  ValueAnalysisProps,
  PlayerValueAnalysis,
  ValueClassification as SummaryValueClassification,
} from './types/summary.types';
export {
  createDefaultBudgetState,
  createDefaultRosterSummary,
  createDefaultSummaryMetrics,
} from './types/summary.types';
