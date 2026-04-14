import {
  BoxRenderable,
  TextRenderable,
  type RenderContext,
} from '@opentui/core';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import { type Settings } from '../state/AppState.js';
import { createTrendArrow } from '../components/TrendArrow.js';
import DataPoller from '../services/DataPoller.js';
import { COLOR_AXIS, COLOR_MEASUREMENT_RED } from '../components/theme.js';

// ─── Types ──────────────────────────────────────────────────────────────────────────────

export type LiveScreenOptions = {
  readonly settings: Settings;
};

export type LiveScreenComponent = {
  readonly root: BoxRenderable;
  readonly destroy: () => void;
};

// ─── Section builders ───────────────────────────────────────────────────────────────────

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

// ─── Factory ─────────────────────────────────────────────────────────────────────────────

export function createLiveScreen(
  ctx: RenderContext,
  options: LiveScreenOptions,
): LiveScreenComponent {
  // ─── Build UI ───────────────────────────────────────────────────────────────────────────

  const { root, trendArrow, lastUpdatedText, errorText } = buildContent(ctx);

  // ─── Helpers ────────────────────────────────────────────────────────────────────────────

  function onData(readings: ReadonlyArray<GlucoseReading>): void {
    const latest = readings.at(-1);
    if (!latest) {
      return;
    }
    errorText.visible = false;
    trendArrow.update(latest, options.settings.unit);
    lastUpdatedText.content = `Updated ${latest.timestamp.toLocaleTimeString()}`;
  }

  function onError(message: string): void {
    errorText.content = message;
    errorText.visible = true;
    lastUpdatedText.content = 'Retrying…';
  }

  DataPoller.on('data', onData);
  DataPoller.on('error', onError);

  // ─── Destroy ─────────────────────────────────────────────────────────────────────────────

  function destroy(): void {
    DataPoller.off('data', onData);
    DataPoller.off('error', onError);
  }

  return { root, destroy };
}
