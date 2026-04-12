import {
  BoxRenderable,
  TextRenderable,
  TextAttributes,
  type RenderContext,
} from '@opentui/core';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import { Unit } from '../state/AppState.js';
import { rgbaForMeasurement, TREND_ARROW_CHARS } from './theme.js';

export type TrendArrowComponent = {
  readonly root: BoxRenderable;
  readonly update: (reading: GlucoseReading, unit: Unit) => void;
};

export function createTrendArrow(ctx: RenderContext): TrendArrowComponent {
  const root = new BoxRenderable(ctx, {
    id: 'trend-arrow',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  });

  const valueText = new TextRenderable(ctx, {
    id: 'trend-arrow-value',
    content: '---',
    fg: '#c0caf5',
    attributes: TextAttributes.BOLD,
  });

  const arrowText = new TextRenderable(ctx, {
    id: 'trend-arrow-icon',
    content: '?',
    fg: '#c0caf5',
  });

  root.add(valueText);
  root.add(arrowText);

  const update = (reading: GlucoseReading, unit: Unit): void => {
    const displayValue =
      unit === Unit.MmolL ? reading.mmol : String(reading.mgDl);
    const color = rgbaForMeasurement(reading.measurementColor);
    const arrow = TREND_ARROW_CHARS[reading.trend as number] ?? '?';

    valueText.content = displayValue;
    valueText.fg = color;
    arrowText.content = arrow;
    arrowText.fg = color;
  };

  return { root, update };
}
