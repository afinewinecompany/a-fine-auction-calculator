/**
 * HowItWorksSection Component
 *
 * Displays 4 steps showing the user journey with icons and timeline layout.
 * Horizontal layout on desktop, vertical on mobile.
 *
 * Story: 11.4 - Implement "How It Works" Section
 */

import { Settings, Link, BarChart3, Trophy } from 'lucide-react';

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}

function Step({ number, icon, title, description, isLast }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Connector line - hidden on first step and mobile */}
      {!isLast && (
        <div
          data-connector
          className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-emerald-500/30 to-emerald-500/10"
          aria-hidden="true"
        />
      )}

      <div className="relative mb-4">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 transition-all duration-300 hover:bg-emerald-500/20 hover:scale-105">
          {icon}
        </div>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
          {number}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      icon: <Settings className="w-7 h-7" />,
      title: 'Create your league and import projections',
      description:
        'Set up your league parameters and load player projection data from Google Sheets or Fangraphs.',
    },
    {
      icon: <Link className="w-7 h-7" />,
      title: 'Connect to Couch Managers draft room',
      description:
        'Enter your Couch Managers room ID to automatically sync draft picks in real-time.',
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: 'Monitor inflation-adjusted values in real-time',
      description: 'Watch as player values adjust based on remaining budget and draft activity.',
    },
    {
      icon: <Trophy className="w-7 h-7" />,
      title: 'Dominate your draft with competitive intelligence',
      description:
        'Make informed decisions with tier-specific and position-aware inflation insights.',
    },
  ];

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30"
      aria-label="How it works section"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Get started in minutes and gain the competitive advantage
          </p>
        </div>

        {/* 4 steps in a row on desktop, 2x2 on tablet, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
