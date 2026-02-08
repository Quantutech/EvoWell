type EvoLogEventType = 'intent' | 'deep-link' | 'safety' | 'escalation';

interface EvoLogEvent {
  type: EvoLogEventType;
  role?: string;
  intent?: string;
  path?: string;
  success?: boolean;
  reason?: string;
  timestamp?: string;
}

const STORAGE_KEY = 'evowell_evo_logs_v1';
const MAX_LOG_ENTRIES = 150;

function readLogs(): EvoLogEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: EvoLogEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-MAX_LOG_ENTRIES)));
  } catch {
    // Ignore storage failures.
  }
}

export function logEvoEvent(event: EvoLogEvent) {
  const sanitized: EvoLogEvent = {
    type: event.type,
    role: event.role,
    intent: event.intent,
    path: event.path,
    success: event.success,
    reason: event.reason,
    timestamp: new Date().toISOString(),
  };

  const logs = readLogs();
  logs.push(sanitized);
  writeLogs(logs);
}

