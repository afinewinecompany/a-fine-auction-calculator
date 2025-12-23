/**
 * ValueAnalysis Component
 *
 * Displays steals and overpays analysis with visual comparisons.
 * Highlights players acquired at favorable prices with celebration UI.
 *
 * Story: 12.4 - Highlight Steals with Visual Comparison
 */

import { StealCard } from './StealCard';
import { ValueComparison } from './ValueComparison';
import { identifySteals, identifyOverpays } from '../utils/valueAnalysis';
import type { ValueAnalysisProps } from '../types/summary.types';

/**
 * ValueAnalysis displays value comparisons and identifies steals/overpays.
 * Shows a prominent steals section with celebration messaging and
 * a subtle overpays section for complete analysis.
 */
export function ValueAnalysis({ roster, inflationData }: ValueAnalysisProps) {
  // Analyze roster for steals and overpays
  const { steals, totalValueGained } = identifySteals(roster, inflationData);
  const { overpays, totalValueLost } = identifyOverpays(roster, inflationData);

  // Calculate net value
  const netValue = totalValueGained - totalValueLost;
  const hasNetGain = netValue > 0;

  return (
    <section className="bg-slate-900 rounded-lg p-6 border-l-4 border-emerald-500">
      <h2 className="text-xl font-bold text-white mb-4">Value Analysis</h2>

      {/* Steals Section - Prominent celebration UI */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-emerald-400 mb-3">
          Steals ({steals.length} captured)
        </h3>

        {steals.length > 0 ? (
          <>
            {/* Celebration headline */}
            <div className="bg-emerald-950/30 rounded-lg p-4 mb-4 border border-emerald-800/50">
              <p className="text-2xl font-bold text-emerald-400">
                You saved ${totalValueGained} compared to adjusted values!
              </p>
              <p className="text-sm text-emerald-300/70 mt-1">
                {steals.length} steal{steals.length !== 1 ? 's' : ''} captured below market value
              </p>
            </div>

            {/* Steals list */}
            <div className="space-y-3">
              {steals.map(steal => (
                <StealCard key={steal.player.playerId} steal={steal} />
              ))}
            </div>

            {/* Visual comparison for top steal */}
            {steals.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-slate-400 mb-2">Best Steal Value Comparison</p>
                <ValueComparison
                  auctionPrice={steals[0].auctionPrice}
                  adjustedValue={steals[0].adjustedValue}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-400 italic">
            No significant steals, but solid draft! All players acquired near fair value.
          </p>
        )}
      </div>

      {/* Overpays Section - Subtle, less prominent */}
      {overpays.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h3 className="text-md font-medium text-slate-400 mb-3">Overpays ({overpays.length})</h3>
          <div className="space-y-2">
            {overpays.map(overpay => (
              <div
                key={overpay.player.playerId}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">{overpay.player.playerName}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                    {overpay.player.position}
                  </span>
                </div>
                <span className="text-red-400">${overpay.valueLost} above value</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">Total overpaid: ${totalValueLost}</p>
        </div>
      )}

      {/* Net Value Summary */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Net Value</span>
          <span className={`text-lg font-bold ${hasNetGain ? 'text-emerald-400' : 'text-red-400'}`}>
            {hasNetGain ? '+' : '-'}${Math.abs(netValue)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Based on {(inflationData.overallRate * 100).toFixed(1)}% overall inflation
        </p>
      </div>
    </section>
  );
}

export default ValueAnalysis;
