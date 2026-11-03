import { EntebbeEvent } from '../types';

export interface GoogleTaskItem {
  id?: string;
  title: string;
  notes?: string;
  due?: string; // RFC 3339 timestamp
  status?: 'needsAction' | 'completed';
}

/**
 * Creates an event reminder task in the user's Google Tasks @default list.
 */
export async function createGoogleTaskForEvent(
  accessToken: string,
  event: EntebbeEvent,
  ticketId?: string
): Promise<{ success: boolean; task?: GoogleTaskItem; error?: string }> {
  try {
    if (!accessToken) {
      throw new Error('Google access token is missing. Please sign in with Google first.');
    }

    const taskTitle = `🎟️ Kesho: Attend ${event.title}`;
    const notes = [
      `Venue: ${event.venue.name} (${event.venue.address})`,
      `Time: ${event.timeStr} on ${event.dateStr}`,
      `Ticket Pass: ${ticketId ? `Ref #${ticketId}` : 'Digital Ticket'}`,
      `Admission: ${event.isFree ? 'Free Admission' : `UGX ${event.priceUGX.toLocaleString()}`}`,
      `Details: ${event.description}`,
      `Booked via Kesho (kesho.com) - Entebbe Nightlife & Events`,
    ].join('\n');

    // Convert rawDate to RFC 3339 string if possible
    let dueStr: string | undefined;
    try {
      if (event.rawDate) {
        const d = new Date(event.rawDate);
        if (!isNaN(d.getTime())) {
          dueStr = d.toISOString();
        }
      }
    } catch {
      // ignore date parse fallback
    }

    const payload: GoogleTaskItem = {
      title: taskTitle,
      notes,
      status: 'needsAction',
      ...(dueStr ? { due: dueStr } : {}),
    };

    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Google Tasks API error:', res.status, errBody);
      return { success: false, error: `Google Tasks error (${res.status}): ${errBody}` };
    }

    const createdTask = await res.json();
    return { success: true, task: createdTask };
  } catch (err: any) {
    console.error('Failed to create Google Task:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
