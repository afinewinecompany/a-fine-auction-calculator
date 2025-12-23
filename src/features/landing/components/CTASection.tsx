/**
 * CTASection Component
 *
 * Final section with primary CTA buttons to drive conversions.
 * Uses gradient styling with emerald-to-green theme and accessible buttons.
 *
 * Story: 11.5 - Implement Call-to-Action Buttons
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" aria-label="Call to action section">
      <div className="max-w-4xl mx-auto text-center">
        {/* Gradient card background for visual emphasis */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 rounded-2xl p-8 sm:p-12 border border-emerald-500/20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Dominate Your Draft?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Join fantasy managers who are already using real-time inflation intelligence to find
            value their competitors miss.
          </p>

          {/* CTA Buttons with proper styling and accessibility */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

          <p className="mt-6 text-slate-500 text-sm">No credit card required. Free during beta.</p>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
