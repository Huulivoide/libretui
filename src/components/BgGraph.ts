import { FrameBufferRenderable, type RenderContext } from '@opentui/core';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import { type Settings, Unit } from '../state/AppState.js';
import {
  MEASUREMENT_COLOR_MAP,
  COLOR_BG,
  COLOR_AXIS,
  COLOR_DIM,
  COLOR_LOW,
  COLOR_HIGH,
} from './theme.js';

// ─── Margin constants ─────────────────────────────────────────────────────────

const MARGIN_LEFT = 7; // room for Y-axis labels like "22.2 |"
const MARGIN_RIGHT = 2;
const MARGIN_TOP = 1; // breathing room at top
const MARGIN_BOTTOM = 2; // X-axis + time labels

// ─── Display range constants ──────────────────────────────────────────────────

/** Minimum lower bound of the Y axis in mg/dL (≈ 3 mmol/L) */
const MIN_DISPLAY_LOW_MGDL = 50;
/** Minimum upper bound of the Y axis in mg/dL (≈ 12 mmol/L) */
const MIN_DISPLAY_HIGH_MGDL = 220;
/** Padding above and below data/thresholds in mg/dL (≈ 0.5 mmol/L) */
const PADDING_MGDL = 10;
/** Grid lines double in spacing when the plot height is at or below this value */
const SMALL_HEIGHT_THRESHOLD = 40;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatHhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function toYRow(
  value: number,
  valMin: number,
  valMax: number,
  plotH: number,
): number {
  const ratio = (value - valMin) / (valMax - valMin);
  // Higher BG → smaller row index (top of graph)
  return MARGIN_TOP + plotH - 1 - Math.round(ratio * (plotH - 1));
}

function toXCol(
  ts: number,
  timeMin: number,
  timeMax: number,
  plotW: number,
): number {
  if (timeMax === timeMin) {
    return MARGIN_LEFT + Math.floor(plotW / 2);
  }
  const ratio = (ts - timeMin) / (timeMax - timeMin);
  return MARGIN_LEFT + Math.round(ratio * (plotW - 1));
}

// ─── Rendering ────────────────────────────────────────────────────────────────

type FrameBuffer = FrameBufferRenderable['frameBuffer'];

type PlotBounds = {
  readonly plotW: number;
  readonly plotH: number;
  readonly valMin: number;
  readonly valMax: number;
  readonly timeMin: number;
  readonly timeMax: number;
  readonly axisRow: number;
};

function drawBorder(fb: FrameBuffer, bounds: PlotBounds): void {
  const { plotW, axisRow } = bounds;

  const rightCol = MARGIN_LEFT + plotW;
  const topRow = MARGIN_TOP - 1; // row 0
  const bottomRow = axisRow;

  // Left Top and Bottom corners
  fb.setCell(MARGIN_LEFT - 1, topRow, '┌', COLOR_AXIS, COLOR_BG);
  fb.setCell(MARGIN_LEFT - 1, bottomRow, '└', COLOR_AXIS, COLOR_BG);

  // Right Top and Bottom corners
  fb.setCell(rightCol, topRow, '┐', COLOR_AXIS, COLOR_BG);
  fb.setCell(rightCol, bottomRow, '┘', COLOR_AXIS, COLOR_BG);

  // Top and Bottom edges
  for (let col = MARGIN_LEFT; col < rightCol; col++) {
    fb.setCell(col, topRow, '─', COLOR_AXIS, COLOR_BG);
    fb.setCell(col, bottomRow, '─', COLOR_AXIS, COLOR_BG);
  }

  // Left and Right edges
  for (let row = MARGIN_TOP; row < bottomRow; row++) {
    fb.setCell(MARGIN_LEFT - 1, row, '│', COLOR_AXIS, COLOR_BG);
    fb.setCell(rightCol, row, '│', COLOR_AXIS, COLOR_BG);
  }
}

