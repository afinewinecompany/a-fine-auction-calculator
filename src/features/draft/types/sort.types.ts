/**
 * Sort Types for PlayerQueue Component
 *
 * Type definitions for column sorting functionality.
 *
 * Story: 6.4 - Implement Sortable Table Columns
 */

/**
 * Columns that can be sorted in the PlayerQueue table
 */
export type SortColumn =
  | 'name'
  | 'positions'
  | 'team'
  | 'projectedValue'
  | 'adjustedValue'
  | 'tier'
  | 'status';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Complete sort state
 */
export interface SortState {
  /** Column currently being sorted */
  column: SortColumn;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Default sort state - adjusted value descending (highest values first)
 */
export const DEFAULT_SORT: SortState = {
  column: 'adjustedValue',
  direction: 'desc',
};
