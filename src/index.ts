import { createCliRenderer, type KeyEvent } from '@opentui/core';
import { Screen, type Settings } from './state/AppState.js';
import { loadSettings, saveSettings } from './services/SettingsStore.js';
import {
  loadCredentials,
  saveCredentials,
  clearCredentials,
} from './services/CredentialStore.js';
import * as LibreService from './services/LibreService.js';
import { createLoginScreen } from './screens/LoginScreen.js';
import { createAutoLoginScreen } from './screens/AutoLoginScreen.js';
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
          onLogout: handleLogout,
        }),
      );
      break;
  }
}

// Tab/Shift+Tab cycles between Live and Graph (not Login or Settings — they use Tab for field focus).
// Escape from Settings returns to Live.
function onGlobalKeyPress(key: KeyEvent): void {
  if (activeScreen === Screen.Settings && key.name === 'escape') {
    navigateTo(Screen.Live);
    return;
  }
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

async function handleLogout(): Promise<void> {
  await clearCredentials();
  LibreService.logout();
  mount(Screen.Login, createLoginScreen(renderer, { onLogin: handleLogin }));
}

// ─── Initial screen ──────────────────────────────────────────────────────────

function mountLoginScreen(errorMessage?: string): void {
  mount(
    Screen.Login,
    createLoginScreen(renderer, {
      initialEmail: savedCreds?.email,
      initialPassword: savedCreds?.password,
      initialServer: settings.server,
      initialError: errorMessage,
      onLogin: handleLogin,
    }),
  );
}

if (savedCreds) {
  mount(
    Screen.AutoLogin,
    createAutoLoginScreen(renderer, {
      email: savedCreds.email,
      password: savedCreds.password,
      server: settings.server,
      onSuccess: () => {
        navigateTo(Screen.Live);
      },
      onFailure: (error) => {
        mountLoginScreen(error);
      },
    }),
  );
} else {
  mountLoginScreen();
}
