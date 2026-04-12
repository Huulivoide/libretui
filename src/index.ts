import { createCliRenderer, type KeyEvent } from '@opentui/core';
import { Screen, type Settings } from './state/AppState.js';
import { loadSettings, saveSettings } from './services/SettingsStore.js';
import {
  loadCredentials,
  saveCredentials,
} from './services/CredentialStore.js';
import * as LibreService from './services/LibreService.js';
import { createLoginScreen } from './screens/LoginScreen.js';
import { createLiveScreen } from './screens/LiveScreen.js';
import { createGraphScreen } from './screens/GraphScreen.js';
import { createSettingsScreen } from './screens/SettingsScreen.js';
import { type Server } from './state/AppState.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScreenComponent = {
  readonly root: { readonly id: string };
  readonly destroy: () => void;
};

// ─── Nav screens (excludes Login) ─────────────────────────────────────────────

const NAV_SCREENS: ReadonlyArray<Screen> = [
  Screen.Live,
  Screen.Graph,
  Screen.Settings,
];

// ─── Bootstrap ───────────────────────────────────────────────────────────────

const renderer = await createCliRenderer({ exitOnCtrlC: true });

let settings = await loadSettings();
const savedCreds = await loadCredentials();

let activeScreen: Screen = Screen.Login;
let current: ScreenComponent | null = null;

// ─── Screen mounting ─────────────────────────────────────────────────────────

function mount(screen: Screen, component: ScreenComponent): void {
  if (current) {
    current.destroy();
    renderer.root.remove(current.root.id);
  }
  activeScreen = screen;
  current = component;
  renderer.root.add(component.root);
}

// ─── Navigation ──────────────────────────────────────────────────────────────

function navigateTo(screen: Screen): void {
  switch (screen) {
    case Screen.Live:
      mount(
        screen,
        createLiveScreen(renderer, { settings, onNavigate: navigateTo }),
      );
      break;
    case Screen.Graph:
      mount(
        screen,
        createGraphScreen(renderer, { settings, onNavigate: navigateTo }),
      );
      break;
    case Screen.Settings:
      mount(
        screen,
        createSettingsScreen(renderer, {
          settings,
          onSave: handleSaveSettings,
          onNavigate: navigateTo,
        }),
      );
      break;
  }
}

// Tab/Shift+Tab cycles between logged-in screens.
// Login and Settings intercept Tab themselves, so we skip those.
function onGlobalKeyPress(key: KeyEvent): void {
  if (key.name !== 'tab') {
    return;
  }
  if (activeScreen === Screen.Login || activeScreen === Screen.Settings) {
    return;
  }
  const idx = NAV_SCREENS.indexOf(activeScreen);
  const next =
    NAV_SCREENS[
      (idx + (key.shift ? -1 : 1) + NAV_SCREENS.length) % NAV_SCREENS.length
    ];
  navigateTo(next);
}

renderer.keyInput.on('keypress', onGlobalKeyPress);

// ─── Callbacks ───────────────────────────────────────────────────────────────

async function handleLogin(
  email: string,
  password: string,
  server: Server,
): Promise<void> {
  await LibreService.login(email, password, server);
  await saveCredentials({ email, password });
  settings = { ...settings, server };
  await saveSettings(settings);
  navigateTo(Screen.Live);
}

async function handleSaveSettings(newSettings: Settings): Promise<void> {
  settings = newSettings;
  await saveSettings(newSettings);
}

// ─── Initial screen ──────────────────────────────────────────────────────────

mount(
  Screen.Login,
  createLoginScreen(renderer, {
    initialEmail: savedCreds?.email,
    initialServer: settings.server,
    onLogin: handleLogin,
  }),
);
