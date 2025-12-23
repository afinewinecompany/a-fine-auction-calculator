/**
 * Share Text Generator Tests
 *
 * Tests for generating pre-filled social media text for sharing draft results.
 *
 * Story: 12.5 - Show Competitive Advantage Summary
 */

import { describe, it, expect } from 'vitest';
import { generateShareText, type ShareTextOptions } from '@/features/draft/utils/shareText';

describe('generateShareText', () => {
  it('should generate share text with positive net value', () => {
    const options: ShareTextOptions = {
      netValue: 42,
      stealsCount: 8,
      overpaysCount: 2,
      leagueName: 'My Fantasy League',
    };

    const result = generateShareText(options);

    expect(result).toContain('$42');
    expect(result).toContain('8 steals');
    expect(result).toContain('Auction Projections');
  });

  it('should include hashtags', () => {
    const options: ShareTextOptions = {
      netValue: 25,
      stealsCount: 5,
      overpaysCount: 1,
    };

    const result = generateShareText(options);

    expect(result).toContain('#FantasyBaseball');
    expect(result).toContain('#AuctionDraft');
  });

  it('should include product mention', () => {
    const options: ShareTextOptions = {
      netValue: 30,
      stealsCount: 6,
      overpaysCount: 2,
    };

    const result = generateShareText(options);

    expect(result).toMatch(/Auction Projections/i);
  });

  it('should be under 280 characters for Twitter/X', () => {
    const options: ShareTextOptions = {
      netValue: 999,
      stealsCount: 99,
      overpaysCount: 99,
      leagueName: 'My Super Long Fantasy Baseball League Name 2024',
    };

    const result = generateShareText(options);

    expect(result.length).toBeLessThanOrEqual(280);
  });

  it('should handle zero net value', () => {
    const options: ShareTextOptions = {
      netValue: 0,
      stealsCount: 3,
      overpaysCount: 3,
    };

    const result = generateShareText(options);

    expect(result).toContain('matched market value');
  });

  it('should handle negative net value', () => {
    const options: ShareTextOptions = {
      netValue: -15,
      stealsCount: 2,
      overpaysCount: 5,
    };

    const result = generateShareText(options);

    expect(result).toContain('auction draft');
    // Should still be positive messaging
    expect(result).not.toContain('-$');
  });

  it('should include steals count in share text', () => {
    const options: ShareTextOptions = {
      netValue: 50,
      stealsCount: 12,
      overpaysCount: 1,
    };

    const result = generateShareText(options);

    expect(result).toContain('12');
    expect(result).toMatch(/steals?/i);
  });

  it('should handle singular steal', () => {
    const options: ShareTextOptions = {
      netValue: 10,
      stealsCount: 1,
      overpaysCount: 0,
    };

    const result = generateShareText(options);

    expect(result).toContain('1 steal');
    expect(result).not.toContain('1 steals');
  });

  it('should work without league name', () => {
    const options: ShareTextOptions = {
      netValue: 30,
      stealsCount: 5,
      overpaysCount: 2,
    };

    const result = generateShareText(options);

    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include league name when provided', () => {
    const options: ShareTextOptions = {
      netValue: 40,
      stealsCount: 7,
      overpaysCount: 1,
      leagueName: 'Dynasty Legends',
    };

    const result = generateShareText(options);

    expect(result).toContain('Dynasty Legends');
  });
});

describe('generateShareText edge cases', () => {
  it('should handle very high net value', () => {
    const options: ShareTextOptions = {
      netValue: 150,
      stealsCount: 20,
      overpaysCount: 0,
    };

    const result = generateShareText(options);

    expect(result).toContain('$150');
    expect(result.length).toBeLessThanOrEqual(280);
  });

  it('should handle zero steals and overpays', () => {
    const options: ShareTextOptions = {
      netValue: 0,
      stealsCount: 0,
      overpaysCount: 0,
    };

    const result = generateShareText(options);

    expect(result).toBeTruthy();
    expect(result).toContain('Auction Projections');
  });

  it('should truncate very long league name to fit character limit', () => {
    const options: ShareTextOptions = {
      netValue: 50,
      stealsCount: 10,
      overpaysCount: 2,
      leagueName:
        'The Most Amazing Super Awesome Incredible Fantasy Baseball League of Champions 2024 World Series Edition',
    };

    const result = generateShareText(options);

    expect(result.length).toBeLessThanOrEqual(280);
  });
});
