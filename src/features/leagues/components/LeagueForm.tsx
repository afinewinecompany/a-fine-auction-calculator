/**
 * LeagueForm Component
 *
 * Form for creating or editing a fantasy baseball league configuration.
 * Uses React Hook Form with Zod validation and shadcn/ui components.
 *
 * Story: 3.2 - Implement Create League Form
 * Story: 3.4 - Implement Edit League Settings
 *
 * Form Fields:
 * 1. League Name (required)
 * 2. Team Count (required, 8-20)
 * 3. Budget (required, $100-$500)
 * 4. Roster Spots - Hitters (optional)
 * 5. Roster Spots - Pitchers (optional)
 * 6. Roster Spots - Bench (optional)
 * 7. Scoring Type (optional: 5x5, 6x6, points)
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useCreateLeague, useUpdateLeague, useLeague } from '../hooks/useLeagues';
import { useLeagueStore } from '../stores/leagueStore';
import {
  leagueFormSchema,
  defaultLeagueFormValues,
  parseOptionalNumber,
  type LeagueFormData,
} from '../utils/leagueValidation';
import { LEAGUE_VALIDATION, type UpdateLeagueRequest } from '../types/league.types';

/**
 * LeagueForm props
 */
interface LeagueFormProps {
  /** Form mode: 'create' or 'edit' */
  mode?: 'create' | 'edit';
  /** League ID when in edit mode (alternative to using route params) */
  leagueId?: string;
  /** Optional callback after successful creation/update */
  onSuccess?: () => void;
  /** Optional callback on cancel */
  onCancel?: () => void;
}

/**
 * LeagueForm component for creating or editing leagues
 *
 * @example
 * ```tsx
 * // Create mode (default)
 * <LeagueForm
 *   onSuccess={() => toast.success('League created!')}
 *   onCancel={() => navigate('/leagues')}
 * />
 *
 * // Edit mode
 * <LeagueForm
 *   mode="edit"
 *   leagueId="league-123"
 *   onSuccess={() => toast.success('League updated!')}
 * />
 * ```
 */
