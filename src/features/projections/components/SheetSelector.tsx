/**
 * Sheet Selector Component
 *
 * Allows users to select a Google Sheet from their Drive
 *
 * Story: 4.2 - Implement Google Sheets OAuth Integration
 */

import { useState, useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

interface Sheet {
  id: string;
  name: string;
  mimeType: string;
}

interface SheetSelectorProps {
  onSelect: (sheetId: string, sheetName: string) => void;
  disabled?: boolean;
}

export function SheetSelector({ onSelect, disabled = false }: SheetSelectorProps) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSheets() {
      try {
        const { data, error } = await getSupabase().functions.invoke('google-oauth', {
          body: { action: 'list-sheets' },
        });

        if (error) throw error;

        setSheets(data?.sheets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sheets');
      } finally {
        setLoading(false);
      }
    }

    loadSheets();
  }, []);

  const handleValueChange = (value: string) => {
    const sheet = sheets.find(s => s.id === value);
    if (sheet) {
      onSelect(sheet.id, sheet.name);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading sheets...</span>
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No spreadsheets found in your Google Drive.</p>
    );
  }

  return (
    <Select onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a spreadsheet" />
      </SelectTrigger>
      <SelectContent>
        {sheets.map(sheet => (
          <SelectItem key={sheet.id} value={sheet.id}>
            {sheet.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
