/**
 * ExportProjections Component
 *
 * Dropdown menu for exporting projection data to CSV or JSON format.
 *
 * Story: 4.8 - Export Projections for Offline Analysis
 */

import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjections } from '../hooks/useProjections';
import { exportToCSV, exportToJSON, sanitizeFilename } from '../utils/exportProjections';
import { format } from 'date-fns';

interface ExportProjectionsProps {
  leagueId: string;
  leagueName: string;
}

/**
 * Export button with dropdown for CSV and JSON export options
 *
 * Exports all projection data for a league to the selected format.
 * Uses client-side generation (no server roundtrip).
 */
export function ExportProjections({ leagueId, leagueName }: ExportProjectionsProps) {
  const [exporting, setExporting] = useState(false);
  const { projections, isLoading } = useProjections(leagueId);

  const handleExport = (formatType: 'csv' | 'json') => {
    if (!projections || projections.length === 0) return;

    setExporting(true);

    try {
      const date = format(new Date(), 'yyyy-MM-dd');
      const sanitizedLeagueName = sanitizeFilename(leagueName);
      const filename = `${sanitizedLeagueName}_Projections_${date}`;

      if (formatType === 'csv') {
        exportToCSV(projections, filename);
      } else {
        exportToJSON(projections, filename);
      }

      toast.success(`Projections exported as ${formatType.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export projections. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const hasProjections = projections && projections.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading || !hasProjections || exporting}
          className="border-slate-700"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-900 border-slate-700">
        <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="cursor-pointer">
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
