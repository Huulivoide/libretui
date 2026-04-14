import {
  ASCIIFontRenderable,
  BoxRenderable,
  TextRenderable,
  type RenderContext,
} from '@opentui/core';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import { Unit, type Settings } from '../state/AppState.js';
import { TrendArrowFont } from '../components/TrendArrowFont.js';
import DataPoller from '../services/DataPoller.js';
import {
  COLOR_AXIS,
  COLOR_DEFAULT_FG,
  COLOR_MEASUREMENT_RED,
  rgbaForMeasurement,
} from '../components/theme.js';

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
  arrowText: TextRenderable;
  bgValue: ASCIIFontRenderable;
  unitText: TextRenderable;
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

  // Row: braille arrow + pallet font BG value side by side
  const readingRow = new BoxRenderable(ctx, {
    id: 'live-reading-row',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  });

  const arrowText = new TextRenderable(ctx, {
    id: 'live-trend-arrow',
    content: TrendArrowFont[0], // NotComputable as placeholder
    fg: COLOR_DEFAULT_FG,
  });

  const bgValue = new ASCIIFontRenderable(ctx, {
    id: 'live-bg-value',
    text: '?.?',
    font: 'pallet',
    color: COLOR_DEFAULT_FG,
  });

  readingRow.add(bgValue);
  readingRow.add(arrowText);

  const unitText = new TextRenderable(ctx, {
    id: 'live-unit',
    content: '',
    fg: COLOR_AXIS,
  });

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

  root.add(readingRow);
  root.add(unitText);
  root.add(lastUpdatedText);
  root.add(errorText);

  return { root, arrowText, bgValue, unitText, lastUpdatedText, errorText };
}

// ─── Factory ─────────────────────────────────────────────────────────────────────────────

export function createLiveScreen(
  ctx: RenderContext,
  options: LiveScreenOptions,
): LiveScreenComponent {
  // ─── Build UI ───────────────────────────────────────────────────────────────────────────

  const { root, arrowText, bgValue, unitText, lastUpdatedText, errorText } = buildContent(ctx);

  // ─── Helpers ────────────────────────────────────────────────────────────────────────────

  function onData(readings: ReadonlyArray<GlucoseReading>): void {
    const latest = readings.at(-1);
    if (!latest) {
      return;
    }
    const color = rgbaForMeasurement(latest.measurementColor);
    const displayValue =
      options.settings.unit === Unit.MmolL ? latest.mmol : String(latest.mgDl);
    const unitLabel = options.settings.unit === Unit.MmolL ? 'mmol/L' : 'mg/dL';

    errorText.visible = false;
    arrowText.content = TrendArrowFont[latest.trend];
    arrowText.fg = color;
    bgValue.text = displayValue;
    bgValue.color = color;
    unitText.content = unitLabel;
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
