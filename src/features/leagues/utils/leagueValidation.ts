/**
 * League Validation Utilities
 *
 * Zod validation schema and helper functions for league form fields.
 * Used with React Hook Form for form validation.
 *
 * Story: 3.2 - Implement Create League Form
 */

import { z } from 'zod';
import { LEAGUE_VALIDATION } from '../types/league.types';

/**
 * Zod schema for league form validation
 *
 * Validates all league form fields according to acceptance criteria:
 * - League name: required, 1-100 characters
 * - Team count: required, 8-20
 * - Budget: required, $100-$500
 * - Roster spots (hitters, pitchers, bench): optional, valid ranges
 * - Scoring type: optional, one of 5x5, 6x6, points
 */
export const leagueFormSchema = z.object({
  name: z
    .string()
    .min(LEAGUE_VALIDATION.name.minLength, 'League name is required')
    .max(
      LEAGUE_VALIDATION.name.maxLength,
      `League name must be ${LEAGUE_VALIDATION.name.maxLength} characters or less`
    )
    .transform(val => val.trim()),

  teamCount: z
    .number({
      required_error: 'Team count is required',
      invalid_type_error: 'Team count must be a number',
    })
    .int('Team count must be a whole number')
    .min(
      LEAGUE_VALIDATION.teamCount.min,
      `Team count must be at least ${LEAGUE_VALIDATION.teamCount.min}`
    )
    .max(
      LEAGUE_VALIDATION.teamCount.max,
      `Team count must be ${LEAGUE_VALIDATION.teamCount.max} or less`
    ),

  budget: z
    .number({
      required_error: 'Budget is required',
      invalid_type_error: 'Budget must be a number',
    })
    .int('Budget must be a whole number')
    .min(LEAGUE_VALIDATION.budget.min, `Budget must be at least $${LEAGUE_VALIDATION.budget.min}`)
    .max(LEAGUE_VALIDATION.budget.max, `Budget must be $${LEAGUE_VALIDATION.budget.max} or less`),

  rosterSpotsHitters: z
    .number()
    .int('Roster spots must be a whole number')
    .min(LEAGUE_VALIDATION.rosterSpots.min, 'Roster spots cannot be negative')
    .max(
      LEAGUE_VALIDATION.rosterSpots.maxHitters,
      `Hitter spots must be ${LEAGUE_VALIDATION.rosterSpots.maxHitters} or less`
    )
    .nullable()
    .optional(),

  rosterSpotsPitchers: z
    .number()
    .int('Roster spots must be a whole number')
    .min(LEAGUE_VALIDATION.rosterSpots.min, 'Roster spots cannot be negative')
    .max(
      LEAGUE_VALIDATION.rosterSpots.maxPitchers,
      `Pitcher spots must be ${LEAGUE_VALIDATION.rosterSpots.maxPitchers} or less`
    )
    .nullable()
    .optional(),

  rosterSpotsBench: z
    .number()
    .int('Roster spots must be a whole number')
    .min(LEAGUE_VALIDATION.rosterSpots.min, 'Roster spots cannot be negative')
    .max(
      LEAGUE_VALIDATION.rosterSpots.maxBench,
      `Bench spots must be ${LEAGUE_VALIDATION.rosterSpots.maxBench} or less`
    )
    .nullable()
    .optional(),

  scoringType: z.enum(['5x5', '6x6', 'points']).nullable().optional(),
});

/**
 * Type inferred from Zod schema for form data
 */
export type LeagueFormData = z.infer<typeof leagueFormSchema>;

/**
 * Default form values for league creation
 */
export const defaultLeagueFormValues: LeagueFormData = {
  name: '',
  teamCount: LEAGUE_VALIDATION.teamCount.default,
  budget: LEAGUE_VALIDATION.budget.default,
  rosterSpotsHitters: null,
  rosterSpotsPitchers: null,
  rosterSpotsBench: null,
  scoringType: null,
};

/**
 * Parse optional number field from form input
 * Converts empty string to null, otherwise parses as integer
 *
 * @param value - Input value (string or number)
 * @returns Parsed number or null
 */
export const parseOptionalNumber = (value: string | number | null | undefined): number | null => {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(parsed) ? null : parsed;
};
