import {
  BoxRenderable,
  TextRenderable,
  type RenderContext,
} from '@opentui/core';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import { type Settings } from '../state/AppState.js';
import { createTrendArrow } from '../components/TrendArrow.js';
import * as LibreService from '../services/LibreService.js';
import { COLOR_AXIS, COLOR_MEASUREMENT_RED } from '../components/theme.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LiveScreenOptions = {
  readonly settings: Settings;
};

export type LiveScreenComponent = {
  readonly root: BoxRenderable;
  readonly destroy: () => void;
};

// ─── Section builders ────────────────────────────────────────────────────────

function buildContent(ctx: RenderContext): {
  root: BoxRenderable;
  trendArrow: ReturnType<typeof createTrendArrow>;
  lastUpdatedText: TextRenderable;
  errorText: TextRenderable;
} {
  const root = new BoxRenderable(ctx, {
    id: 'live-content',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
  });

  const trendArrow = createTrendArrow(ctx);

  const lastUpdatedText = new TextRenderable(ctx, {
    id: 'live-last-updated',
    content: 'Fetching…',
    fg: COLOR_AXIS,
  });

  const errorText = new TextRenderable(ctx, {
    id: 'live-error',
    content: '',
    fg: COLOR_MEASUREMENT_RED,
  });
  errorText.visible = false;

  root.add(trendArrow.root);
  root.add(lastUpdatedText);
  root.add(errorText);

  return { root, trendArrow, lastUpdatedText, errorText };
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createLiveScreen(
  ctx: RenderContext,
  options: LiveScreenOptions,
): LiveScreenComponent {
  let generator: AsyncGenerator<GlucoseReading, void, unknown> | null = null;
  let stopped = false;

  // ─── Build UI ───────────────────────────────────────────────────────────────

  const { root, trendArrow, lastUpdatedText, errorText } = buildContent(ctx);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function onReading(reading: GlucoseReading): void {
    errorText.visible = false;
    trendArrow.update(reading, options.settings.unit);
    lastUpdatedText.content = `Updated ${reading.timestamp.toLocaleTimeString()}`;
  }

  function onError(err: unknown): void {
    const message = err instanceof Error ? err.message : 'Stream error';
    errorText.content = message;
    errorText.visible = true;
    lastUpdatedText.content = 'Retrying…';
  }

  // ─── Streaming ──────────────────────────────────────────────────────────────

  async function startStream(): Promise<void> {
    try {
      generator = LibreService.stream();
      for await (const reading of generator) {
        if (stopped) {
          break;
        }
        onReading(reading);
      }
    } catch (err) {
      if (!stopped) {
        onError(err);
      }
    }
  }

  void startStream();

  // ─── Destroy ─────────────────────────────────────────────────────────────────

  function destroy(): void {
    stopped = true;
    void generator?.return(undefined);
  }

  return { root, destroy };
}
