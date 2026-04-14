import { type GlucoseReading } from 'libre-link-unofficial-api';
import * as LibreService from './LibreService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type DataListener = (readings: ReadonlyArray<GlucoseReading>) => void;
type ErrorListener = (message: string) => void;

type PollerEvents = {
  readonly data: Set<DataListener>;
  readonly error: Set<ErrorListener>;
};

// ─── State ────────────────────────────────────────────────────────────────────

const listeners: PollerEvents = {
  data: new Set(),
  error: new Set(),
};

let timer: ReturnType<typeof setInterval> | null = null;

// ─── Internal ────────────────────────────────────────────────────────────────

async function poll(): Promise<void> {
  try {
    const readings = await LibreService.fetchReadings();
    for (const listener of listeners.data) {
      listener(readings);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Poll error';
    for (const listener of listeners.error) {
      listener(message);
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

const DEFAULT_INTERVAL_MS = 60_000;

export function start(intervalMs: number = DEFAULT_INTERVAL_MS): void {
  if (timer !== null) {
    return;
  }
  void poll();
  timer = setInterval(() => {
    void poll();
  }, intervalMs);
}

export function stop(): void {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

export function on(event: 'data', listener: DataListener): void;
export function on(event: 'error', listener: ErrorListener): void;
export function on(
  event: 'data' | 'error',
  listener: DataListener | ErrorListener,
): void {
  if (event === 'data') {
    listeners.data.add(listener as DataListener);
  } else {
    listeners.error.add(listener as ErrorListener);
  }
}

export function off(event: 'data', listener: DataListener): void;
export function off(event: 'error', listener: ErrorListener): void;
export function off(
  event: 'data' | 'error',
  listener: DataListener | ErrorListener,
): void {
  if (event === 'data') {
    listeners.data.delete(listener as DataListener);
  } else {
    listeners.error.delete(listener as ErrorListener);
  }
}
