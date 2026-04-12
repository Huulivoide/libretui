import { type GlucoseReading } from 'libre-link-unofficial-api';

export enum Screen {
  Login = 'login',
  Live = 'live',
  Graph = 'graph',
  Settings = 'settings',
}

export enum Unit {
  MgDl = 'mgdl',
  MmolL = 'mmol',
}

export interface Settings {
  /** Low BG threshold in mg/dL */
  lowThreshold: number;
  /** High BG threshold in mg/dL */
  highThreshold: number;
  unit: Unit;
}

export const DEFAULT_SETTINGS: Settings = {
  lowThreshold: 70,
  highThreshold: 180,
  unit: Unit.MgDl,
};

export interface AppState {
  activeScreen: Screen;
  settings: Settings;
  isLoggedIn: boolean;
  latestReading: GlucoseReading | null;
}

export function createAppState(): AppState {
  return {
    activeScreen: Screen.Login,
    settings: { ...DEFAULT_SETTINGS },
    isLoggedIn: false,
    latestReading: null,
  };
}

/** Convert mg/dL to mmol/L */
export function toMmol(mgDl: number): number {
  return mgDl / 18.0;
}

/** Format a BG value for display according to the active unit setting */
export function formatBg(mgDl: number, unit: Unit): string {
  if (unit === Unit.MmolL) {
    return toMmol(mgDl).toFixed(1);
  }
  return String(Math.round(mgDl));
}

/** Unit display label */
export function unitLabel(unit: Unit): string {
  return unit === Unit.MmolL ? 'mmol/L' : 'mg/dL';
}
