/**
 * Leagues Feature Exports
 *
 * Central export point for all league-related functionality.
 *
 * Story: 3.2 - Implement Create League Form
 */

// Components
export { LeagueForm } from './components/LeagueForm';
export { LeagueCard } from './components/LeagueCard';
export { LeaguesList } from './components/LeaguesList';
export { LeagueDetail } from './components/LeagueDetail';
export { EmptyLeaguesState } from './components/EmptyLeaguesState';
export { ConnectCouchManagersDialog } from './components/ConnectCouchManagersDialog';

// Store and selectors
export {
  useLeagueStore,
  useLeagues,
  useCurrentLeague,
  useLeagueLoading,
  useLeagueCreating,
  useLeagueUpdating,
  useLeagueDeleting,
  useLeagueConnecting,
  useLeagueError,
  useConnectionError,
} from './stores/leagueStore';

// Hooks
export {
  useLeaguesList,
  useCreateLeague,
  useLeague,
  useUpdateLeague,
  useDeleteLeague,
} from './hooks/useLeagues';

// Types
export type {
  League,
  ScoringType,
  CreateLeagueRequest,
  UpdateLeagueRequest,
  LeagueState,
  LeagueActions,
  LeagueStore,
} from './types/league.types';
export { LEAGUE_VALIDATION } from './types/league.types';

// Validation
export {
  leagueFormSchema,
  defaultLeagueFormValues,
  parseOptionalNumber,
  type LeagueFormData,
} from './utils/leagueValidation';

// Types - Couch Managers
export type { ConnectCouchManagersDialogProps } from './components/ConnectCouchManagersDialog';
