import { RGBA } from '@opentui/core';
import { MeasurementColor } from 'libre-link-unofficial-api';

// ─── Measurement state colours (Tokyo Night palette) ─────────────────────────

export const COLOR_MEASUREMENT_RED = RGBA.fromHex('#f7768e');
export const COLOR_MEASUREMENT_GREEN = RGBA.fromHex('#9ece6a');
export const COLOR_MEASUREMENT_YELLOW = RGBA.fromHex('#e0af68');
export const COLOR_MEASUREMENT_ORANGE = RGBA.fromHex('#ff9e64');

/** Pre-parsed RGBA indexed by MeasurementColor enum */
export const MEASUREMENT_COLOR_MAP: ReadonlyArray<RGBA> = [
  COLOR_MEASUREMENT_RED, // MeasurementColor.Red
  COLOR_MEASUREMENT_GREEN, // MeasurementColor.Green
  COLOR_MEASUREMENT_YELLOW, // MeasurementColor.Yellow
  COLOR_MEASUREMENT_ORANGE, // MeasurementColor.Orange
];

export const COLOR_DEFAULT_FG = RGBA.fromHex('#c0caf5');

export function rgbaForMeasurement(color: MeasurementColor): RGBA {
  return MEASUREMENT_COLOR_MAP[color] ?? COLOR_DEFAULT_FG;
}

// ─── Graph colours ────────────────────────────────────────────────────────────

export const COLOR_BG = RGBA.fromHex('#1a1b26');
export const COLOR_AXIS = RGBA.fromHex('#565f89');
export const COLOR_DIM = RGBA.fromHex('#414868');
/** Low threshold line — reuses measurement Red */
export const COLOR_LOW = COLOR_MEASUREMENT_RED;
/** High threshold line — reuses measurement Orange */
export const COLOR_HIGH = COLOR_MEASUREMENT_ORANGE;

// ─── NavBar colours ───────────────────────────────────────────────────────────

export const COLOR_TAB_ACTIVE_BG = RGBA.fromHex('#7aa2f7');
/** Active tab foreground is the terminal background for contrast */
export const COLOR_TAB_ACTIVE_FG = COLOR_BG;
export const COLOR_TAB_INACTIVE_BG = RGBA.fromHex('#1e2030');
export const COLOR_TAB_INACTIVE_FG = RGBA.fromHex('#545c7e');

// ─── Trend arrows ─────────────────────────────────────────────────────────────

/** Unicode trend arrows indexed by Trend enum (0–5) */
export const TREND_ARROW_CHARS: ReadonlyArray<string> = [
  '?', // 0 NotComputable
  '↓', // 1 SingleDown
  '↘', // 2 FortyFiveDown
  '→', // 3 Flat
  '↗', // 4 FortyFiveUp
  '↑', // 5 SingleUp
];
