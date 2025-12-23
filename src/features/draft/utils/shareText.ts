/**
 * Share Text Generator
 *
 * Generates pre-filled social media text for sharing draft results.
 * Optimized for Twitter/X with 280 character limit.
 *
 * Story: 12.5 - Show Competitive Advantage Summary
 */

/**
 * Options for generating share text.
 */
export interface ShareTextOptions {
  /** Net value gained (positive) or lost (negative) */
  netValue: number;
  /** Number of steals captured */
  stealsCount: number;
  /** Number of overpays made */
  overpaysCount: number;
  /** Optional league name to include */
  leagueName?: string;
}

/** Maximum character count for Twitter/X */
const TWITTER_CHAR_LIMIT = 280;

/** Hashtags to include in share text */
const HASHTAGS = '#FantasyBaseball #AuctionDraft';

/** Product mention for viral loop */
const PRODUCT_MENTION = 'using Auction Projections';

/**
 * Generate share text for social media.
 * Creates a positive, accomplishment-focused message regardless of net value.
 *
 * @param options - Share text configuration
 * @returns Formatted share text under 280 characters
 */
export function generateShareText(options: ShareTextOptions): string {
  const { netValue, stealsCount, leagueName } = options;

  // Build the share message based on performance
  let message: string;

  if (netValue > 0) {
    // Positive net value - celebrate the win
    const stealText = stealsCount === 1 ? '1 steal' : `${stealsCount} steals`;
    message = leagueName
      ? `Just crushed my ${leagueName} auction draft! Found $${netValue} in value with ${stealText} ${PRODUCT_MENTION}! ${HASHTAGS}`
      : `Just crushed my auction draft! Found $${netValue} in value with ${stealText} ${PRODUCT_MENTION}! ${HASHTAGS}`;
  } else if (netValue === 0) {
    // Zero net value - matched market
    message = leagueName
      ? `Completed my ${leagueName} auction draft and matched market value perfectly ${PRODUCT_MENTION}! ${HASHTAGS}`
      : `Completed my auction draft and matched market value perfectly ${PRODUCT_MENTION}! ${HASHTAGS}`;
  } else {
    // Negative net value - focus on the experience, not the loss
    const stealText = stealsCount === 1 ? '1 steal' : `${stealsCount} steals`;
    message = leagueName
      ? `Wrapped up my ${leagueName} auction draft with ${stealText} ${PRODUCT_MENTION}! ${HASHTAGS}`
      : `Wrapped up my auction draft with ${stealText} ${PRODUCT_MENTION}! ${HASHTAGS}`;
  }

  // Ensure we're under the character limit
  if (message.length > TWITTER_CHAR_LIMIT) {
    // Truncate league name if too long
    return truncateToFit(message, leagueName);
  }

  return message;
}

/**
 * Truncate message to fit within Twitter character limit.
 * Removes or shortens league name if needed.
 *
 * @param message - Original message
 * @param leagueName - League name that might need truncation
 * @returns Truncated message under 280 characters
 */
function truncateToFit(message: string, leagueName?: string): string {
  if (!leagueName) {
    // Can't truncate league name, just cut the message
    return message.substring(0, TWITTER_CHAR_LIMIT - 3) + '...';
  }

  // Try progressively shorter versions
  const maxLeagueLength = Math.max(
    10,
    leagueName.length - (message.length - TWITTER_CHAR_LIMIT) - 3
  );

  if (maxLeagueLength < 10) {
    // League name too long, remove it entirely
    return message.replace(leagueName, 'my league').substring(0, TWITTER_CHAR_LIMIT);
  }

  const truncatedLeague = leagueName.substring(0, maxLeagueLength) + '...';
  return message.replace(leagueName, truncatedLeague);
}
