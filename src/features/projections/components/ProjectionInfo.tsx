/**
 * ProjectionInfo Component
 *
 * Displays projection source and last updated timestamp with relative time
 * formatting and stale data indicators.
 *
 * Story: 4.7 - Display Projection Source and Timestamp
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Info, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ProjectionInfoProps {
  source: string | null;
  updatedAt: string | null;
  playerCount: number;
}

/**
 * ProjectionInfo Component
 *
 * Displays projection metadata including:
 * - Projection source (e.g., "Fangraphs - Steamer", "Google Sheets")
 * - Player count
 * - Last updated timestamp with relative time
 * - Stale data warning (>24 hours old)
 */
export function ProjectionInfo({ source, updatedAt, playerCount }: ProjectionInfoProps) {
  // Empty state when no projections loaded
  if (!source) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4" aria-live="polite">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="h-5 w-5" aria-hidden="true" />
          <span>No projections loaded. Import projections to get started.</span>
        </div>
      </div>
    );
  }

  // Parse and format timestamp
  const parsedDate = updatedAt ? parseISO(updatedAt) : null;
  const relativeTime = parsedDate
    ? formatDistanceToNow(parsedDate, { addSuffix: true })
    : 'Unknown';
  const fullDateTime = parsedDate ? format(parsedDate, "MMMM d, yyyy 'at' h:mm a") : 'Unknown';

  // Check if data is stale (older than 24 hours)
  const isStale = parsedDate && Date.now() - parsedDate.getTime() > 24 * 60 * 60 * 1000;

  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-lg p-4"
      aria-label="Projection information"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Source and player count */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm text-slate-400" id="projection-source-label">
              Projection Source
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="bg-emerald-900/30 border-emerald-700 text-emerald-300"
                aria-labelledby="projection-source-label"
              >
                {source}
              </Badge>
              <span className="text-sm text-slate-400" aria-label={`${playerCount} players`}>
                ({playerCount.toLocaleString()} players)
              </span>
            </div>
          </div>
        </div>

        {/* Last updated timestamp */}
        <div className="flex items-center gap-2">
          <RefreshCw
            className={`h-4 w-4 ${isStale ? 'text-yellow-400' : 'text-slate-400'}`}
            aria-hidden="true"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help" aria-label={`Last updated ${fullDateTime}`}>
                  <span className="text-sm text-slate-400">Last updated: </span>
                  <span className={`text-sm ${isStale ? 'text-yellow-400' : 'text-slate-200'}`}>
                    {relativeTime}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-slate-700">
                <p>{fullDateTime}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Stale data warning */}
      {isStale && (
        <div
          className="mt-3 text-sm text-yellow-400 flex items-center gap-2"
          role="alert"
          aria-live="polite"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
          Projections are more than 24 hours old. Consider refreshing.
        </div>
      )}
    </div>
  );
}
