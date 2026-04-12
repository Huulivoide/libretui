import { type GlucoseReading } from 'libre-link-unofficial-api';

export const SERVERS = {
  US: 'https://api-us.libreview.io',
  EU: 'https://api-eu.libreview.io',
} as const;

export type Server = (typeof SERVERS)[keyof typeof SERVERS];

export enum Screen {
  Login = 'Login',
  Live = 'Live',
  Graph = 'Graph',
  Settings = 'Settings',
}

export enum Unit {
  MgDl = 'MgDl',
  MmolL = 'MmolL',
}

export type Settings = {
  /** Low BG threshold in mg/dL */
  readonly lowThreshold: number;
  /** High BG threshold in mg/dL */
  readonly highThreshold: number;
  readonly unit: Unit;
  readonly server: Server;
};

export const DEFAULT_SETTINGS: Settings = {
  lowThreshold: 70,
  highThreshold: 180,
  unit: Unit.MgDl,
  server: SERVERS.US,
};

export type AppState = {
  readonly activeScreen: Screen;
  readonly settings: Settings;
  readonly isLoggedIn: boolean;
  readonly latestReading: GlucoseReading | null;
};

export function createAppState(): AppState {
  return {
    activeScreen: Screen.Login,
    settings: { ...DEFAULT_SETTINGS },
    isLoggedIn: false,
    latestReading: null,
  };
}
