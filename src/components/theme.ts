import { RGBA } from '@opentui/core';
import { MeasurementColor } from 'libre-link-unofficial-api';

/** Tokyo Night-inspired palette for BG measurement states */
export const MEASUREMENT_COLOR_MAP: ReadonlyArray<string> = [
  '#f7768e', // MeasurementColor.Red
  '#9ece6a', // MeasurementColor.Green
  '#e0af68', // MeasurementColor.Yellow
  '#ff9e64', // MeasurementColor.Orange
];

export function rgbaForMeasurement(color: MeasurementColor): RGBA {
  return RGBA.fromHex(MEASUREMENT_COLOR_MAP[color] ?? '#c0caf5');
}

/** Unicode trend arrows indexed by Trend enum (0–5) */
export const TREND_ARROW_CHARS: ReadonlyArray<string> = [
  '?', // 0 NotComputable
  '↓', // 1 SingleDown
  '↘', // 2 FortyFiveDown
  '→', // 3 Flat
  '↗', // 4 FortyFiveUp
  '↑', // 5 SingleUp
];
