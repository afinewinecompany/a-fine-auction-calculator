/**
 * ProjectionSystemSelector Component
 *
 * Allows users to select a Fangraphs projection system and load projections
 * for their league. Displays progress during loading and success/error feedback.
 *
 * Story: 4.5 - Select and Load Fangraphs Projections
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useLoadFangraphsProjections } from '../hooks/useLoadFangraphsProjections';

type ProjectionSystem = 'steamer' | 'batx' | 'ja';

interface ProjectionSystemOption {
  value: ProjectionSystem;
  label: string;
  description: string;
}

const SYSTEMS: ProjectionSystemOption[] = [
  {
    value: 'steamer',
    label: 'Steamer',
    description: 'Industry-standard projections',
  },
  {
    value: 'batx',
    label: 'BatX',
    description: 'Advanced batting analysis',
  },
  {
    value: 'ja',
    label: 'JA',
    description: 'Custom projection system',
  },
];

interface ProjectionSystemSelectorProps {
  leagueId: string;
}

/**
 * Get progress stage description based on current progress percentage
 */
function getProgressStage(progress: number): string {
  if (progress < 40) return 'Fetching hitters...';
  if (progress < 70) return 'Fetching pitchers...';
  if (progress < 85) return 'Processing data...';
  if (progress < 100) return 'Saving projections...';
  return 'Complete!';
}

/**
 * ProjectionSystemSelector Component
 *
 * Provides a dropdown to select Fangraphs projection systems (Steamer, BatX, JA)
 * and a button to load the selected projections into the league.
 */
export function ProjectionSystemSelector({ leagueId }: ProjectionSystemSelectorProps) {
  const [selectedSystem, setSelectedSystem] = useState<ProjectionSystem | null>(null);
  const { loadProjections, isLoading, progress, result, error } = useLoadFangraphsProjections();

  const handleLoad = async () => {
    if (!selectedSystem) return;
    await loadProjections(leagueId, selectedSystem);
  };

  return (
    <div className="space-y-4">
      {/* System Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">Projection System</label>
        <Select
          value={selectedSystem ?? undefined}
          onValueChange={value => setSelectedSystem(value as ProjectionSystem)}
          disabled={isLoading}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
            <SelectValue placeholder="Select a projection system" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {SYSTEMS.map(system => (
              <SelectItem
                key={system.value}
                value={system.value}
                className="text-slate-200 focus:bg-slate-800 focus:text-slate-100"
              >
                <div className="flex flex-col py-1">
                  <span className="font-medium">{system.label}</span>
                  <span className="text-xs text-slate-400">{system.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Load Button */}
      <Button
        onClick={handleLoad}
        disabled={!selectedSystem || isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Projections...
          </>
        ) : (
          'Load Projections'
        )}
      </Button>

      {/* Progress Indicator */}
      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-slate-400 text-center">{getProgressStage(progress)}</p>
        </div>
      )}

      {/* Success Message */}
      {result && !isLoading && (
        <Alert className="bg-emerald-900/20 border-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertDescription className="text-emerald-200">
            Loaded {result.count} projections from Fangraphs {result.system}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
