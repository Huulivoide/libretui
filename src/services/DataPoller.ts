import { EventEmitter } from 'node:events';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import * as LibreService from './LibreService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type DataListener = (readings: ReadonlyArray<GlucoseReading>) => void;
type ErrorListener = (message: string) => void;

// ─── Class ────────────────────────────────────────────────────────────────────

const DEFAULT_INTERVAL_MS = 60_000;

class DataPoller extends EventEmitter {
  #timer: ReturnType<typeof setInterval> | null = null;
  #latestReadings: ReadonlyArray<GlucoseReading> | null = null;

  start(intervalMs: number = DEFAULT_INTERVAL_MS): void {
    if (this.#timer !== null) {
      return;
    }
    void this.#poll();
    this.#timer = setInterval(() => {
      void this.#poll();
    }, intervalMs);
  }

  stop(): void {
    if (this.#timer !== null) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
    this.#latestReadings = null;
  }

  on(event: 'data', listener: DataListener): this;
  on(event: 'error', listener: ErrorListener): this;
  on(event: string, listener: DataListener | ErrorListener): this {
    super.on(event, listener);
    if (event === 'data' && this.#latestReadings !== null) {
      (listener as DataListener)(this.#latestReadings);
    }
    return this;
  }

  off(event: 'data', listener: DataListener): this;
  off(event: 'error', listener: ErrorListener): this;
  off(event: string, listener: DataListener | ErrorListener): this {
    super.off(event, listener);
    return this;
  }

  async #poll(): Promise<void> {
    try {
      const readings = await LibreService.fetchReadings();
      this.#latestReadings = readings;
      this.emit('data', readings);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Poll error';
      this.emit('error', message);
    }
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export default new DataPoller();
