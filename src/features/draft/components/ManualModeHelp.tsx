/**
 * ManualModeHelp Component
 *
 * Modal/dialog explaining how to use Manual Sync Mode when automatic
 * API sync fails. Provides clear instructions for manual bid entry.
 *
 * Story: 10.2 - Enable Manual Sync Mode
 *
 * Features:
 * - Clear step-by-step instructions
 * - Visual guide for manual entry workflow
 * - Dark theme styling matching the app
 * - Accessible dialog with proper ARIA labels
 */

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Props for ManualModeHelp component
 */
export interface ManualModeHelpProps {
  /** Whether the dialog is open (controlled mode) */
  open?: boolean;
  /** Callback when open state changes (controlled mode) */
  onOpenChange?: (open: boolean) => void;
  /** Use as a trigger button (uncontrolled mode) */
  asTrigger?: boolean;
}

/**
 * ManualModeHelp Component
 *
 * Renders a help dialog explaining the manual sync mode workflow.
 * Can be used as a standalone button or controlled externally.
 *
 * @example
 * ```tsx
 * // As a trigger button
 * <ManualModeHelp asTrigger />
 *
 * // Controlled from external state
 * <ManualModeHelp open={isOpen} onOpenChange={setIsOpen} />
 * ```
 */
export function ManualModeHelp({ open, onOpenChange, asTrigger = false }: ManualModeHelpProps) {
  const content = (
    <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-slate-100">
      <DialogHeader>
        <DialogTitle className="text-xl text-slate-100 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-yellow-400" />
          Manual Sync Mode
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          How to enter auction prices manually when automatic sync is unavailable.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Introduction */}
        <p className="text-sm text-slate-300">
          When the connection to the draft room is lost, Manual Sync Mode allows you to continue
          tracking the draft by entering bids yourself.
        </p>

        {/* Step-by-step instructions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">How it works:</h3>

          <ol className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-medium">
                1
              </span>
              <span>
                <strong className="text-slate-100">Enter the winning bid</strong> in the
                &quot;Bid&quot; column when a player is drafted. Press Enter or click away to
                submit.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-medium">
                2
              </span>
              <span>
                <strong className="text-slate-100">Check &quot;My Team&quot;</strong> if you won the
                player. This tracks your roster and remaining budget.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-medium">
                3
              </span>
              <span>
                <strong className="text-slate-100">Inflation updates automatically</strong> as you
                enter each pick, keeping your value calculations accurate.
              </span>
            </li>
          </ol>
        </div>

        {/* Tips */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-2">
            Tips
          </h4>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Use the search bar to quickly find players as they&apos;re nominated</li>
            <li>• Focus on entering your picks first, then catch up on others</li>
            <li>• The app will try to reconnect automatically in the background</li>
          </ul>
        </div>

        {/* Reconnection info */}
        <p className="text-xs text-slate-500 italic">
          When connection is restored, Manual Mode will be disabled and automatic sync will resume.
        </p>
      </div>
    </DialogContent>
  );

  // Controlled mode (open/onOpenChange provided)
  if (open !== undefined || onOpenChange !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {content}
      </Dialog>
    );
  }

  // Trigger mode (self-contained button)
  if (asTrigger) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 gap-1.5"
          >
            <HelpCircle className="h-4 w-4" />
            How to use Manual Mode
          </Button>
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  // Default: just the content (for embedding)
  return content;
}

export default ManualModeHelp;
