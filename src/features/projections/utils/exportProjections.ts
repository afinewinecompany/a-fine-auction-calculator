/**
 * Export Projections Utilities
 *
 * Client-side utilities for exporting projection data to CSV and JSON formats.
 *
 * Story: 4.8 - Export Projections for Offline Analysis
 */

import type { PlayerProjection } from '../types/projection.types';

/**
 * Flattened projection row for export
 */
export interface ExportRow {
  playerName: string;
  team: string;
  positions: string;
  projectedValue: number | null;
  tier: string;
  projectionSource: string;
  updatedAt: string;
  // Hitter stats
  hr?: number;
  rbi?: number;
  sb?: number;
  avg?: number;
  obp?: number;
  slg?: number;
  // Pitcher stats
  w?: number;
  k?: number;
  era?: number;
  whip?: number;
  sv?: number;
  ip?: number;
}

/**
 * Transform PlayerProjection array to flattened export format
 *
 * Flattens nested stats objects and joins arrays for export.
 *
 * @param projections - Array of PlayerProjection objects
 * @returns Array of ExportRow objects
 */
export function transformForExport(projections: PlayerProjection[]): ExportRow[] {
  return projections.map(p => ({
    playerName: p.playerName,
    team: p.team ?? '',
    positions: p.positions?.join(', ') ?? '',
    projectedValue: p.projectedValue,
    tier: p.tier ?? '',
    projectionSource: p.projectionSource,
    updatedAt: p.updatedAt,
    // Flatten hitter stats
    hr: p.statsHitters?.hr,
    rbi: p.statsHitters?.rbi,
    sb: p.statsHitters?.sb,
    avg: p.statsHitters?.avg,
    obp: p.statsHitters?.obp,
    slg: p.statsHitters?.slg,
    // Flatten pitcher stats
    w: p.statsPitchers?.w,
    k: p.statsPitchers?.k,
    era: p.statsPitchers?.era,
    whip: p.statsPitchers?.whip,
    sv: p.statsPitchers?.sv,
    ip: p.statsPitchers?.ip,
  }));
}

/**
 * Sanitize filename by replacing non-alphanumeric characters with underscores
 *
 * @param filename - Original filename string
 * @returns Sanitized filename safe for file systems
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, '_');
}

/**
 * Export projections to CSV format and trigger download
 *
 * Generates a properly formatted CSV file with headers from data structure.
 * Handles comma and quote escaping in string values.
 *
 * @param projections - Array of PlayerProjection objects to export
 * @param filename - Base filename without extension
 */
export function exportToCSV(projections: PlayerProjection[], filename: string): void {
  const rows = transformForExport(projections);

  if (rows.length === 0) return;

  // Get headers from first row keys
  const headers = Object.keys(rows[0]) as (keyof ExportRow)[];

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Escape commas and quotes in string values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        })
        .join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

/**
 * Export projections to JSON format and trigger download
 *
 * Generates a structured JSON file with metadata and pretty printing.
 *
 * @param projections - Array of PlayerProjection objects to export
 * @param filename - Base filename without extension
 */
export function exportToJSON(projections: PlayerProjection[], filename: string): void {
  const rows = transformForExport(projections);

  const exportData = {
    exportedAt: new Date().toISOString(),
    playerCount: rows.length,
    projections: rows,
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * Create a Blob and trigger file download in the browser
 *
 * Uses the standard Blob and URL.createObjectURL APIs for client-side download.
 * Exported for testability.
 *
 * @param content - File content as string
 * @param filename - Complete filename with extension
 * @param mimeType - MIME type for the Blob
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