function drawGridLines(fb: FrameBuffer, bounds: PlotBounds, unit: Unit): void {
  const { plotW, plotH, valMin, valMax } = bounds;
  const rightCol = MARGIN_LEFT + plotW;

  // Double the step on small screens to avoid crowded labels
  const baseStep = unit === Unit.MmolL ? 18 : 20;
  const step = plotH <= SMALL_HEIGHT_THRESHOLD ? baseStep * 2 : baseStep;

  const firstLine = Math.ceil(valMin / step) * step;
  for (let v = firstLine; v <= valMax; v += step) {
    const row = toYRow(v, valMin, valMax, plotH);
    if (row < MARGIN_TOP || row >= MARGIN_TOP + plotH) {
      continue;
    }
    for (let col = MARGIN_LEFT; col < rightCol; col++) {
      fb.setCell(col, row, '─', COLOR_DIM, COLOR_BG);
    }
    fb.setCell(rightCol, row, '┤', COLOR_DIM, COLOR_BG);

    const label = unit === Unit.MmolL ? (v / 18.0).toFixed(1) : String(v);
    fb.drawText(label.padStart(MARGIN_LEFT - 2), 0, row, COLOR_DIM, COLOR_BG);
    fb.setCell(MARGIN_LEFT - 1, row, '┼', COLOR_DIM, COLOR_BG);
  }
}

function drawThresholdLines(
  fb: FrameBuffer,
  bounds: PlotBounds,
  settings: Settings,
  unit: Unit,
): void {
  const { plotW, plotH, valMin, valMax } = bounds;
  const rightCol = MARGIN_LEFT + plotW;

  const lowRow = toYRow(settings.lowThreshold, valMin, valMax, plotH);
  if (lowRow >= MARGIN_TOP && lowRow < MARGIN_TOP + plotH) {
    for (let col = MARGIN_LEFT; col < rightCol; col++) {
      fb.setCell(col, lowRow, '─', COLOR_LOW, COLOR_BG);
    }
    fb.setCell(rightCol, lowRow, '┤', COLOR_LOW, COLOR_BG);

    const lowLabel =
      unit === Unit.MmolL
        ? (settings.lowThreshold / 18.0).toFixed(1)
        : String(settings.lowThreshold);
    fb.drawText(
      lowLabel.padStart(MARGIN_LEFT - 2),
      0,
      lowRow,
      COLOR_LOW,
      COLOR_BG,
    );
    fb.setCell(MARGIN_LEFT - 1, lowRow, '┼', COLOR_LOW, COLOR_BG);
  }

  const highRow = toYRow(settings.highThreshold, valMin, valMax, plotH);
  if (highRow >= MARGIN_TOP && highRow < MARGIN_TOP + plotH) {
    for (let col = MARGIN_LEFT; col < rightCol; col++) {
      fb.setCell(col, highRow, '─', COLOR_HIGH, COLOR_BG);
    }
    fb.setCell(rightCol, highRow, '┤', COLOR_HIGH, COLOR_BG);

    const highLabel =
      unit === Unit.MmolL
        ? (settings.highThreshold / 18.0).toFixed(1)
        : String(settings.highThreshold);
    fb.drawText(
      highLabel.padStart(MARGIN_LEFT - 2),
      0,
      highRow,
      COLOR_HIGH,
      COLOR_BG,
    );
    fb.setCell(MARGIN_LEFT - 1, highRow, '┼', COLOR_HIGH, COLOR_BG);
  }
}

function drawDataLine(
  fb: FrameBuffer,
  readings: ReadonlyArray<GlucoseReading>,
  bounds: PlotBounds,
): void {
  const { plotW, plotH, valMin, valMax, timeMin, timeMax } = bounds;
  let prevX: number | null = null;
  let prevY: number | null = null;

  for (const reading of readings) {
    const x = toXCol(reading.timestamp.getTime(), timeMin, timeMax, plotW);
    const y = toYRow(reading.value, valMin, valMax, plotH);
    const dotColor =
      MEASUREMENT_COLOR_MAP[reading.measurementColor] ??
      MEASUREMENT_COLOR_MAP[1];

    if (prevX !== null && prevY !== null && (x !== prevX || y !== prevY)) {
      const dx = x - prevX;
      const dy = y - prevY;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (let i = 1; i < steps; i++) {
        const lx = Math.round(prevX + (dx * i) / steps);
        const ly = Math.round(prevY + (dy * i) / steps);
        if (
          lx >= MARGIN_LEFT &&
          lx < MARGIN_LEFT + plotW &&
          ly >= MARGIN_TOP &&
          ly < MARGIN_TOP + plotH
        ) {
          const char = Math.abs(dy) <= Math.abs(dx) ? '─' : dy < 0 ? '╱' : '╲';
          fb.setCell(lx, ly, char, COLOR_DIM, COLOR_BG);
        }
      }
    }

    if (
      x >= MARGIN_LEFT &&
      x < MARGIN_LEFT + plotW &&
      y >= MARGIN_TOP &&
      y < MARGIN_TOP + plotH
    ) {
      fb.setCell(x, y, '●', dotColor, COLOR_BG);
    }

    prevX = x;
    prevY = y;
  }
}

