import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import {
  DEFAULT_SETTINGS,
  SERVERS,
  type Settings,
  Unit,
} from '../state/AppState.js';

const CONFIG_DIR = join(process.env.HOME ?? '~', '.config', 'libretui');
const SETTINGS_FILE = join(CONFIG_DIR, 'settings.json');

function isValidSettings(obj: unknown): obj is Settings {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const s = obj as Record<string, unknown>;
  const validServers: ReadonlyArray<string> = Object.values(SERVERS);
  return (
    typeof s.lowThreshold === 'number' &&
    typeof s.highThreshold === 'number' &&
    (s.unit === Unit.MgDl || s.unit === Unit.MmolL) &&
    typeof s.server === 'string' &&
    validServers.includes(s.server)
  );
}

export async function loadSettings(): Promise<Settings> {
  const file = Bun.file(SETTINGS_FILE);
  if (!(await file.exists())) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const parsed: unknown = await file.json();
    if (isValidSettings(parsed)) {
      return parsed;
    }
  } catch {
    // fall through to defaults
  }

  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await Bun.write(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}
