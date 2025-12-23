/**
 * Import From Google Sheets Component
 *
 * Allows users to import player projections from a selected Google Sheet
 *
 * Story: 4.3 - Import Projections from Google Sheets
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SheetSelector } from './SheetSelector';
import { supabase } from '@/lib/supabase';
import { useGoogleSheetsAuth } from '../hooks/useGoogleSheetsAuth';
import { GoogleSheetsConnect } from './GoogleSheetsConnect';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import type { ImportResult, ImportError } from '../utils/sheetValidation';
import { getSheetFormatHelp } from '../utils/sheetValidation';

interface ImportFromGoogleSheetsProps {
  leagueId: string;
  onImportComplete?: (importedCount: number) => void;
}

type ImportStatus = 'idle' | 'importing' | 'success' | 'error' | 'partial';

export function ImportFromGoogleSheets({
  leagueId,
  onImportComplete,
}: ImportFromGoogleSheetsProps) {
  const { isConnected, isLoading: isCheckingConnection } = useGoogleSheetsAuth();
  const [selectedSheet, setSelectedSheet] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSheetSelect = (sheetId: string, sheetName: string) => {
    setSelectedSheet({ id: sheetId, name: sheetName });
    // Reset previous import state
    setResult(null);
    setStatus('idle');
    setErrorMessage(null);
  };

  const handleImport = async () => {
    if (!selectedSheet) return;

    setImporting(true);
    setProgress(10);
    setStatus('importing');
    setErrorMessage(null);
    setResult(null);

    try {
      // Progress: 10% - Starting import request
      setProgress(30);

      const { data, error } = await supabase.functions.invoke('import-google-sheet', {
        body: {
          sheetId: selectedSheet.id,
          leagueId,
          range: 'A:Z',
        },
      });

      // Progress: 90% - Processing response
      setProgress(90);

      if (error) {
        throw new Error(error.message || 'Import failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      // Progress: 100% - Complete
      setProgress(100);

      // Determine status based on results
      if (data.imported === 0) {
        setStatus('error');
        setErrorMessage('No valid rows found to import');
      } else if (data.errors && data.errors.length > 0) {
        setStatus('partial');
      } else {
        setStatus('success');
      }

      // Notify parent component
      if (onImportComplete && data.imported > 0) {
        onImportComplete(data.imported);
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Import failed');
      setProgress(0);
    } finally {
      setImporting(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (): 'default' | 'destructive' | undefined => {
    switch (status) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Show connection UI if not connected
  if (isCheckingConnection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import from Google Sheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking connection...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import from Google Sheets
          </CardTitle>
          <CardDescription>
            Connect your Google account to import projections from your spreadsheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSheetsConnect />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import from Google Sheets
        </CardTitle>
        <CardDescription>
          Select a spreadsheet and import your custom player projections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sheet Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Spreadsheet</label>
          <SheetSelector onSelect={handleSheetSelect} disabled={importing} />
        </div>

        {/* Selected Sheet Info */}
        {selectedSheet && (
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium">{selectedSheet.name}</span>
          </div>
        )}

        {/* Help Section */}
        <Collapsible open={showHelp} onOpenChange={setShowHelp}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto">
              <HelpCircle className="h-4 w-4" />
              <span>Expected sheet format</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showHelp ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Alert className="mt-2">
              <AlertDescription className="whitespace-pre-line text-xs">
                {getSheetFormatHelp()}
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>

        {/* Import Button */}
        <Button onClick={handleImport} disabled={!selectedSheet || importing} className="w-full">
          {importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Projections
            </>
          )}
        </Button>

        {/* Progress Indicator */}
        {importing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              {progress < 30 && 'Connecting to Google Sheets...'}
              {progress >= 30 && progress < 90 && 'Reading and validating projections...'}
              {progress >= 90 && 'Saving to database...'}
            </p>
          </div>
        )}

        {/* Result Alert */}
        {status !== 'idle' && status !== 'importing' && (
          <Alert variant={getStatusVariant()}>
            <div className="flex items-start gap-2">
              {getStatusIcon()}
              <div className="flex-1">
                <AlertTitle>
                  {status === 'success' && 'Import Successful'}
                  {status === 'partial' && 'Import Completed with Warnings'}
                  {status === 'error' && 'Import Failed'}
                </AlertTitle>
                <AlertDescription>
                  {result && result.imported > 0 && (
                    <p>Imported {result.imported} player projections</p>
                  )}
                  {result && result.duration_ms && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed in {(result.duration_ms / 1000).toFixed(2)}s
                    </p>
                  )}
                  {errorMessage && <p>{errorMessage}</p>}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Error Details */}
        {result && result.errors && result.errors.length > 0 && (
          <Collapsible open={showErrors} onOpenChange={setShowErrors}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-1">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {result.errors.length} row{result.errors.length > 1 ? 's' : ''} skipped
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showErrors ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 max-h-48 overflow-y-auto rounded-md border p-2">
                <ul className="space-y-1 text-sm">
                  {result.errors.slice(0, 10).map((err: ImportError, i: number) => (
                    <li key={i} className="text-muted-foreground">
                      <span className="font-medium">Row {err.row}:</span> {err.message}
                    </li>
                  ))}
                  {result.errors.length > 10 && (
                    <li className="text-muted-foreground italic">
                      ...and {result.errors.length - 10} more errors
                    </li>
                  )}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
