/**
 * Daily Projection Sync Edge Function
 *
 * Story: 4.6 - Implement Daily Fangraphs Sync
 *
 * Scheduled to run at 2 AM UTC daily via pg_cron.
 * Syncs Fangraphs projections for all leagues using Fangraphs as their source.
 *
 * Features:
 * - Identifies leagues using Fangraphs projections
 * - Fetches updated projections for each league
 * - Upserts projections with updated_at timestamp
 * - Logs all sync operations to projection_sync_logs
 * - Alerts if error rate exceeds 5% threshold
 *
 * Performance Target (NFR-P5): 10 seconds per league
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Constants
const ALERT_THRESHOLD_PERCENT = 5;
const MAX_SYNC_DURATION_MS = 10000; // NFR-P5: 10 seconds per league
const EDGE_FUNCTION_TIMEOUT_MS = 55000; // Edge Function timeout buffer (60s max - 5s safety margin)
const PER_LEAGUE_TIMEOUT_MS = 15000; // Timeout per league fetch operation

// Types
interface SyncResults {
  total: number;
  success: number;
  failed: number;
  errors: string[];
  performanceWarnings: string[];
}

interface NormalizedPlayer {
  playerName: string;
  team: string;
  positions: string[];
  fangraphsId: string;
  projectedValue: number | null;
  statsHitters: Record<string, number> | null;
  statsPitchers: Record<string, number> | null;
  fantasyPoints: number | null;
  adp: number | null;
}

interface FetchResponse {
  system: string;
  fangraphsSystem: string;
  playerType: string;
  players: NormalizedPlayer[];
  count: number;
  fetchedAt: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const syncStartTime = Date.now();

  try {
    // Get all leagues using Fangraphs projections
    // Query for distinct league_id/projection_source combinations
    const { data: projections, error: projectionsError } = await supabase
      .from('player_projections')
      .select('league_id, projection_source')
      .like('projection_source', 'Fangraphs%')
      .not('league_id', 'is', null);

    if (projectionsError) {
      console.error('Error fetching leagues:', projectionsError);
      return new Response(
        JSON.stringify({ error: projectionsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unique league/source combinations
    // Last source wins if multiple exist for same league
    const uniqueLeagues = new Map<string, string>();
    projections?.forEach((p) => {
      if (p.league_id && p.projection_source) {
        uniqueLeagues.set(p.league_id, p.projection_source);
      }
    });

    // No leagues to sync
    if (uniqueLeagues.size === 0) {
      const emptyResults: SyncResults = {
        total: 0,
        success: 0,
        failed: 0,
        errors: [],
        performanceWarnings: [],
      };

      return new Response(JSON.stringify(emptyResults), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: SyncResults = {
      total: uniqueLeagues.size,
      success: 0,
      failed: 0,
      errors: [],
      performanceWarnings: [],
    };

    // Process each league sequentially to respect rate limits
    for (const [leagueId, source] of uniqueLeagues) {
      // Check if we're approaching Edge Function timeout
      const elapsedTotal = Date.now() - syncStartTime;
      if (elapsedTotal > EDGE_FUNCTION_TIMEOUT_MS) {
        console.warn(`Approaching timeout after ${elapsedTotal}ms, skipping remaining ${uniqueLeagues.size - results.success - results.failed} leagues`);
        results.errors.push(`Timeout: Skipped remaining leagues after ${elapsedTotal}ms`);
        break;
      }

      const leagueStartTime = Date.now();

      // Extract system from source (e.g., "Fangraphs - Steamer" -> "steamer")
      const system = extractSystem(source);

      try {
        // Fetch hitters and pitchers with per-league timeout
        const [hittersResponse, pitchersResponse] = await Promise.race([
          Promise.all([
            fetchProjections(system, 'hitters'),
            fetchProjections(system, 'pitchers'),
          ]),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`League sync timeout after ${PER_LEAGUE_TIMEOUT_MS}ms`)), PER_LEAGUE_TIMEOUT_MS)
          ),
        ]);

        const hitters = hittersResponse?.players || [];
        const pitchers = pitchersResponse?.players || [];
        const allPlayers = [...hitters, ...pitchers];

        if (allPlayers.length === 0) {
          throw new Error(`No players returned for ${source}`);
        }

        // Build projections for upsert
        const projectionsToUpsert = allPlayers.map((player) => ({
          league_id: leagueId,
          player_name: player.playerName,
          team: player.team,
          positions: player.positions,
          projection_source: source,
          stats_hitters: player.statsHitters,
          stats_pitchers: player.statsPitchers,
          updated_at: new Date().toISOString(),
        }));

        // Upsert projections using the unique constraint
        const { error: upsertError } = await supabase
          .from('player_projections')
          .upsert(projectionsToUpsert, {
            onConflict: 'league_id,player_name',
            ignoreDuplicates: false,
          });

        if (upsertError) {
          throw new Error(`Upsert failed: ${upsertError.message}`);
        }

        // Calculate duration
        const duration = Date.now() - leagueStartTime;

        // Log success
        await logSync(
          supabase,
          leagueId,
          source,
          'success',
          allPlayers.length,
          null,
          duration,
          leagueStartTime
        );

        // Check performance (NFR-P5)
        if (duration > MAX_SYNC_DURATION_MS) {
          results.performanceWarnings.push(
            `League ${leagueId}: ${duration}ms (exceeded ${MAX_SYNC_DURATION_MS}ms target)`
          );
        }

        results.success++;
        console.log(
          `Synced ${allPlayers.length} players for league ${leagueId} in ${duration}ms`
        );
      } catch (error) {
        const duration = Date.now() - leagueStartTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';

        // Log failure
        await logSync(
          supabase,
          leagueId,
          source,
          'failure',
          0,
          errorMsg,
          duration,
          leagueStartTime
        );

        results.failed++;
        results.errors.push(`League ${leagueId}: ${errorMsg}`);
        console.error(`Failed to sync league ${leagueId}:`, errorMsg);
      }
    }

    // Check error rate and trigger alert if needed
    const errorRate = results.total > 0 ? (results.failed / results.total) * 100 : 0;
    if (errorRate > ALERT_THRESHOLD_PERCENT) {
      await triggerAlert(supabase, errorRate, results.errors);
    }

    // Add summary to response
    const totalDuration = Date.now() - syncStartTime;
    const response = {
      ...results,
      errorRate: errorRate.toFixed(2) + '%',
      totalDuration: totalDuration + 'ms',
      alertTriggered: errorRate > ALERT_THRESHOLD_PERCENT,
    };

    console.log('Daily sync complete:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Daily sync failed:', errorMsg);

    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Extract Fangraphs system from projection source
 * e.g., "Fangraphs - Steamer" -> "steamer"
 */
