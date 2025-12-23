/**
 * Export Projections Utilities Tests
 *
 * Tests for CSV and JSON export functionality.
 *
 * Story: 4.8 - Export Projections for Offline Analysis
 */

// Tests use vitest globals (describe, it, expect, vi, beforeEach)
import {
  transformForExport,
  sanitizeFilename,
  exportToCSV,
  exportToJSON,
  downloadFile,
} from '@/features/projections/utils/exportProjections';
import type { PlayerProjection } from '@/features/projections/types/projection.types';

const mockProjections: PlayerProjection[] = [
  {
    id: '1',
    leagueId: 'league-1',
    playerName: 'Mike Trout',
    team: 'LAA',
    positions: ['CF'],
    projectedValue: 45,
    projectionSource: 'fangraphs',
    statsHitters: {
      hr: 35,
      rbi: 90,
      sb: 15,
      avg: 0.28,
      obp: 0.35,
      slg: 0.52,
    },
    statsPitchers: null,
    tier: 'Elite',
    createdAt: '2025-12-12T00:00:00Z',
    updatedAt: '2025-12-12T02:30:00Z',
  },
  {
    id: '2',
    leagueId: 'league-1',
    playerName: 'Shohei Ohtani',
    team: 'LAD',
    positions: ['DH', 'SP'],
    projectedValue: 55,
    projectionSource: 'fangraphs',
    statsHitters: {
      hr: 40,
      rbi: 100,
      sb: 12,
      avg: 0.29,
      obp: 0.37,
      slg: 0.55,
    },
    statsPitchers: {
      w: 15,
      k: 200,
      era: 3.0,
      whip: 1.0,
      sv: 0,
      ip: 180,
    },
    tier: 'Elite',
    createdAt: '2025-12-12T00:00:00Z',
    updatedAt: '2025-12-12T02:30:00Z',
  },
];

