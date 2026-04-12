import {
  BoxRenderable,
  TextRenderable,
  InputRenderable,
  InputRenderableEvents,
  TabSelectRenderable,
  TabSelectRenderableEvents,
  TextAttributes,
  type RenderContext,
} from '@opentui/core';
import { Screen, Unit, type Settings } from '../state/AppState.js';
import { createNavBar } from '../components/NavBar.js';
import {
  COLOR_BG,
  COLOR_AXIS,
  COLOR_DEFAULT_FG,
  COLOR_TAB_ACTIVE_BG,
  COLOR_TAB_ACTIVE_FG,
  COLOR_TAB_INACTIVE_BG,
  COLOR_TAB_INACTIVE_FG,
  COLOR_MEASUREMENT_RED,
  COLOR_MEASUREMENT_GREEN,
} from '../components/theme.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type FocusField = 'low' | 'high' | 'unit';

const FOCUS_ORDER: ReadonlyArray<FocusField> = ['low', 'high', 'unit'];

const UNIT_OPTIONS = [
  { name: 'mg/dL', description: Unit.MgDl },
  { name: 'mmol/L', description: Unit.MmolL },
];

export type SettingsScreenOptions = {
  readonly settings: Settings;
  readonly onSave: (settings: Settings) => Promise<void>;
  readonly onNavigate: (screen: Screen) => void;
};

export type SettingsScreenComponent = {
  readonly root: BoxRenderable;
  readonly destroy: () => void;
};

// ─── Section builders ────────────────────────────────────────────────────────

function buildTitle(ctx: RenderContext): BoxRenderable {
  const box = new BoxRenderable(ctx, {
    id: 'settings-title-box',
    flexDirection: 'column',
    gap: 0,
  });

  box.add(
    new TextRenderable(ctx, {
      id: 'settings-title',
      content: 'Settings',
      fg: COLOR_DEFAULT_FG,
      attributes: TextAttributes.BOLD,
      width: '100%',
    }),
  );

  return box;
}

function buildThresholdRow(
  ctx: RenderContext,
  id: string,
  label: string,
  initialValue: number,
): { row: BoxRenderable; input: InputRenderable } {
  const row = new BoxRenderable(ctx, {
    id: `settings-${id}-row`,
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  });

  row.add(
    new TextRenderable(ctx, {
      id: `settings-${id}-label`,
      content: label,
      fg: COLOR_AXIS,
      width: 18,
    }),
  );

  const input = new InputRenderable(ctx, {
    id: `settings-${id}-input`,
    value: String(initialValue),
    width: 8,
    textColor: COLOR_DEFAULT_FG,
    backgroundColor: COLOR_TAB_INACTIVE_BG,
    focusedBackgroundColor: COLOR_TAB_INACTIVE_BG,
    cursorColor: COLOR_TAB_ACTIVE_BG,
  });

  row.add(input);

  row.add(
    new TextRenderable(ctx, {
      id: `settings-${id}-unit`,
      content: 'mg/dL',
      fg: COLOR_AXIS,
    }),
  );

  return { row, input };
}

