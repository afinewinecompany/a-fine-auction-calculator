/**
 * OnboardingModal Component
 *
 * Multi-step modal that appears on first login to explain core features.
 * Displays welcome message and explains:
 * 1. Inflation Tracking
 * 2. Adjusted Values
 * 3. Tier Assignments
 *
 * Story: 11.6 - Create Basic Onboarding Flow
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Layers, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

/**
 * OnboardingModal displays welcome and feature explanations
 *
 * @example
 * ```tsx
 * <OnboardingModal
 *   open={showOnboarding}
 *   onComplete={handleOnboardingComplete}
 * />
 * ```
 */
export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {step === 0 && 'Welcome to Auction Projections!'}
            {step === 1 && 'Inflation Tracking'}
            {step === 2 && 'Adjusted Values'}
            {step === 3 && 'Tier Assignments'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-2 mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-400 text-center">
            Step {step + 1} of {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        <div className="py-6">
          {step === 0 && <WelcomeStep />}
          {step === 1 && <InflationTrackingStep />}
          {step === 2 && <AdjustedValuesStep />}
          {step === 3 && <TierAssignmentsStep />}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleSkip} className="text-slate-400">
            Skip
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>{step < totalSteps - 1 ? 'Next' : 'Get Started'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Welcome Step - Introduction
 */
function WelcomeStep() {
  return (
    <div className="space-y-4 text-slate-300">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-slate-800 rounded-full">
          <Sparkles className="w-12 h-12 text-blue-400" />
        </div>
      </div>
      <p className="text-lg text-center">
        Get ready to dominate your fantasy baseball auction draft with real-time inflation tracking
        and dynamic player valuations.
      </p>
      <p className="text-center text-slate-400">
        Let's walk through the three core features that give you an edge over your competition.
      </p>
    </div>
  );
}

/**
 * Inflation Tracking Step
 */
function InflationTrackingStep() {
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-slate-800 rounded-full">
          <TrendingUp className="w-12 h-12 text-green-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white text-center mb-4">
        Real-Time Inflation Tracking
      </h3>
      <div className="space-y-3 text-slate-300">
        <p>
          As top players are drafted, the remaining budget inflates the value of available players.
          We track this inflation in real-time.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Current Inflation Rate:</span>
            <span className="text-green-400 font-semibold">+15%</span>
          </div>
          <p className="text-sm text-slate-400">
            This means players are selling for 15% more than their pre-draft projected value.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Adjusted Values Step
 */
function AdjustedValuesStep() {
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-slate-800 rounded-full">
          <DollarSign className="w-12 h-12 text-yellow-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white text-center mb-4">Dynamic Adjusted Values</h3>
      <div className="space-y-3 text-slate-300">
        <p>
          We automatically recalculate each player's value based on current market conditions, so
          you always know what they're truly worth RIGHT NOW.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Original Value:</span>
            <span className="text-slate-300">$25</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Adjusted Value:</span>
            <span className="text-yellow-400 font-semibold">$29</span>
          </div>
          <p className="text-sm text-slate-400">
            The adjusted value reflects current inflation and scarcity.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Tier Assignments Step
 */
function TierAssignmentsStep() {
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-slate-800 rounded-full">
          <Layers className="w-12 h-12 text-purple-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white text-center mb-4">Smart Tier Assignments</h3>
      <div className="space-y-3 text-slate-300">
        <p>
          Players are grouped into value tiers, making it easy to identify when you're getting a
          steal or overpaying for a player.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-medium">
              Tier 1
            </span>
            <span className="text-slate-400">Elite players ($30+)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-medium">
              Tier 2
            </span>
            <span className="text-slate-400">Premium players ($20-$29)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
              Tier 3
            </span>
            <span className="text-slate-400">Quality players ($10-$19)</span>
          </div>
          <p className="text-sm text-slate-400 pt-2">
            Color-coded tiers help you spot value opportunities instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