export function LeagueForm({
  mode = 'create',
  leagueId: propLeagueId,
  onSuccess,
  onCancel,
}: LeagueFormProps) {
  const navigate = useNavigate();
  const { leagueId: routeLeagueId } = useParams<{ leagueId: string }>();
  const leagueId = propLeagueId || routeLeagueId;

  // Create mode hooks
  const {
    createLeague,
    isCreating,
    error: createError,
    clearError: clearCreateError,
  } = useCreateLeague();

  // Edit mode hooks
  const {
    league: currentLeague,
    isLoading,
    error: loadError,
    clearError: clearLoadError,
  } = useLeague(mode === 'edit' ? leagueId : undefined);
  const {
    updateLeague,
    isUpdating,
    error: updateError,
    clearError: clearUpdateError,
  } = useUpdateLeague();

  const [formError, setFormError] = useState<string | null>(null);
  const isEditMode = mode === 'edit';

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<LeagueFormData>({
    resolver: zodResolver(leagueFormSchema),
    defaultValues: defaultLeagueFormValues,
  });

  // Pre-populate form when league data loads in edit mode
  // Includes stale data protection - only populate if currentLeague matches requested leagueId
  useEffect(() => {
    if (isEditMode && currentLeague && currentLeague.id === leagueId) {
      form.reset({
        name: currentLeague.name,
        teamCount: currentLeague.teamCount,
        budget: currentLeague.budget,
        rosterSpotsHitters: currentLeague.rosterSpotsHitters ?? null,
        rosterSpotsPitchers: currentLeague.rosterSpotsPitchers ?? null,
        rosterSpotsBench: currentLeague.rosterSpotsBench ?? null,
        scoringType: currentLeague.scoringType ?? null,
      });
    }
  }, [isEditMode, currentLeague, leagueId, form]);

  // Clear errors based on mode
  const clearError = () => {
    setFormError(null);
    if (isEditMode) {
      clearLoadError();
      clearUpdateError();
    } else {
      clearCreateError();
    }
  };

  // Combined store error
  const storeError = isEditMode ? loadError || updateError : createError;

  /**
   * Handle form submission
   */
  const onSubmit = async (data: LeagueFormData) => {
    setFormError(null);
    clearError();

    try {
      if (isEditMode && leagueId) {
        // Edit mode - update existing league
        const updateData: UpdateLeagueRequest = {
          name: data.name.trim(),
          team_count: data.teamCount,
          budget: data.budget,
          roster_spots_hitters: data.rosterSpotsHitters,
          roster_spots_pitchers: data.rosterSpotsPitchers,
          roster_spots_bench: data.rosterSpotsBench,
          scoring_type: data.scoringType,
        };

        const success = await updateLeague(leagueId, updateData);

        if (success) {
          onSuccess?.();
          // TODO: Navigate to /leagues/${leagueId} when league detail page is implemented (Story 3.6)
          navigate('/leagues');
        } else {
          // Get fresh error from store
          const currentError = useLeagueStore.getState().error;
          if (currentError) {
            setFormError(currentError);
          }
        }
      } else {
        // Create mode - create new league
        const newLeague = await createLeague(data, { redirectToList: true });

        if (newLeague) {
          onSuccess?.();
        } else {
          // Get fresh error from store to avoid stale closure reference
          const currentError = useLeagueStore.getState().error;
          if (currentError) {
            setFormError(currentError);
          }
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} league`;
      setFormError(message);
    }
  };

  /**
   * Handle cancel button
   */
  const handleCancel = () => {
    form.reset();
    clearError();
    onCancel?.();
  };

  // Combined error display
  const displayError = formError || storeError;

  // Loading state disabled flag
  const isSubmitting = isEditMode ? isUpdating : isCreating;

  // Loading state for edit mode - fetching league data
  if (isEditMode && isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-slate-900 border-slate-800">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-slate-400">Loading league data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state for edit mode - league not found after loading completes
  // Note: We only check !currentLeague && !isLoading, not loadError, because the store's
  // error state is shared across all operations. Using loadError here would incorrectly
  // show the error screen when an update fails (loadError would contain update error).
  if (isEditMode && !currentLeague && !isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-slate-900 border-slate-800">
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-red-400 mb-4">League not found</p>
            <Button
              asChild
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Link to="/leagues">Back to Leagues</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-2xl text-white">
          {isEditMode ? 'Edit League' : 'Create New League'}
        </CardTitle>
        <CardDescription className="text-slate-400">
          {isEditMode
            ? 'Update your league settings before the draft.'
            : 'Set up your fantasy baseball league with custom settings for your draft.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* League Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">League Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter league name (e.g., 2025 Main League)"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={fieldState.error ? 'name-error' : undefined}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500">
                    A unique name to identify your league
                  </FormDescription>
                  <FormMessage id="name-error" className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Team Count and Budget - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Count Field */}
              <FormField
                control={form.control}
                name="teamCount"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Team Count *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        min={LEAGUE_VALIDATION.teamCount.min}
                        max={LEAGUE_VALIDATION.teamCount.max}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.error ? 'teamCount-error' : undefined}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      {LEAGUE_VALIDATION.teamCount.min}-{LEAGUE_VALIDATION.teamCount.max} teams
                    </FormDescription>
                    <FormMessage id="teamCount-error" className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Budget Field */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Budget *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          $
                        </span>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          min={LEAGUE_VALIDATION.budget.min}
                          max={LEAGUE_VALIDATION.budget.max}
                          disabled={isSubmitting}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.error ? 'budget-error' : undefined}
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 pl-7"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      ${LEAGUE_VALIDATION.budget.min}-${LEAGUE_VALIDATION.budget.max} per team
                    </FormDescription>
                    <FormMessage id="budget-error" className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Roster Spots Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200">Roster Configuration</h3>
              <p className="text-sm text-slate-500">
                Optional: Configure roster spots for your league
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Roster Spots - Hitters */}
                <FormField
                  control={form.control}
                  name="rosterSpotsHitters"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Hitters</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 14"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseOptionalNumber(e.target.value))}
                          min={LEAGUE_VALIDATION.rosterSpots.min}
                          max={LEAGUE_VALIDATION.rosterSpots.maxHitters}
                          disabled={isSubmitting}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={
                            fieldState.error ? 'rosterSpotsHitters-error' : undefined
                          }
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
                        />
                      </FormControl>
                      <FormMessage id="rosterSpotsHitters-error" className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Roster Spots - Pitchers */}
                <FormField
                  control={form.control}
                  name="rosterSpotsPitchers"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Pitchers</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 9"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseOptionalNumber(e.target.value))}
                          min={LEAGUE_VALIDATION.rosterSpots.min}
                          max={LEAGUE_VALIDATION.rosterSpots.maxPitchers}
                          disabled={isSubmitting}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={
                            fieldState.error ? 'rosterSpotsPitchers-error' : undefined
                          }
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
                        />
                      </FormControl>
                      <FormMessage id="rosterSpotsPitchers-error" className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Roster Spots - Bench */}
                <FormField
                  control={form.control}
                  name="rosterSpotsBench"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Bench</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 3"
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseOptionalNumber(e.target.value))}
                          min={LEAGUE_VALIDATION.rosterSpots.min}
                          max={LEAGUE_VALIDATION.rosterSpots.maxBench}
                          disabled={isSubmitting}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={fieldState.error ? 'rosterSpotsBench-error' : undefined}
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
                        />
                      </FormControl>
                      <FormMessage id="rosterSpotsBench-error" className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Scoring Type Field */}
            <FormField
              control={form.control}
              name="scoringType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Scoring Type</FormLabel>
                  <Select
                    onValueChange={value => field.onChange(value === 'none' ? null : value)}
                    value={field.value || 'none'}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500">
                        <SelectValue placeholder="Select scoring type (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="none" className="text-slate-400">
                        Not specified
                      </SelectItem>
                      <SelectItem value="5x5" className="text-white">
                        5x5 (Standard Roto)
                      </SelectItem>
                      <SelectItem value="6x6" className="text-white">
                        6x6 (Extended Roto)
                      </SelectItem>
                      <SelectItem value="points" className="text-white">
                        Points League
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-slate-500">
                    Optional: Select the scoring format for your league
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Error Display */}
            {displayError && (
              <div className="p-4 rounded-md bg-red-900/20 border border-red-900/50">
                <p className="text-sm text-red-400" role="alert">
                  {displayError}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Saving Changes...' : 'Creating League...'}
                  </>
                ) : isEditMode ? (
                  'Save Changes'
                ) : (
                  'Create League'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default LeagueForm;
