/**
 * Sheet Validation Utilities
 *
 * Client-side validation helpers for Google Sheets import
 *
 * Story: 4.3 - Import Projections from Google Sheets
 */

// Valid MLB positions
export const VALID_POSITIONS = [
  'C',
  '1B',
  '2B',
  '3B',
  'SS',
  'OF',
  'CF',
  'LF',
  'RF',
  'DH',
  'SP',
  'RP',
  'P',
  'UTIL',
] as const;

export type ValidPosition = (typeof VALID_POSITIONS)[number];

// Stat fields for hitters and pitchers
export const HITTER_STAT_FIELDS = ['hr', 'rbi', 'sb', 'avg', 'obp', 'slg', 'runs', 'hits'] as const;
export const PITCHER_STAT_FIELDS = ['w', 'k', 'era', 'whip', 'sv', 'ip'] as const;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportResult {
  imported: number;
  errors: ImportError[];
  duration_ms: number;
}

/**
 * Check if a position is valid
 */
export function isValidPosition(position: string): position is ValidPosition {
  return VALID_POSITIONS.includes(position.toUpperCase() as ValidPosition);
}

/**
 * Parse and validate a position string (comma or slash separated)
 */
export function parsePositions(positionsStr: string): string[] {
  if (!positionsStr) return [];

  return positionsStr
    .split(/[,\/]/)
    .map(p => p.trim().toUpperCase())
    .filter(isValidPosition);
}

/**
 * Format errors for display
 */
export function formatImportErrors(errors: ImportError[], maxDisplay: number = 5): string {
  if (errors.length === 0) return '';

  const displayed = errors.slice(0, maxDisplay);
  const lines = displayed.map(err => `Row ${err.row}: ${err.message}`);

  if (errors.length > maxDisplay) {
    lines.push(`...and ${errors.length - maxDisplay} more errors`);
  }

  return lines.join('\n');
}

/**
 * Expected column headers for reference
 */
export const EXPECTED_COLUMNS = {
  required: ['Player Name'],
  optional: [
    'Team',
    'Positions',
    'Value',
    // Hitter stats
    'HR',
    'RBI',
    'SB',
    'AVG',
    'OBP',
    'SLG',
    'R',
    'H',
    // Pitcher stats
    'W',
    'K',
    'ERA',
    'WHIP',
    'SV',
    'IP',
  ],
} as const;

/**
 * Get a help message about expected sheet format
 */
export function getSheetFormatHelp(): string {
  return `Expected sheet format:
- Required columns: ${EXPECTED_COLUMNS.required.join(', ')}
- Optional columns: ${EXPECTED_COLUMNS.optional.join(', ')}
- First row must be column headers
- Position values should be: ${VALID_POSITIONS.join(', ')}
- Multiple positions can be separated by comma or slash`;
}