function drawXAxisLabels(
  fb: FrameBuffer,
  readings: ReadonlyArray<GlucoseReading>,
  bounds: PlotBounds,
  height: number,
): void {
  const { plotW, axisRow } = bounds;
  const labelRow = axisRow + 1;
  if (labelRow >= height) {
    return;
  }
  const firstReading = readings.at(0);
  const lastReading = readings.at(-1);
  const midReading = readings.at(Math.floor(readings.length / 2));
  if (!firstReading || !lastReading || !midReading) {
    return;
  }
  const firstLabel = formatHhmm(firstReading.timestamp);
  const midLabel = formatHhmm(midReading.timestamp);
  const lastLabel = formatHhmm(lastReading.timestamp);
  fb.drawText(firstLabel, MARGIN_LEFT, labelRow, COLOR_AXIS, COLOR_BG);
  fb.drawText(
    midLabel,
    MARGIN_LEFT + Math.floor(plotW / 2) - Math.floor(midLabel.length / 2),
    labelRow,
    COLOR_AXIS,
    COLOR_BG,
  );
  fb.drawText(
    lastLabel,
    MARGIN_LEFT + plotW - lastLabel.length,
    labelRow,
    COLOR_AXIS,
    COLOR_BG,
  );
}

function renderGraph(
  fb: FrameBuffer,
  readings: ReadonlyArray<GlucoseReading>,
  settings: Settings,
  width: number,
  height: number,
): void {
  const plotW = width - MARGIN_LEFT - MARGIN_RIGHT;
  const plotH = height - MARGIN_TOP - MARGIN_BOTTOM;

  if (plotW <= 0 || plotH <= 0 || readings.length === 0) {
    return;
  }

  const firstReading = readings.at(0);
  const lastReading = readings.at(-1);
  if (!firstReading || !lastReading) {
    return;
  }

  fb.clear(COLOR_BG);

  const rawValues = readings.map((r) => r.value);
  const dataLow = Math.min(...rawValues, settings.lowThreshold);
  const dataHigh = Math.max(...rawValues, settings.highThreshold);
  const valMin = Math.min(dataLow - PADDING_MGDL, MIN_DISPLAY_LOW_MGDL);
  const valMax = Math.max(dataHigh + PADDING_MGDL, MIN_DISPLAY_HIGH_MGDL);
  const timeMin = firstReading.timestamp.getTime();
  const timeMax = lastReading.timestamp.getTime();
  const axisRow = MARGIN_TOP + plotH;

  const bounds: PlotBounds = {
    plotW,
    plotH,
    valMin,
    valMax,
    timeMin,
    timeMax,
    axisRow,
  };

  drawBorder(fb, bounds);
  drawGridLines(fb, bounds, settings.unit);
  drawThresholdLines(fb, bounds, settings, settings.unit);
  drawDataLine(fb, readings, bounds);
  drawXAxisLabels(fb, readings, bounds, height);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type BgGraphComponent = {
  readonly root: FrameBufferRenderable;
  readonly update: (
    readings: ReadonlyArray<GlucoseReading>,
    settings: Settings,
  ) => void;
};

export function createBgGraph(
  ctx: RenderContext,
  width: number,
  height: number,
): BgGraphComponent {
  const root = new FrameBufferRenderable(ctx, {
    id: 'bg-graph',
    width,
    height,
    flexGrow: 1,
  });

  const update = (
    readings: ReadonlyArray<GlucoseReading>,
    settings: Settings,
  ): void => {
    renderGraph(root.frameBuffer, readings, settings, width, height);
  };

  return { root, update };
}
