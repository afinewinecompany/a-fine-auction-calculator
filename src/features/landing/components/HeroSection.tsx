/**
 * HeroSection Component
 *
 * Displays the main hero section with compelling headline, subheadline,
 * and call-to-action buttons for the landing page.
 *
 * Story: 11.2 - Implement Hero Section
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-label="Hero section"
    >
      {/* Animated gradient background layer */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 animate-gradient-shift"
        style={{ backgroundSize: '200% 200%' }}
        aria-hidden="true"
      />

      {/* Radial overlay for depth */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          Real-Time Inflation Intelligence for Fantasy Baseball Auction Drafts
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          Stop guessing. Start winning with tier-specific, position-aware inflation tracking.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-8 py-6 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
            aria-label="Get started with Auction Projections"
          >
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-emerald-500/50 hover:bg-emerald-500/10 text-white px-8 py-6 text-lg transition-all duration-200 hover:scale-105"
            aria-label="View product demo"
          >
            <Link to="/demo">View Demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
