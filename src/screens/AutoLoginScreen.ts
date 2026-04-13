import {
  BoxRenderable,
  TextRenderable,
  TextAttributes,
  type RenderContext,
} from '@opentui/core';
import { type Server } from '../state/AppState.js';
import { COLOR_BG, COLOR_AXIS, COLOR_DEFAULT_FG } from '../components/theme.js';
import * as LibreService from '../services/LibreService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AutoLoginScreenOptions = {
  readonly email: string;
  readonly password: string;
  readonly server: Server;
  readonly onSuccess: () => void;
  readonly onFailure: (error: string) => void;
};

export type AutoLoginScreenComponent = {
  readonly root: BoxRenderable;
  readonly destroy: () => void;
};

// ─── Spinner frames ───────────────────────────────────────────────────────────

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SPINNER_INTERVAL_MS = 80;

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createAutoLoginScreen(
  ctx: RenderContext,
  options: AutoLoginScreenOptions,
): AutoLoginScreenComponent {
  let spinnerIndex = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  // ─── Build UI ───────────────────────────────────────────────────────────────

  const root = new BoxRenderable(ctx, {
    id: 'autologin-root',
    width: '100%',
    height: '100%',
    backgroundColor: COLOR_BG,
    justifyContent: 'center',
    alignItems: 'center',
  });

  const row = new BoxRenderable(ctx, {
    id: 'autologin-row',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  });

  const spinner = new TextRenderable(ctx, {
    id: 'autologin-spinner',
    content: SPINNER_FRAMES[0],
    fg: COLOR_DEFAULT_FG,
    attributes: TextAttributes.BOLD,
  });

  const statusText = new TextRenderable(ctx, {
    id: 'autologin-status',
    content: 'Signing in…',
    fg: COLOR_AXIS,
  });

  row.add(spinner);
  row.add(statusText);
  root.add(row);

  // ─── Spinner animation ──────────────────────────────────────────────────────

  intervalId = setInterval(() => {
    spinnerIndex = (spinnerIndex + 1) % SPINNER_FRAMES.length;
    spinner.content = SPINNER_FRAMES[spinnerIndex];
  }, SPINNER_INTERVAL_MS);

  // ─── Attempt login ──────────────────────────────────────────────────────────

  void LibreService.login(options.email, options.password, options.server).then(
    () => {
      options.onSuccess();
    },
    (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Login failed';
      options.onFailure(message);
    },
  );

  // ─── Destroy ─────────────────────────────────────────────────────────────────

  function destroy(): void {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return { root, destroy };
}
