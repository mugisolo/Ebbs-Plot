import { EntebbeEvent } from '../types';

export interface ShareEventResult {
  method: 'web-share' | 'clipboard' | 'cancelled' | 'error';
  message: string;
}

/**
 * Builds a shareable deep link and formatted summary for an Entebbe event
 */
export function buildEventSharePayload(event: EntebbeEvent) {
  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://kesho.ug';
  const shareUrl = `${baseUrl}?event=${encodeURIComponent(event.id)}`;
  const priceLabel = event.isFree
    ? 'Free Admission'
    : `UGX ${event.priceUGX.toLocaleString()}`;

  const shareTitle = `${event.title} · Kesho Entebbe`;
  const shareText = `Join me at "${event.title}" in Entebbe!\nVenue: ${event.venue.name} (${event.venue.area}, Entebbe)\nWhen: ${event.dateStr} (${event.timeStr})\nAdmission: ${priceLabel}`;

  return {
    title: shareTitle,
    text: shareText,
    url: shareUrl,
  };
}

/**
 * Shares an Entebbe event using the native Web Share API (navigator.share)
 * with an automatic clipboard fallback for desktop browsers.
 */
export async function shareEntebbeEvent(event: EntebbeEvent): Promise<ShareEventResult> {
  const payload = buildEventSharePayload(event);

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const shareData: ShareData = {
        title: payload.title,
        text: payload.text,
        url: payload.url,
      };

      // Check canShare if available
      if (typeof navigator.canShare !== 'function' || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return {
          method: 'web-share',
          message: `Shared "${event.title}" via Web Share!`,
        };
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          method: 'cancelled',
          message: 'Share cancelled',
        };
      }
      // Fall through to clipboard fallback if Web Share is blocked by iframe permissions
    }
  }

  // Fallback: copy formatted details + deep link to clipboard
  try {
    const fullCopy = `${payload.text}\n${payload.url}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullCopy);
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = fullCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    return {
      method: 'clipboard',
      message: `Event link copied to clipboard for "${event.title}"!`,
    };
  } catch {
    return {
      method: 'error',
      message: 'Unable to share event link right now.',
    };
  }
}
