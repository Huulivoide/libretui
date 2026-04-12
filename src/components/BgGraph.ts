import {
  FrameBufferRenderable,
  RGBA,
  TextAttributes,
  type RenderContext,
} from '@opentui/core';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import { type Settings, Unit } from '../state/AppState.js';
import { MEASUREMENT_COLOR_MAP } from './theme.js';

// ─── Colours ─────────────────────────────────────────────────────────────────

const C_BG = RGBA.fromHex('#1a1b26');
const C_AXIS = RGBA.fromHex('#565f89');
const C_DIM = RGBA.fromHex('#414868');
const C_LOW = RGBA.fromHex('#f7768e');
const C_HIGH = RGBA.fromHex('#ff9e64');
const C_LABEL = RGBA.fromHex('#c0caf5');

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

function renderGraph(
  fb: FrameBufferRenderable['frameBuffer'],
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

  fb.clear(C_BG);

  // Value range — always include low/high thresholds
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

  const axisRow = MARGIN_TOP + plotH; // row just below plot

  // ─── Y-axis line ────────────────────────────────────────────────────────────
  for (let row = MARGIN_TOP; row <= axisRow; row++) {
    fb.setCell(MARGIN_LEFT - 1, row, row === axisRow ? '└' : '│', C_AXIS, C_BG);
  }

  // ─── X-axis line ────────────────────────────────────────────────────────────
  for (let col = MARGIN_LEFT; col < MARGIN_LEFT + plotW; col++) {
    fb.setCell(col, axisRow, '─', C_AXIS, C_BG);
  }

  // ─── Y-axis tick labels ──────────────────────────────────────────────────────
  const tickStep = settings.unit === Unit.MmolL ? 50 : 50; // mg/dL step; same for both
  const firstTick = Math.ceil(valMin / tickStep) * tickStep;
  for (let v = firstTick; v <= valMax; v += tickStep) {
    const row = toYRow(v, valMin, valMax, plotH);
    if (row < MARGIN_TOP || row >= MARGIN_TOP + plotH) {
      continue;
    }
    const label =
      settings.unit === Unit.MmolL ? (v / 18.0).toFixed(1) : String(v);
    fb.drawText(label.padStart(MARGIN_LEFT - 2), 0, row, C_AXIS, C_BG);
    fb.setCell(MARGIN_LEFT - 1, row, '┤', C_AXIS, C_BG);
  }

  // ─── Low threshold ──────────────────────────────────────────────────────────
  const lowRow = toYRow(settings.lowThreshold, valMin, valMax, plotH);
  if (lowRow >= MARGIN_TOP && lowRow < MARGIN_TOP + plotH) {
    for (let col = MARGIN_LEFT; col < MARGIN_LEFT + plotW; col++) {
      // Dashed: draw every other column
      if ((col - MARGIN_LEFT) % 2 === 0) {
        fb.setCell(col, lowRow, '─', C_LOW, C_BG);
      }
    }
  }

  // ─── High threshold ─────────────────────────────────────────────────────────
  const highRow = toYRow(settings.highThreshold, valMin, valMax, plotH);
  if (highRow >= MARGIN_TOP && highRow < MARGIN_TOP + plotH) {
    for (let col = MARGIN_LEFT; col < MARGIN_LEFT + plotW; col++) {
      if ((col - MARGIN_LEFT) % 2 === 0) {
        fb.setCell(col, highRow, '─', C_HIGH, C_BG);
      }
    }
  }

  // ─── Data line ──────────────────────────────────────────────────────────────
  let prevX: number | null = null;
  let prevY: number | null = null;

  for (const reading of readings) {
    const x = toXCol(reading.timestamp.getTime(), timeMin, timeMax, plotW);
    const y = toYRow(reading.value, valMin, valMax, plotH);
    const dotColor = RGBA.fromHex(
      MEASUREMENT_COLOR_MAP[reading.measurementColor] ?? '#9ece6a',
    );

    if (prevX !== null && prevY !== null && (x !== prevX || y !== prevY)) {
      // Bresenham line between previous and current point (connector only)
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
          fb.setCell(lx, ly, char, C_DIM, C_BG);
        }
      }
    }

    // Data point dot
    if (
      x >= MARGIN_LEFT &&
      x < MARGIN_LEFT + plotW &&
      y >= MARGIN_TOP &&
      y < MARGIN_TOP + plotH
    ) {
      fb.setCell(x, y, '●', dotColor, C_BG);
    }

    prevX = x;
    prevY = y;
  }

  // ─── X-axis time labels ──────────────────────────────────────────────────────
  const labelRow = axisRow + 1;
  if (labelRow < height) {
    const midReading = readings.at(Math.floor(readings.length / 2));
    if (midReading) {
      const firstLabel = formatHhmm(firstReading.timestamp);
      const midLabel = formatHhmm(midReading.timestamp);
      const lastLabel = formatHhmm(lastReading.timestamp);

      fb.drawText(firstLabel, MARGIN_LEFT, labelRow, C_AXIS, C_BG);
      fb.drawText(
        midLabel,
        MARGIN_LEFT + Math.floor(plotW / 2) - Math.floor(midLabel.length / 2),
        labelRow,
        C_AXIS,
        C_BG,
      );
      fb.drawText(
        lastLabel,
        MARGIN_LEFT + plotW - lastLabel.length,
        labelRow,
        C_AXIS,
        C_BG,
      );
    }
  }

  // ─── Current value label (top-right) ────────────────────────────────────────
  const currentLabel =
    settings.unit === Unit.MmolL ? lastReading.mmol : String(lastReading.mgDl);
  const labelX = Math.max(0, width - currentLabel.length - MARGIN_RIGHT);
  fb.drawText(currentLabel, labelX, 0, C_LABEL, C_BG, TextAttributes.BOLD);
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
