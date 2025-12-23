/**
 * FeaturesGrid Component
 *
 * Story 11.3: Implement Feature Showcase Grid
 * Displays 6 features in a responsive 3-column grid layout with icons and descriptions.
 */

import { TrendingUp, Layers, Target, Zap, Monitor, RefreshCw, LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: TrendingUp,
    title: 'Real-Time Inflation Tracking',
    description:
      'Monitor inflation as each player is drafted. See how the market is developing and adjust your strategy in real-time.',
  },
  {
    icon: Layers,
    title: 'Tier-Specific Modeling',
    description:
      'Separate tracking for elite, mid-tier, and depth players. Know exactly where value remains at each tier.',
  },
  {
    icon: Target,
    title: 'Position Scarcity Analysis',
    description:
      'Track position-specific inflation and scarcity. Never overpay for a position with remaining value.',
  },
  {
    icon: Zap,
    title: 'Automatic Couch Managers Sync',
    description:
      'Connect to your Couch Managers draft room and sync picks automatically. No manual entry needed.',
  },
  {
    icon: Monitor,
    title: 'Mobile-Desktop Parity',
    description:
      'Full functionality on any device. Draft from your phone, tablet, or desktop with the same great experience.',
  },
  {
    icon: RefreshCw,
    title: 'Manual Sync Fallback',
    description:
      "Continue drafting even when API is down. Manual entry mode ensures you're never left without inflation data.",
  },
];

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article
      className="group p-6 bg-slate-900/50 border border-slate-800 rounded-xl
                 hover:border-emerald-500/50 hover:bg-gradient-to-br hover:from-slate-900/80 hover:to-emerald-950/20
                 transition-all duration-300"
    >
      <div
        className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 text-emerald-400
                   group-hover:bg-emerald-500/20 transition-colors duration-300"
        data-testid="feature-icon"
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </article>
  );
}

export function FeaturesGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" aria-label="Features section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need to Win
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Gain the competitive edge with real-time inflation intelligence
          </p>
        </div>

        {/* 3-column grid: responsive to 2-col on tablet, 1-col on mobile */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          data-testid="features-grid"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesGrid;
