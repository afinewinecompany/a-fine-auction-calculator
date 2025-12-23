/**
 * ActiveDraftsWidget Component
 *
 * Displays a real-time list of all active drafts across all users.
 * Polls the database every 30 seconds for updates.
 *
 * Story: 13.2 - Display Active Drafts List
 *
 * @example
 * ```tsx
 * <ActiveDraftsWidget />
 * ```
 */

import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';
import { useActiveDrafts } from '../hooks/useActiveDrafts';
import { DraftStatusBadge } from './DraftStatusBadge';

export function ActiveDraftsWidget() {
  const { drafts, loading, error } = useActiveDrafts();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-white">Active Drafts</h2>
        </div>
        <div className="text-slate-400" role="status" aria-live="polite">
          Loading active drafts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-white">Active Drafts</h2>
        </div>
        <div className="text-red-400" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-white">Active Drafts</h2>
        </div>
        <span
          className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm font-semibold"
          aria-label={`${drafts.length} active drafts`}
        >
          {drafts.length} active
        </span>
      </div>

      {/* Empty State */}
      {drafts.length === 0 ? (
        <div className="text-center text-slate-400 py-8">No active drafts at this time</div>
      ) : (
        /* Draft List */
        <div className="space-y-3" role="list" aria-label="Active drafts list">
          {drafts.map(draft => (
            <div
              key={draft.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                draft.status === 'error'
                  ? 'bg-red-900/20 border border-red-800 hover:bg-red-900/30'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              onClick={() => navigate(`/admin/drafts/${draft.id}`)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/admin/drafts/${draft.id}`);
                }
              }}
              role="listitem"
              tabIndex={0}
              aria-label={`${draft.league.name} draft, status: ${draft.status}`}
            >
              {/* Draft Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-white">{draft.league.name}</h3>
                <DraftStatusBadge status={draft.status} />
              </div>

              {/* Draft Details */}
              <div className="text-sm text-slate-400 space-y-1">
                <div>User: {draft.user.full_name || draft.user.email}</div>
                <div>Started: {formatDistanceToNow(new Date(draft.started_at))} ago</div>
                <div>Last Activity: {formatDistanceToNow(new Date(draft.last_activity))} ago</div>
                {draft.error_message && (
                  <div className="text-red-400 font-medium">Error: {draft.error_message}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
