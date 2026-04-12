import {
  FrameBufferRenderable,
  TextAttributes,
  type RenderContext,
} from '@opentui/core';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import { type Settings, Unit } from '../state/AppState.js';
import {
  MEASUREMENT_COLOR_MAP,
  COLOR_BG,
  COLOR_AXIS,
  COLOR_DIM,
  COLOR_LOW,
  COLOR_HIGH,
  COLOR_DEFAULT_FG,
} from './theme.js';

// ─── Margin constants ─────────────────────────────────────────────────────────

const MARGIN_LEFT = 7; // room for Y-axis labels like "22.2 |"
const MARGIN_RIGHT = 2;
const MARGIN_TOP = 1; // breathing room at top
const MARGIN_BOTTOM = 2; // X-axis + time labels

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

function drawAxes(fb: FrameBuffer, bounds: PlotBounds): void {
  const { plotW, axisRow } = bounds;
  for (let row = MARGIN_TOP; row <= axisRow; row++) {
    fb.setCell(
      MARGIN_LEFT - 1,
      row,
      row === axisRow ? '└' : '│',
      COLOR_AXIS,
      COLOR_BG,
    );
  }
  for (let col = MARGIN_LEFT; col < MARGIN_LEFT + plotW; col++) {
    fb.setCell(col, axisRow, '─', COLOR_AXIS, COLOR_BG);
  }
}

function drawYAxisTicks(fb: FrameBuffer, bounds: PlotBounds, unit: Unit): void {
  const { plotH, valMin, valMax } = bounds;
  const tickStep = 50;
  const firstTick = Math.ceil(valMin / tickStep) * tickStep;
  for (let v = firstTick; v <= valMax; v += tickStep) {
    const row = toYRow(v, valMin, valMax, plotH);
    if (row < MARGIN_TOP || row >= MARGIN_TOP + plotH) {
      continue;
    }
    const label = unit === Unit.MmolL ? (v / 18.0).toFixed(1) : String(v);
    fb.drawText(label.padStart(MARGIN_LEFT - 2), 0, row, COLOR_AXIS, COLOR_BG);
    fb.setCell(MARGIN_LEFT - 1, row, '┤', COLOR_AXIS, COLOR_BG);
  }
}

function drawThresholdLines(
  fb: FrameBuffer,
  bounds: PlotBounds,
  settings: Settings,
): void {
  const { plotW, plotH, valMin, valMax } = bounds;

  const lowRow = toYRow(settings.lowThreshold, valMin, valMax, plotH);
  if (lowRow >= MARGIN_TOP && lowRow < MARGIN_TOP + plotH) {
    for (let col = MARGIN_LEFT; col < MARGIN_LEFT + plotW; col++) {
      if ((col - MARGIN_LEFT) % 2 === 0) {
        fb.setCell(col, lowRow, '─', COLOR_LOW, COLOR_BG);
      }
    }
  }

  const highRow = toYRow(settings.highThreshold, valMin, valMax, plotH);
  if (highRow >= MARGIN_TOP && highRow < MARGIN_TOP + plotH) {
    for (let col = MARGIN_LEFT; col < MARGIN_LEFT + plotW; col++) {
      if ((col - MARGIN_LEFT) % 2 === 0) {
        fb.setCell(col, highRow, '─', COLOR_HIGH, COLOR_BG);
      }
    }
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

function drawCurrentValueLabel(
  fb: FrameBuffer,
  readings: ReadonlyArray<GlucoseReading>,
  settings: Settings,
  width: number,
): void {
  const lastReading = readings.at(-1);
  if (!lastReading) {
    return;
  }
  const currentLabel =
    settings.unit === Unit.MmolL ? lastReading.mmol : String(lastReading.mgDl);
  const labelX = Math.max(0, width - currentLabel.length - MARGIN_RIGHT);
  fb.drawText(
    currentLabel,
    labelX,
    0,
    COLOR_DEFAULT_FG,
    COLOR_BG,
    TextAttributes.BOLD,
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
  const valMin = Math.max(
    40,
    Math.min(...rawValues, settings.lowThreshold) - 10,
  );
  const valMax = Math.min(
    400,
    Math.max(...rawValues, settings.highThreshold) + 10,
  );
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

  drawAxes(fb, bounds);
  drawYAxisTicks(fb, bounds, settings.unit);
  drawThresholdLines(fb, bounds, settings);
  drawDataLine(fb, readings, bounds);
  drawXAxisLabels(fb, readings, bounds, height);
  drawCurrentValueLabel(fb, readings, settings, width);
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
