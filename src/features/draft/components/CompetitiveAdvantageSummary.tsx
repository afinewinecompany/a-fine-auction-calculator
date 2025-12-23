/**
 * CompetitiveAdvantageSummary Component
 *
 * Displays the competitive advantage summary with headline, key metrics, and share button.
 * Uses emerald/green styling to emphasize wins and create a celebratory experience.
 *
 * Story: 12.5 - Show Competitive Advantage Summary
 */

import { useMemo } from 'react';
import { Trophy, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { ShareButton } from './ShareButton';
import { calculateSummaryMetrics } from '../utils/summaryMetrics';
import { generateShareText } from '../utils/shareText';
import type { Steal, Overpay } from '../utils/valueAnalysis';

interface CompetitiveAdvantageSummaryProps {
  /** Array of identified steals */
  steals: Steal[];
  /** Array of identified overpays */
  overpays: Overpay[];
  /** Optional league name for share text */
  leagueName?: string;
}

/**
 * CompetitiveAdvantageSummary displays the final summary of draft performance.
 * Creates an accomplishment-focused experience with share functionality.
 */
export function CompetitiveAdvantageSummary({
  steals,
  overpays,
  leagueName,
}: CompetitiveAdvantageSummaryProps) {
  // Calculate summary metrics
  const metrics = useMemo(() => calculateSummaryMetrics(steals, overpays), [steals, overpays]);

  // Generate share text
  const shareText = useMemo(
    () =>
      generateShareText({
        netValue: metrics.netValue,
        stealsCount: metrics.stealsCount,
        overpaysCount: metrics.overpaysCount,
        leagueName,
      }),
    [metrics, leagueName]
  );

  // Determine headline based on performance
  const getHeadline = () => {
    if (metrics.netValue > 100) {
      // Exceptional performance
      return `You crushed the market by $${metrics.netValue}!`;
    } else if (metrics.netValue > 0) {
      // Positive performance
      return `You outperformed the market by $${metrics.netValue}!`;
    } else if (metrics.netValue === 0) {
      // Matched market
      return 'You matched market prices perfectly!';
    } else if (metrics.stealsCount > 0) {
      // Negative but found some steals
      return `You found ${metrics.stealsCount} steal${metrics.stealsCount === 1 ? '' : 's'} in your draft!`;
    } else {
      // No steals - focus on completion
      return 'Solid draft at market value!';
    }
  };

  // Determine subtext based on performance
  const getSubtext = () => {
    if (metrics.netValue > 0) {
      return `You found $${metrics.netValue} in value that others missed!`;
    } else if (metrics.netValue === 0) {
      return 'Your draft strategy was right on target with market values.';
    } else if (metrics.stealsCount > 0) {
      return `Captured value on ${metrics.stealsCount} player${metrics.stealsCount === 1 ? '' : 's'}.`;
    }
    return 'Every draft is a learning experience for next time!';
  };

  // Format singular/plural
  const formatCount = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural}`;

  return (
    <section
      aria-label="Competitive Advantage Summary"
      className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 rounded-xl p-6 md:p-8 border border-emerald-800/30"
    >
      {/* Trophy Icon and Headline */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
          <Trophy className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-2">{getHeadline()}</h2>

        <p className="text-slate-300 text-lg">{getSubtext()}</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Steals */}
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{metrics.stealsCount}</div>
          <div className="text-sm text-slate-400">
            {metrics.stealsCount === 1 ? 'Steal' : 'Steals'}
          </div>
        </div>

        {/* Overpays */}
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300">{metrics.overpaysCount}</div>
          <div className="text-sm text-slate-400">
            {metrics.overpaysCount === 1 ? 'Overpay' : 'Overpays'}
          </div>
        </div>

        {/* Net Value */}
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <div
            className={`text-2xl font-bold ${metrics.hasNetGain ? 'text-emerald-400' : 'text-slate-300'}`}
          >
            {metrics.netValue >= 0 ? '+' : '-'}${Math.abs(metrics.netValue)}
          </div>
          <div className="text-sm text-slate-400">Net Value</div>
        </div>
      </div>

      {/* Summary Line */}
      <div className="text-center text-slate-400 mb-6">
        {formatCount(metrics.stealsCount, 'steal', 'steals')} |{' '}
        {formatCount(metrics.overpaysCount, 'overpay', 'overpays')} | Net value:{' '}
        <span className={metrics.hasNetGain ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
          {metrics.netValue >= 0 ? '+' : ''}${metrics.netValue}
        </span>
      </div>

      {/* Share Button */}
      <div className="flex justify-center">
        <ShareButton shareText={shareText} />
      </div>
    </section>
  );
}

export default CompetitiveAdvantageSummary;