function buildUnitSection(
  ctx: RenderContext,
  initialUnit: Unit,
): { row: BoxRenderable; tab: TabSelectRenderable } {
  const row = new BoxRenderable(ctx, {
    id: 'settings-unit-row',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  });

  row.add(
    new TextRenderable(ctx, {
      id: 'settings-unit-label',
      content: 'Display unit:',
      fg: COLOR_AXIS,
      width: 18,
    }),
  );

  const tab = new TabSelectRenderable(ctx, {
    id: 'settings-unit-tab',
    options: UNIT_OPTIONS,
    tabWidth: 8,
    textColor: COLOR_TAB_INACTIVE_FG,
    focusedBackgroundColor: COLOR_TAB_INACTIVE_BG,
    focusedTextColor: COLOR_DEFAULT_FG,
    selectedBackgroundColor: COLOR_TAB_ACTIVE_BG,
    selectedTextColor: COLOR_TAB_ACTIVE_FG,
    showDescription: false,
  });
  tab.setSelectedIndex(initialUnit === Unit.MmolL ? 1 : 0);

  row.add(tab);

  return { row, tab };
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createSettingsScreen(
  ctx: RenderContext,
  options: SettingsScreenOptions,
): SettingsScreenComponent {
  let currentFocus: FocusField = 'low';
  let isSaving = false;

  // ─── Build UI ───────────────────────────────────────────────────────────────

  const root = new BoxRenderable(ctx, {
    id: 'settings-root',
    width: '100%',
    height: '100%',
    backgroundColor: COLOR_BG,
    flexDirection: 'column',
  });

  const { root: navBarRoot, setActive } = createNavBar(ctx);
  setActive(Screen.Settings);

  const content = new BoxRenderable(ctx, {
    id: 'settings-content',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  });

  const card = new BoxRenderable(ctx, {
    id: 'settings-card',
    flexDirection: 'column',
    gap: 1,
    padding: 2,
    border: true,
    borderStyle: 'rounded',
    borderColor: COLOR_AXIS,
    backgroundColor: COLOR_BG,
    width: 40,
  });

  const titleBox = buildTitle(ctx);

  const { row: lowRow, input: lowInput } = buildThresholdRow(
    ctx,
    'low',
    'Low threshold:',
    options.settings.lowThreshold,
  );

  const { row: highRow, input: highInput } = buildThresholdRow(
    ctx,
    'high',
    'High threshold:',
    options.settings.highThreshold,
  );

  const { row: unitRow, tab: unitTab } = buildUnitSection(
    ctx,
    options.settings.unit,
  );

  const statusText = new TextRenderable(ctx, {
    id: 'settings-status',
    content: '',
    fg: COLOR_AXIS,
    width: '100%',
  });

  card.add(titleBox);
  card.add(lowRow);
  card.add(highRow);
  card.add(unitRow);
  card.add(statusText);
  content.add(card);
  root.add(navBarRoot);
  root.add(content);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function setStatus(message: string, isError = false): void {
    statusText.content = message;
    statusText.fg = isError ? COLOR_MEASUREMENT_RED : COLOR_MEASUREMENT_GREEN;
  }

  function applyFocus(field: FocusField): void {
    lowInput.blur();
    highInput.blur();
    unitTab.blur();

    currentFocus = field;

    if (field === 'low') {
      lowInput.focus();
    } else if (field === 'high') {
      highInput.focus();
    } else {
      unitTab.focus();
    }
  }

  function advanceFocus(direction: 1 | -1): void {
    const idx = FOCUS_ORDER.indexOf(currentFocus);
    const next =
      FOCUS_ORDER[(idx + direction + FOCUS_ORDER.length) % FOCUS_ORDER.length];
    applyFocus(next);
  }

  // ─── Save ────────────────────────────────────────────────────────────────────

  async function save(): Promise<void> {
    if (isSaving) {
      return;
    }

    const low = parseInt(lowInput.value.trim(), 10);
    const high = parseInt(highInput.value.trim(), 10);

    if (isNaN(low) || low < 40 || low > 400) {
      applyFocus('low');
      setStatus('Low must be 40–400 mg/dL', true);
      return;
    }
    if (isNaN(high) || high < 40 || high > 400) {
      applyFocus('high');
      setStatus('High must be 40–400 mg/dL', true);
      return;
    }
    if (low >= high) {
      applyFocus('low');
      setStatus('Low must be less than High', true);
      return;
    }

    const unit = unitTab.getSelectedIndex() === 1 ? Unit.MmolL : Unit.MgDl;

    isSaving = true;
    setStatus('Saving…');

    try {
      await options.onSave({
        ...options.settings,
        lowThreshold: low,
        highThreshold: high,
        unit,
      });
      setStatus('Saved');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setStatus(message, true);
    } finally {
      isSaving = false;
    }
  }

  // ─── Keyboard handler ────────────────────────────────────────────────────────

  function onKeyPress(key: { name: string; shift: boolean }): void {
    if (isSaving) {
      return;
    }
    if (key.name === 'tab') {
      advanceFocus(key.shift ? -1 : 1);
    }
  }

  lowInput.on(InputRenderableEvents.ENTER, () => {
    advanceFocus(1);
  });
  highInput.on(InputRenderableEvents.ENTER, () => {
    advanceFocus(1);
  });
  unitTab.on(TabSelectRenderableEvents.ITEM_SELECTED, () => void save());

  ctx.keyInput.on('keypress', onKeyPress);

  applyFocus('low');

  // ─── Destroy ─────────────────────────────────────────────────────────────────

  function destroy(): void {
    ctx.keyInput.off('keypress', onKeyPress);
  }

  return { root, destroy };
}
