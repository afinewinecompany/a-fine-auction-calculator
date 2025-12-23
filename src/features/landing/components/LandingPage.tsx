/**
 * LandingPage Component
 *
 * Main landing page component that composes all sections:
 * - Hero Section (Story 11.2)
 * - Features Grid (Story 11.3)
 * - How It Works (Story 11.4)
 * - CTA Section (Story 11.5)
 *
 * Uses dark slate theme with emerald accents and animated gradient background.
 *
 * Story: 11.1 - Create Landing Page Component
 */

import { HeroSection } from './HeroSection';
import { FeaturesGrid } from './FeaturesGrid';
import { HowItWorksSection } from './HowItWorksSection';
import { CTASection } from './CTASection';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Animated gradient background layer */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Primary gradient orb - top left */}
        <div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-900/20 rounded-full blur-3xl animate-gradient-slow"
          style={{
            animationDelay: '0s',
          }}
        />
        {/* Secondary gradient orb - bottom right */}
        <div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-green-900/15 rounded-full blur-3xl animate-gradient-slow"
          style={{
            animationDelay: '-7s',
          }}
        />
        {/* Tertiary gradient orb - center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-emerald-950/30 rounded-full blur-3xl animate-gradient-slow"
          style={{
            animationDelay: '-3.5s',
          }}
        />
      </div>

      {/* Main content - positioned above background */}
      <main className="relative z-10">
        <HeroSection />
        <FeaturesGrid />
        <HowItWorksSection />
        <CTASection />
      </main>

      {/* Footer placeholder */}
      <footer className="relative z-10 py-8 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} A Fine Wine Company. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
