import {
  BoxRenderable,
  TextRenderable,
  InputRenderable,
  InputRenderableEvents,
  SelectRenderable,
  SelectRenderableEvents,
  TextAttributes,
  type RenderContext,
} from '@opentui/core';
import { SERVERS, Server } from '../state/AppState.js';
import {
  COLOR_BG,
  COLOR_AXIS,
  COLOR_DEFAULT_FG,
  COLOR_TAB_ACTIVE_BG,
  COLOR_TAB_ACTIVE_FG,
  COLOR_TAB_INACTIVE_BG,
  COLOR_TAB_INACTIVE_FG,
  COLOR_MEASUREMENT_RED,
} from '../components/theme.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type FocusField = 'server' | 'email' | 'password';

const FOCUS_ORDER: ReadonlyArray<FocusField> = ['server', 'email', 'password'];

export type LoginScreenOptions = {
  readonly initialEmail?: string;
  readonly initialPassword?: string;
  readonly initialServer?: Server;
  readonly onLogin: (
    email: string,
    password: string,
    server: Server,
  ) => Promise<void>;
};

export type LoginScreenComponent = {
  readonly root: BoxRenderable;
  readonly destroy: () => void;
};

// ─── Server options ───────────────────────────────────────────────────────────

const SERVER_SELECT_OPTIONS = [
  { name: 'USA', description: SERVERS.US },
  { name: 'EU', description: SERVERS.EU },
];

// ─── Section builders ────────────────────────────────────────────────────────

function buildTitle(ctx: RenderContext): BoxRenderable {
  const box = new BoxRenderable(ctx, {
    id: 'login-title-box',
    flexDirection: 'column',
    gap: 0,
  });

  box.add(
    new TextRenderable(ctx, {
      id: 'login-title',
      content: 'FreeStyle Libre CGM',
      fg: COLOR_DEFAULT_FG,
      attributes: TextAttributes.BOLD,
      width: '100%',
    }),
  );

  box.add(
    new TextRenderable(ctx, {
      id: 'login-subtitle',
      content: 'Sign In',
      fg: COLOR_AXIS,
      width: '100%',
    }),
  );

  return box;
}

function buildServerSection(
  ctx: RenderContext,
  initialIndex: number,
): { row: BoxRenderable; select: SelectRenderable } {
  const row = new BoxRenderable(ctx, {
    id: 'login-server-row',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  });

  row.add(
    new TextRenderable(ctx, {
      id: 'login-server-label',
      content: 'Server:',
      fg: COLOR_AXIS,
      width: 10,
    }),
  );

  const select = new SelectRenderable(ctx, {
    id: 'login-server-select',
    options: SERVER_SELECT_OPTIONS,
    width: 8,
    height: 2,
    textColor: COLOR_TAB_INACTIVE_FG,
    backgroundColor: COLOR_BG,
    focusedBackgroundColor: COLOR_TAB_INACTIVE_BG,
    focusedTextColor: COLOR_DEFAULT_FG,
    selectedBackgroundColor: COLOR_TAB_ACTIVE_BG,
    selectedTextColor: COLOR_TAB_ACTIVE_FG,
    showDescription: false,
  });
  select.setSelectedIndex(initialIndex);

  row.add(select);

  return { row, select };
}

function buildEmailSection(
  ctx: RenderContext,
  initialEmail: string,
): { row: BoxRenderable; input: InputRenderable } {
  const row = new BoxRenderable(ctx, {
    id: 'login-email-row',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  });

  row.add(
    new TextRenderable(ctx, {
      id: 'login-email-label',
      content: 'Email:',
      fg: COLOR_AXIS,
      width: 10,
    }),
  );

  const input = new InputRenderable(ctx, {
    id: 'login-email-input',
    value: initialEmail,
    placeholder: 'user@example.com',
    width: 36,
    textColor: COLOR_DEFAULT_FG,
    backgroundColor: COLOR_TAB_INACTIVE_BG,
    focusedBackgroundColor: COLOR_TAB_INACTIVE_BG,
    cursorColor: COLOR_TAB_ACTIVE_BG,
  });

  row.add(input);

  return { row, input };
}

