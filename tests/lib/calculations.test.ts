import {
  calculateInflation,
  adjustPlayerValues,
  getValueIndicator,
  getInflationIndicator,
  calculateRosterNeeds,
  getPositionScarcity,
  calculateTeamProjectedStats,
} from '../../src/lib/calculations';
import type { LeagueSettings, Player, DraftedPlayer } from '../../src/lib/types';

describe('calculateInflation', () => {
  const mockLeagueSettings: LeagueSettings = {
    leagueName: 'Test League',
    couchManagerRoomId: 'test-room',
    numTeams: 12,
    budgetPerTeam: 260,
    rosterSpots: {
      C: 2,
      '1B': 1,
      '2B': 1,
      '3B': 1,
      SS: 1,
      OF: 5,
      CI: 1,
      MI: 1,
      UTIL: 1,
      SP: 6,
      RP: 3,
      P: 0,
      Bench: 5,
    },
    scoringType: 'rotisserie',
    projectionSystem: 'steamer',
  };

  test('should return small positive inflation when no players drafted', () => {
    const result = calculateInflation(mockLeagueSettings, []);
    // With no players drafted, money remaining equals total budget
    // Expected remaining value is slightly less (95% of budget)
    // So inflation will be slightly positive
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(0.1);
  });

  test('should return 0 when all players drafted', () => {
    const totalRosterSpots = Object.values(mockLeagueSettings.rosterSpots).reduce(
      (a, b) => a + b,
      0
    );
    const allDrafted: DraftedPlayer[] = Array(totalRosterSpots * mockLeagueSettings.numTeams)
      .fill(null)
      .map((_, i) => ({
        id: i.toString(),
        name: `Player ${i}`,
        team: 'TEST',
        positions: ['C'],
        projectedValue: 10,
        adjustedValue: 10,
        projectedStats: {},
        tier: 1,
        status: 'drafted' as const,
        draftedPrice: 10,
        draftedBy: 'Team',
      }));

    const result = calculateInflation(mockLeagueSettings, allDrafted);
    expect(result).toBe(0);
  });

  test('should calculate positive inflation when overspending', () => {
    const draftedPlayers: DraftedPlayer[] = [
      {
        id: '1',
        name: 'Mike Trout',
        team: 'LAA',
        positions: ['OF'],
        projectedValue: 50,
        adjustedValue: 50,
        projectedStats: { HR: 40, RBI: 100 },
        tier: 1,
        status: 'drafted',
        draftedPrice: 60,
        draftedBy: 'Team 1',
      },
    ];

    const result = calculateInflation(mockLeagueSettings, draftedPlayers);
    expect(result).toBeGreaterThan(0);
  });

  test('should handle large number of budget players', () => {
    const draftedPlayers: DraftedPlayer[] = Array(100)
      .fill(null)
      .map((_, i) => ({
        id: i.toString(),
        name: `Player ${i}`,
        team: 'TEST',
        positions: ['C'],
        projectedValue: 10,
        adjustedValue: 10,
        projectedStats: {},
        tier: 3,
        status: 'drafted' as const,
        draftedPrice: 1,
        draftedBy: 'Team',
      }));

    const result = calculateInflation(mockLeagueSettings, draftedPlayers);
    // With $1 players, lots of money remains for fewer remaining spots
    // This typically creates positive inflation
    expect(typeof result).toBe('number');
  });

  test('should round to 2 decimal places', () => {
    const draftedPlayers: DraftedPlayer[] = [
      {
        id: '1',
        name: 'Player 1',
        team: 'TEST',
        positions: ['OF'],
        projectedValue: 33,
        adjustedValue: 33,
        projectedStats: {},
        tier: 1,
        status: 'drafted',
        draftedPrice: 37,
        draftedBy: 'Team 1',
      },
    ];

    const result = calculateInflation(mockLeagueSettings, draftedPlayers);
    expect(result.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
  });
});

describe('adjustPlayerValues', () => {
  const mockPlayers: Player[] = [
    {
      id: '1',
      name: 'Player 1',
      team: 'TEST',
      positions: ['C'],
      projectedValue: 20,
      adjustedValue: 20,
      projectedStats: { HR: 25 },
      tier: 1,
      status: 'available',
    },
    {
      id: '2',
      name: 'Player 2',
      team: 'TEST',
      positions: ['OF'],
      projectedValue: 15,
      adjustedValue: 15,
      projectedStats: { HR: 20 },
      tier: 2,
      status: 'available',
    },
  ];

  test('should adjust values with positive inflation', () => {
    const result = adjustPlayerValues(mockPlayers, 0.2);
    expect(result[0].adjustedValue).toBe(24); // 20 * 1.2 = 24
    expect(result[1].adjustedValue).toBe(18); // 15 * 1.2 = 18
  });

  test('should adjust values with negative inflation', () => {
    const result = adjustPlayerValues(mockPlayers, -0.1);
    expect(result[0].adjustedValue).toBe(18); // 20 * 0.9 = 18
    expect(result[1].adjustedValue).toBe(14); // 15 * 0.9 = 13.5 rounded to 14
  });

  test('should handle zero inflation', () => {
    const result = adjustPlayerValues(mockPlayers, 0);
    expect(result[0].adjustedValue).toBe(20);
    expect(result[1].adjustedValue).toBe(15);
  });

  test('should round adjusted values to integers', () => {
    const result = adjustPlayerValues(mockPlayers, 0.15);
    result.forEach(player => {
      expect(player.adjustedValue).toBe(Math.round(player.adjustedValue));
    });
  });
});

describe('getValueIndicator', () => {
  test('should return "Great Deal" for 20% under value', () => {
    const result = getValueIndicator(16, 20);
    expect(result.label).toBe('Great Deal');
    expect(result.color).toBe('text-green-600');
    expect(result.percentage).toBe(-20);
  });

  test('should return "Fair Value" for 21-40% over value', () => {
    const result = getValueIndicator(25, 20); // 25% over value
    expect(result.label).toBe('Fair Value');
    expect(result.color).toBe('text-yellow-600');
  });

  test('should return "Slightly Expensive" for 41-60% over value', () => {
    const result = getValueIndicator(30, 20); // 50% over value
    expect(result.label).toBe('Slightly Expensive');
    expect(result.color).toBe('text-orange-600');
  });

  test('should return "Overpay" for over 60%', () => {
    const result = getValueIndicator(35, 20);
    expect(result.label).toBe('Overpay');
    expect(result.color).toBe('text-red-600');
  });

  test('should handle zero adjusted value', () => {
    const result = getValueIndicator(10, 0);
    expect(result.label).toBe('N/A');
    expect(result.color).toBe('text-gray-500');
    expect(result.percentage).toBe(0);
  });

  test('should calculate percentage correctly', () => {
    const result = getValueIndicator(30, 20);
    expect(result.percentage).toBe(50); // (30-20)/20 * 100 = 50%
  });
});

describe('getInflationIndicator', () => {
  test('should return "Low" for inflation < 5%', () => {
    const result = getInflationIndicator(0.04);
    expect(result.label).toBe('Low');
    expect(result.color).toBe('text-blue-600');
    expect(result.bgColor).toBe('bg-blue-100');
  });

  test('should return "Moderate" for inflation 5-14%', () => {
    const result = getInflationIndicator(0.1);
    expect(result.label).toBe('Moderate');
    expect(result.color).toBe('text-yellow-600');
    expect(result.bgColor).toBe('bg-yellow-100');
  });

  test('should return "High" for inflation 15-24%', () => {
    const result = getInflationIndicator(0.2);
    expect(result.label).toBe('High');
    expect(result.color).toBe('text-orange-600');
    expect(result.bgColor).toBe('bg-orange-100');
  });

  test('should return "Very High" for inflation >= 25%', () => {
    const result = getInflationIndicator(0.3);
    expect(result.label).toBe('Very High');
    expect(result.color).toBe('text-red-600');
    expect(result.bgColor).toBe('bg-red-100');
  });

  test('should handle negative inflation', () => {
    const result = getInflationIndicator(-0.1);
    expect(result.label).toBe('Low');
  });
});

describe('calculateRosterNeeds', () => {
  const mockLeagueSettings: LeagueSettings = {
    leagueName: 'Test League',
    couchManagerRoomId: 'test-room',
    numTeams: 12,
    budgetPerTeam: 260,
    rosterSpots: {
      C: 2,
      '1B': 1,
      '2B': 1,
      '3B': 1,
      SS: 1,
      OF: 5,
      CI: 1,
      MI: 1,
      UTIL: 1,
      SP: 6,
      RP: 3,
      P: 0,
      Bench: 5,
    },
    scoringType: 'rotisserie',
    projectionSystem: 'steamer',
  };

  test('should return full roster needs with empty roster', () => {
    const result = calculateRosterNeeds(mockLeagueSettings, []);
    expect(result).toEqual(mockLeagueSettings.rosterSpots);
  });

  test('should decrease position needs when player drafted', () => {
    const roster: DraftedPlayer[] = [
      {
        id: '1',
        name: 'Catcher',
        team: 'TEST',
        positions: ['C'],
        projectedValue: 10,
        adjustedValue: 10,
        projectedStats: {},
        tier: 1,
        status: 'onMyTeam',
        draftedPrice: 10,
        draftedBy: 'Me',
      },
    ];

    const result = calculateRosterNeeds(mockLeagueSettings, roster);
    expect(result.C).toBe(1); // 2 - 1 = 1
  });

  test('should use bench when position filled', () => {
    const roster: DraftedPlayer[] = [
      {
        id: '1',
        name: 'C1',
        team: 'TEST',
        positions: ['C'],
        projectedValue: 10,
        adjustedValue: 10,
        projectedStats: {},
        tier: 1,
        status: 'onMyTeam',
        draftedPrice: 10,
        draftedBy: 'Me',
      },
      {
        id: '2',
        name: 'C2',
        team: 'TEST',
        positions: ['C'],
        projectedValue: 10,
        adjustedValue: 10,
        projectedStats: {},
        tier: 1,
        status: 'onMyTeam',
        draftedPrice: 10,
        draftedBy: 'Me',
      },
      {
        id: '3',
        name: 'C3',
        team: 'TEST',
        positions: ['C'],
        projectedValue: 10,
        adjustedValue: 10,
        projectedStats: {},
        tier: 1,
        status: 'onMyTeam',
        draftedPrice: 10,
        draftedBy: 'Me',
      },
    ];

    const result = calculateRosterNeeds(mockLeagueSettings, roster);
    expect(result.C).toBe(0);
    expect(result.Bench).toBe(4); // 5 - 1 = 4
  });
});

describe('getPositionScarcity', () => {
  const mockPlayers: Player[] = [
    ...Array(30)
      .fill(null)
      .map((_, i) => ({
        id: i.toString(),
        name: `OF${i}`,
        team: 'TEST',
        positions: ['OF'],
        projectedValue: 10,
        adjustedValue: 10,
        projectedStats: {},
        tier: 2,
        status: 'available' as const,
      })),
    ...Array(5)
      .fill(null)
      .map((_, i) => ({
        id: (i + 30).toString(),
        name: `C${i}`,
        team: 'TEST',
        positions: ['C'],
        projectedValue: 10,
        adjustedValue: 10,
        projectedStats: {},
        tier: 2,
        status: 'available' as const,
      })),
  ];

  test('should return "low" scarcity when many players available', () => {
    const result = getPositionScarcity('OF', mockPlayers, 20);
    expect(result).toBe('low'); // 30 > 20 * 0.6 = 12
  });

  test('should return "high" scarcity when few players available', () => {
    const result = getPositionScarcity('C', mockPlayers, 20);
    expect(result).toBe('high'); // 5 < 20 * 0.3 = 6
  });

  test('should return "medium" scarcity for moderate availability', () => {
    const result = getPositionScarcity('C', mockPlayers, 10);
    expect(result).toBe('medium'); // 5 is between 3 and 6
  });

  test('should use default threshold of 20', () => {
    const result = getPositionScarcity('OF', mockPlayers);
    expect(result).toBe('low');
  });
});

describe('calculateTeamProjectedStats', () => {
  const mockRoster: DraftedPlayer[] = [
    {
      id: '1',
      name: 'Batter',
      team: 'TEST',
      positions: ['OF'],
      projectedValue: 20,
      adjustedValue: 20,
      projectedStats: { HR: 30, RBI: 90, SB: 15 },
      tier: 1,
      status: 'onMyTeam',
      draftedPrice: 25,
      draftedBy: 'Me',
    },
    {
      id: '2',
      name: 'Pitcher',
      team: 'TEST',
      positions: ['SP'],
      projectedValue: 15,
      adjustedValue: 15,
      projectedStats: { W: 12, K: 200, SV: 0 },
      tier: 1,
      status: 'onMyTeam',
      draftedPrice: 18,
      draftedBy: 'Me',
    },
  ];

  test('should sum all stats correctly', () => {
    const result = calculateTeamProjectedStats(mockRoster);
    expect(result.totalSpent).toBe(43);
    expect(result.projectedHR).toBe(30);
    expect(result.projectedRBI).toBe(90);
    expect(result.projectedSB).toBe(15);
    expect(result.projectedW).toBe(12);
    expect(result.projectedK).toBe(200);
    expect(result.projectedSV).toBe(0);
  });

  test('should handle empty roster', () => {
    const result = calculateTeamProjectedStats([]);
    expect(result.totalSpent).toBe(0);
    expect(result.projectedHR).toBe(0);
    expect(result.projectedRBI).toBe(0);
  });

  test('should handle missing stats gracefully', () => {
    const incompleteRoster: DraftedPlayer[] = [
      {
        id: '1',
        name: 'Player',
        team: 'TEST',
        positions: ['OF'],
        projectedValue: 10,
        adjustedValue: 10,
        projectedStats: {},
        tier: 1,
        status: 'onMyTeam',
        draftedPrice: 10,
        draftedBy: 'Me',
      },
    ];

    const result = calculateTeamProjectedStats(incompleteRoster);
    expect(result.totalSpent).toBe(10);
    expect(result.projectedHR).toBe(0);
  });
});
