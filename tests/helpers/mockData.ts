/**
 * Mock Data Generators for Testing
 *
 * These functions create mock data objects for use in tests.
 * Each generator accepts optional overrides to customize the mock data.
 */

/**
 * Creates a mock user object
 * @param overrides - Optional properties to override defaults
 * @returns Mock user object
 */
export const createMockUser = (overrides: Partial<{
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}> = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates a mock league object
 * @param overrides - Optional properties to override defaults
 * @returns Mock league object
 */
export const createMockLeague = (overrides: Partial<{
  id: string;
  userId: string;
  name: string;
  teamCount: number;
  budget: number;
  createdAt: string;
}> = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  userId: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test League',
  teamCount: 12,
  budget: 260,
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates a mock player object
 * @param overrides - Optional properties to override defaults
 * @returns Mock player object
 */
export const createMockPlayer = (overrides: Partial<{
  id: string;
  name: string;
  position: string;
  team: string;
  projectedValue: number;
}> = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174002',
  name: 'Test Player',
  position: 'OF',
  team: 'TEST',
  projectedValue: 25,
  ...overrides,
});
