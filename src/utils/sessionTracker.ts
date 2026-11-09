/**
 * Lightweight Client-Side Session & Activity Telemetry Tracker.
 * Manages unique session ID lifecycle (10m inactivity timeout)
 * and dispatches non-blocking fire-and-forget event payloads.
 */

const SESSION_KEY = 'EduJunction_telemetry_session_id';
const LAST_ACTIVE_KEY = 'EduJunction_telemetry_last_active';
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generates a unique, high-entropy session ID string.
 * Format: sess_<timestamp>_<randomHex>
 */
function generateSessionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return `sess_${ts}_${rand}`;
}

/**
 * Returns active session ID, rotating it if user was inactive for > 10 mins.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'sess_server_node';

  const now = Date.now();
  const lastActiveStr = sessionStorage.getItem(LAST_ACTIVE_KEY);
  const existingSession = sessionStorage.getItem(SESSION_KEY);

  if (lastActiveStr && existingSession) {
    const elapsed = now - Number(lastActiveStr);
    if (elapsed < INACTIVITY_TIMEOUT_MS) {
      sessionStorage.setItem(LAST_ACTIVE_KEY, String(now));
      return existingSession;
    }
  }

  // Rotate to new session
  const newSessionId = generateSessionId();
  sessionStorage.setItem(SESSION_KEY, newSessionId);
  sessionStorage.setItem(LAST_ACTIVE_KEY, String(now));
  return newSessionId;
}

/**
 * Refreshes user activity timestamp to keep session active.
 */
export function recordHeartbeat(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
}

export interface TrackEventPayload {
  eventName: string;
  category?: 'NAVIGATION' | 'AUTH' | 'EXAM' | 'BILLING' | 'FEATURE' | 'SYSTEM';
  inputPayload?: any;
  resultSummary?: any;
  status?: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'CANCELLED';
  executionTimeMs?: number;
  errorMessage?: string;
}

/**
 * Dispatches an event via non-blocking fire-and-forget fetch with keepalive: true.
 * Never throws exceptions, never blocks main UI thread.
 */
export function trackEvent({
  eventName,
  category = 'NAVIGATION',
  inputPayload,
  resultSummary,
  status = 'SUCCESS',
  executionTimeMs = 0,
  errorMessage,
}: TrackEventPayload): void {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getOrCreateSessionId();
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/track/event`;

    const body = JSON.stringify({
      sessionId,
      eventName,
      category,
      inputPayload,
      resultSummary,
      status,
      executionTimeMs,
      errorMessage,
    });

    // Direct non-blocking fetch with keepalive delivers instant real-time dispatch without beacon delays
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body,
      keepalive: true,
    }).catch(() => {
      // Silently pass
    });
  } catch {
    // Ignore any tracking failures
  }
}