function buildPasswordSection(
  ctx: RenderContext,
  initialPassword: string,
): { row: BoxRenderable; input: InputRenderable } {
  const row = new BoxRenderable(ctx, {
    id: 'login-password-row',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  });

  row.add(
    new TextRenderable(ctx, {
      id: 'login-password-label',
      content: 'Password:',
      fg: COLOR_AXIS,
      width: 10,
    }),
  );

  const input = new InputRenderable(ctx, {
    id: 'login-password-input',
    value: initialPassword,
    width: 36,
    textColor: COLOR_DEFAULT_FG,
    backgroundColor: COLOR_TAB_INACTIVE_BG,
    focusedBackgroundColor: COLOR_TAB_INACTIVE_BG,
    cursorColor: COLOR_TAB_ACTIVE_BG,
  });

  row.add(input);

  return { row, input };
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createLoginScreen(
  ctx: RenderContext,
  options: LoginScreenOptions,
): LoginScreenComponent {
  let currentFocus: FocusField = 'server';
  let isLoggingIn = false;

  // ─── Build UI sections ──────────────────────────────────────────────────────

  const root = new BoxRenderable(ctx, {
    id: 'login-root',
    width: '100%',
    height: '100%',
    backgroundColor: COLOR_BG,
    justifyContent: 'center',
    alignItems: 'center',
  });

  const card = new BoxRenderable(ctx, {
    id: 'login-card',
    flexDirection: 'column',
    gap: 1,
    padding: 2,
    border: true,
    borderStyle: 'rounded',
    borderColor: COLOR_AXIS,
    backgroundColor: COLOR_BG,
    width: 52,
  });

  const titleBox = buildTitle(ctx);

  const initialServerIndex = options.initialServer === SERVERS.EU ? 1 : 0;
  const { row: serverRow, select: serverSelect } = buildServerSection(
    ctx,
    initialServerIndex,
  );

  const { row: emailRow, input: emailInput } = buildEmailSection(
    ctx,
    options.initialEmail ?? '',
  );

  const { row: passwordRow, input: passwordInput } = buildPasswordSection(
    ctx,
    options.initialPassword ?? '',
  );

  const statusText = new TextRenderable(ctx, {
    id: 'login-status',
    content: '',
    fg: COLOR_AXIS,
    width: '100%',
  });

  card.add(titleBox);
  card.add(serverRow);
  card.add(emailRow);
  card.add(passwordRow);
  card.add(statusText);
  root.add(card);

  // ─── Focus helpers ──────────────────────────────────────────────────────────

  function applyFocus(field: FocusField): void {
    serverSelect.blur();
    emailInput.blur();
    passwordInput.blur();

    currentFocus = field;

    if (field === 'server') {
      serverSelect.focus();
    } else if (field === 'email') {
      emailInput.focus();
    } else {
      passwordInput.focus();
    }
  }

  function advanceFocus(direction: 1 | -1): void {
    const idx = FOCUS_ORDER.indexOf(currentFocus);
    const next =
      FOCUS_ORDER[(idx + direction + FOCUS_ORDER.length) % FOCUS_ORDER.length];
    applyFocus(next);
  }

  // ─── Status helpers ──────────────────────────────────────────────────────────

  function setStatus(message: string, isError = false): void {
    statusText.content = message;
    statusText.fg = isError ? COLOR_MEASUREMENT_RED : COLOR_AXIS;
  }

  // ─── Login submission ────────────────────────────────────────────────────────

  async function submit(): Promise<void> {
    if (isLoggingIn) {
      return;
    }
    const email = emailInput.value.trim();
    if (!email) {
      applyFocus('email');
      setStatus('Email is required', true);
      return;
    }
    const password = passwordInput.value;
    if (!password) {
      applyFocus('password');
      setStatus('Password is required', true);
      return;
    }

    isLoggingIn = true;
    setStatus('Signing in…');

    const server =
      serverSelect.getSelectedIndex() === 1 ? SERVERS.EU : SERVERS.US;

    try {
      await options.onLogin(email, password, server);
    } catch (err) {
      isLoggingIn = false;
      const message = err instanceof Error ? err.message : 'Login failed';
      setStatus(message, true);
    }
  }

  // ─── Keyboard handler ────────────────────────────────────────────────────────

  function onKeyPress(key: { name: string; shift: boolean }): void {
    if (isLoggingIn) {
      return;
    }

    if (key.name === 'tab') {
      advanceFocus(key.shift ? -1 : 1);
      return;
    }
  }

  serverSelect.on(SelectRenderableEvents.ITEM_SELECTED, () => {
    advanceFocus(1);
  });

  emailInput.on(InputRenderableEvents.ENTER, () => {
    advanceFocus(1);
  });
  passwordInput.on(InputRenderableEvents.ENTER, () => {
    void submit();
  });

  ctx.keyInput.on('keypress', onKeyPress);

  applyFocus('server');

  // ─── Destroy ─────────────────────────────────────────────────────────────────

  function destroy(): void {
    ctx.keyInput.off('keypress', onKeyPress);
  }

  return { root, destroy };
}