function extractSystem(projectionSource: string): string {
  return projectionSource
    .replace('Fangraphs - ', '')
    .replace('THE BAT X', 'thebatx')
    .replace('THE BAT', 'thebat')
    .toLowerCase()
    .trim();
}

/**
 * Fetch projections from the fetch-fangraphs-projections Edge Function
 */
async function fetchProjections(
  system: string,
  playerType: string
): Promise<FetchResponse | null> {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/fetch-fangraphs-projections`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ system, playerType }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(`Fetch failed (${response.status}): ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to fetch ${playerType} for ${system}:`, errorMsg);
    throw error;
  }
}

/**
 * Log sync operation to projection_sync_logs table
 */
async function logSync(
  supabase: ReturnType<typeof createClient>,
  leagueId: string,
  source: string,
  status: 'success' | 'failure',
  playersUpdated: number,
  errorMessage: string | null,
  durationMs: number,
  startTime: number
): Promise<void> {
  try {
    const { error } = await supabase.from('projection_sync_logs').insert({
      league_id: leagueId,
      projection_source: source,
      status,
      players_updated: playersUpdated,
      error_message: errorMessage,
      duration_ms: durationMs,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to log sync:', error.message);
    }
  } catch (err) {
    console.error('Failed to log sync:', err);
  }
}

/**
 * Trigger alert when error rate exceeds threshold
 * Currently logs to console. Can be extended for:
 * - Email notifications
 * - Slack webhooks
 * - In-app notifications (Epic 13)
 */
async function triggerAlert(
  _supabase: ReturnType<typeof createClient>,
  errorRate: number,
  errors: string[]
): Promise<void> {
  // Log alert to console (captured in Supabase function logs)
  console.error('=== ALERT: High Error Rate in Projection Sync ===');
  console.error(`Error rate: ${errorRate.toFixed(2)}%`);
  console.error(`Threshold: ${ALERT_THRESHOLD_PERCENT}%`);
  console.error('Errors:');
  errors.forEach((err) => console.error(`  - ${err}`));
  console.error('=== END ALERT ===');

  // Future: Add email notification, Slack webhook, etc.
  // Future: Store alert in notifications table for admin dashboard (Epic 13)
}