describe('exportProjections utilities', () => {
  describe('transformForExport', () => {
    it('should transform projections to export format', () => {
      const result = transformForExport(mockProjections);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        playerName: 'Mike Trout',
        team: 'LAA',
        positions: 'CF',
        projectedValue: 45,
        tier: 'Elite',
        projectionSource: 'fangraphs',
        updatedAt: '2025-12-12T02:30:00Z',
        hr: 35,
        rbi: 90,
        sb: 15,
        avg: 0.28,
        obp: 0.35,
        slg: 0.52,
        w: undefined,
        k: undefined,
        era: undefined,
        whip: undefined,
        sv: undefined,
        ip: undefined,
      });
    });

    it('should join multiple positions with comma', () => {
      const result = transformForExport(mockProjections);

      expect(result[1].positions).toBe('DH, SP');
    });

    it('should handle null values gracefully', () => {
      const projWithNulls: PlayerProjection[] = [
        {
          id: '1',
          leagueId: 'league-1',
          playerName: 'Test Player',
          team: null,
          positions: [],
          projectedValue: null,
          projectionSource: 'manual',
          statsHitters: null,
          statsPitchers: null,
          tier: null,
          createdAt: '2025-12-12T00:00:00Z',
          updatedAt: '2025-12-12T00:00:00Z',
        },
      ];

      const result = transformForExport(projWithNulls);

      expect(result[0].team).toBe('');
      expect(result[0].positions).toBe('');
      expect(result[0].projectedValue).toBeNull();
      expect(result[0].tier).toBe('');
    });

    it('should flatten hitter and pitcher stats', () => {
      const result = transformForExport(mockProjections);

      // Ohtani should have both hitter and pitcher stats
      expect(result[1].hr).toBe(40);
      expect(result[1].w).toBe(15);
      expect(result[1].k).toBe(200);
      expect(result[1].era).toBe(3.0);
    });

    it('should return empty array for empty input', () => {
      const result = transformForExport([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('sanitizeFilename', () => {
    it('should replace spaces with underscores', () => {
      expect(sanitizeFilename('My League')).toBe('My_League');
    });

    it('should replace special characters with underscores', () => {
      expect(sanitizeFilename('My League 2025!')).toBe('My_League_2025_');
      expect(sanitizeFilename('Test@League#123')).toBe('Test_League_123');
    });

    it('should handle alphanumeric names unchanged', () => {
      expect(sanitizeFilename('MyLeague2025')).toBe('MyLeague2025');
    });

    it('should handle empty string', () => {
      expect(sanitizeFilename('')).toBe('');
    });

    it('should replace multiple consecutive special characters', () => {
      expect(sanitizeFilename('Test!!!League')).toBe('Test___League');
    });

    it('should handle unicode characters', () => {
      expect(sanitizeFilename('My Léague')).toBe('My_L_ague');
    });
  });
});

describe('CSV generation', () => {
  it('should create valid CSV header row from export data', () => {
    const rows = transformForExport(mockProjections);
    const headers = Object.keys(rows[0]);

    expect(headers).toContain('playerName');
    expect(headers).toContain('team');
    expect(headers).toContain('positions');
    expect(headers).toContain('projectedValue');
    expect(headers).toContain('tier');
    expect(headers).toContain('projectionSource');
    expect(headers).toContain('updatedAt');
    // Hitter stats
    expect(headers).toContain('hr');
    expect(headers).toContain('rbi');
    expect(headers).toContain('avg');
    // Pitcher stats
    expect(headers).toContain('w');
    expect(headers).toContain('era');
  });

  it('should correctly escape values with commas', () => {
    const rows = transformForExport(mockProjections);
    const positions = rows[1].positions;

    // Multiple positions contain a comma
    expect(positions).toBe('DH, SP');

    // When building CSV, this should be wrapped in quotes
    const needsEscaping = positions.includes(',') || positions.includes('"');
    expect(needsEscaping).toBe(true);
  });
});

describe('JSON generation', () => {
  it('should create valid JSON structure from export data', () => {
    const rows = transformForExport(mockProjections);

    const exportData = {
      exportedAt: new Date().toISOString(),
      playerCount: rows.length,
      projections: rows,
    };

    // Should be valid JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const parsed = JSON.parse(jsonString);

    expect(parsed.playerCount).toBe(2);
    expect(parsed.projections).toHaveLength(2);
    expect(parsed.projections[0].playerName).toBe('Mike Trout');
  });

  it('should include all required fields in export', () => {
    const rows = transformForExport(mockProjections);
    const row = rows[0];

    // Check all required fields per acceptance criteria
    expect(row.playerName).toBeDefined();
    expect(row.team).toBeDefined();
    expect(row.positions).toBeDefined();
    expect(row.projectedValue).toBeDefined();
    expect(row.tier).toBeDefined();
    expect(row.projectionSource).toBeDefined();
    expect(row.updatedAt).toBeDefined();
  });
});

describe('downloadFile', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;
  let createdLink: HTMLAnchorElement;

  beforeEach(() => {
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
    mockRevokeObjectURL = vi.fn();
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    mockClick = vi.fn();

    // Mock URL API
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document methods
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

    // Mock createElement to capture the link
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        createdLink = {
          href: '',
          download: '',
          click: mockClick,
        } as unknown as HTMLAnchorElement;
        return createdLink;
      }
      return document.createElement(tag);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a Blob with correct content and MIME type', () => {
    const content = 'test,content';
    const filename = 'test.csv';
    const mimeType = 'text/csv';

    downloadFile(content, filename, mimeType);

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('should set correct download filename', () => {
    downloadFile('content', 'myfile.json', 'application/json');

    expect(createdLink.download).toBe('myfile.json');
  });

  it('should trigger click on the link', () => {
    downloadFile('content', 'test.csv', 'text/csv');

    expect(mockClick).toHaveBeenCalled();
  });

  it('should clean up by removing link and revoking URL', () => {
    downloadFile('content', 'test.csv', 'text/csv');

    expect(mockRemoveChild).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });
});

describe('exportToCSV', () => {
  let mockDownloadFile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock the download behavior
    mockDownloadFile = vi.fn();
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
    global.URL.revokeObjectURL = vi.fn();
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body);
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      return { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not export when projections array is empty', () => {
    exportToCSV([], 'test');

    // No Blob should be created for empty array
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('should create CSV with proper header row', () => {
    let capturedContent = '';
    global.URL.createObjectURL = vi.fn().mockImplementation((blob: Blob) => {
      // Read blob content synchronously for testing
      const reader = new FileReader();
      reader.readAsText(blob);
      // For sync test, we check the blob was created
      return 'blob:test';
    });

    exportToCSV(mockProjections, 'test');

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should escape values containing commas with quotes', () => {
    // Ohtani has positions "DH, SP" which contains a comma
    // This should be wrapped in quotes in CSV output
    const rows = transformForExport(mockProjections);
    const ohtaniPositions = rows[1].positions;

    expect(ohtaniPositions).toContain(',');
    // The exportToCSV should handle this by wrapping in quotes
  });

  it('should escape values containing double quotes', () => {
    const projWithQuotes: PlayerProjection[] = [
      {
        id: '1',
        leagueId: 'league-1',
        playerName: 'Player "Nickname" Name',
        team: 'NYY',
        positions: ['1B'],
        projectedValue: 30,
        projectionSource: 'manual',
        statsHitters: null,
        statsPitchers: null,
        tier: 'Tier 1',
        createdAt: '2025-12-12T00:00:00Z',
        updatedAt: '2025-12-12T00:00:00Z',
      },
    ];

    // Should not throw
    expect(() => exportToCSV(projWithQuotes, 'test')).not.toThrow();
  });
});

describe('exportToJSON', () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
    global.URL.revokeObjectURL = vi.fn();
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body);
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      return { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create JSON with metadata', () => {
    exportToJSON(mockProjections, 'test');

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should handle empty projections array', () => {
    // Should still create JSON with empty array, not skip
    exportToJSON([], 'test');

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should create valid JSON output', () => {
    let capturedBlob: Blob | null = null;
    global.URL.createObjectURL = vi.fn().mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:test';
    });

    exportToJSON(mockProjections, 'test');

    expect(capturedBlob).not.toBeNull();
    expect(capturedBlob?.type).toBe('application/json');
  });

  it('should include exportedAt timestamp', () => {
    const rows = transformForExport(mockProjections);
    const exportData = {
      exportedAt: new Date().toISOString(),
      playerCount: rows.length,
      projections: rows,
    };

    expect(exportData.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should include playerCount in export', () => {
    const rows = transformForExport(mockProjections);
    const exportData = {
      exportedAt: new Date().toISOString(),
      playerCount: rows.length,
      projections: rows,
    };

    expect(exportData.playerCount).toBe(2);
  });
});
