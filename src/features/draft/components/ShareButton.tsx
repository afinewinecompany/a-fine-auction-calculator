/**
 * ShareButton Component
 *
 * Button for sharing draft results via Web Share API or clipboard.
 * Uses Web Share API for mobile devices and falls back to clipboard for desktop.
 *
 * Story: 12.5 - Show Competitive Advantage Summary
 */

import { useState, useCallback } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  /** Text to share */
  shareText: string;
  /** Optional callback when share is successful */
  onShare?: (method: 'webshare' | 'clipboard') => void;
}

/**
 * ShareButton provides sharing functionality with Web Share API and clipboard fallback.
 * Displays emerald gradient styling and shows confirmation after successful share.
 */
export function ShareButton({ shareText, onShare }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  /**
   * Check if Web Share API is available.
   */
  const canUseWebShare = useCallback(() => {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }, []);

  /**
   * Copy text to clipboard as fallback.
   */
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      onShare?.('clipboard');

      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [shareText, onShare]);

  /**
   * Handle share button click.
   * Tries Web Share API first, falls back to clipboard.
   */
  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      if (canUseWebShare()) {
        try {
          await navigator.share({
            text: shareText,
            title: 'My Auction Draft Results',
          });
          onShare?.('webshare');
        } catch (error) {
          // User cancelled or share failed - fall back to clipboard
          if ((error as Error).name !== 'AbortError') {
            await copyToClipboard();
          }
        }
      } else {
        // Web Share API not available, use clipboard
        await copyToClipboard();
      }
    } finally {
      setIsSharing(false);
    }
  }, [shareText, canUseWebShare, copyToClipboard, isSharing, onShare]);

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`
        inline-flex items-center gap-2
        px-6 py-3
        rounded-lg
        font-semibold text-white
        transition-all duration-200
        ${
          copied
            ? 'bg-emerald-600'
            : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'
        }
        ${isSharing ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
        shadow-lg shadow-emerald-500/25
        hover:shadow-emerald-500/40
      `}
      aria-label={copied ? 'Copied to clipboard' : 'Share your results'}
    >
      {copied ? (
        <>
          <Check className="w-5 h-5" />
          <span>Copied to clipboard!</span>
        </>
      ) : (
        <>
          {canUseWebShare() ? <Share2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          <span>Share your results</span>
        </>
      )}
    </button>
  );
}

export default ShareButton;
