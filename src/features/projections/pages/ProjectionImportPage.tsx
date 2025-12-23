/**
 * ProjectionImportPage Component
 *
 * Page for importing player projections into a league.
 * Provides tabs for different import sources: Fangraphs and Google Sheets.
 *
 * Story: 4.5 - Select and Load Fangraphs Projections
 * Story: 4.7 - Display Projection Source and Timestamp
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, FileSpreadsheet } from 'lucide-react';
import { ProjectionSystemSelector } from '../components/ProjectionSystemSelector';
import { ImportFromGoogleSheets } from '../components/ImportFromGoogleSheets';
import { ProjectionInfo } from '../components/ProjectionInfo';
import { ExportProjections } from '../components/ExportProjections';
import { useProjectionInfo } from '../hooks/useProjectionInfo';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';

/**
 * ProjectionImportPage Component
 *
 * Provides a unified interface for importing projections from different sources.
 * Users can choose between Fangraphs professional projections or their own
 * custom projections from Google Sheets.
 */
export function ProjectionImportPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const projectionInfo = useProjectionInfo(leagueId ?? '');
  const currentLeague = useLeagueStore(state => state.currentLeague);

  if (!leagueId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-slate-400">
          <p>No league selected. Please select a league first.</p>
          <Button
            variant="link"
            onClick={() => navigate('/leagues')}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Go to Leagues
          </Button>
        </div>
      </div>
    );
  }

  const handleBackToLeague = () => {
    navigate(`/leagues/${leagueId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBackToLeague}
          className="mb-4 text-slate-400 hover:text-slate-200 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to League
        </Button>

        <h1 className="text-2xl font-bold text-white mb-2">Import Projections</h1>
        <p className="text-slate-400">
          Import player projections for your draft. Choose from professional projection systems or
          import your own custom projections.
        </p>
      </div>

      {/* Current Projection Info */}
      {!projectionInfo.loading && (
        <div className="mb-6">
          <ProjectionInfo
            source={projectionInfo.source}
            updatedAt={projectionInfo.updatedAt}
            playerCount={projectionInfo.playerCount}
          />
          {projectionInfo.source && currentLeague && (
            <div className="mt-3">
              <ExportProjections leagueId={leagueId} leagueName={currentLeague.name} />
            </div>
          )}
        </div>
      )}

      {/* Import Tabs */}
      <Tabs defaultValue="fangraphs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger
            value="fangraphs"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Fangraphs
          </TabsTrigger>
          <TabsTrigger
            value="sheets"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Google Sheets
          </TabsTrigger>
        </TabsList>

        {/* Fangraphs Tab */}
        <TabsContent value="fangraphs" className="mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                Fangraphs Projections
              </CardTitle>
              <CardDescription className="text-slate-400">
                Load professional projections from Fangraphs. Choose from Steamer, BatX, or JA
                projection systems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectionSystemSelector leagueId={leagueId} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Sheets Tab */}
        <TabsContent value="sheets" className="mt-4">
          <ImportFromGoogleSheets leagueId={leagueId} />
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
        <h3 className="text-sm font-medium text-slate-200 mb-2">About Projection Sources</h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p>
            <strong className="text-slate-300">Fangraphs:</strong> Professional projection systems
            used by fantasy baseball analysts. Steamer is the most popular system, while BatX
            provides advanced batting analysis.
          </p>
          <p>
            <strong className="text-slate-300">Google Sheets:</strong> Import your own custom
            projections from a Google Sheets spreadsheet. Great for using proprietary or custom
            projection models.
          </p>
        </div>
      </div>
    </div>
  );
}
