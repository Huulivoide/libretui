import { EventEmitter } from 'node:events';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import * as LibreService from './LibreService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type DataListener = (readings: ReadonlyArray<GlucoseReading>) => void;
type ErrorListener = (message: string) => void;

// ─── State ────────────────────────────────────────────────────────────────────

const emitter = new EventEmitter();
let timer: ReturnType<typeof setInterval> | null = null;
let latestReadings: ReadonlyArray<GlucoseReading> | null = null;

// ─── Internal ────────────────────────────────────────────────────────────────

async function poll(): Promise<void> {
  try {
    const readings = await LibreService.fetchReadings();
    latestReadings = readings;
    emitter.emit('data', readings);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Poll error';
    emitter.emit('error', message);
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
  latestReadings = null;
}

export function on(event: 'data', listener: DataListener): void;
export function on(event: 'error', listener: ErrorListener): void;
export function on(
  event: 'data' | 'error',
  listener: DataListener | ErrorListener,
): void {
  emitter.on(event, listener);
  if (event === 'data' && latestReadings !== null) {
    (listener as DataListener)(latestReadings);
  }
}

export function off(event: 'data', listener: DataListener): void;
export function off(event: 'error', listener: ErrorListener): void;
export function off(
  event: 'data' | 'error',
  listener: DataListener | ErrorListener,
): void {
  emitter.off(event, listener);
}
