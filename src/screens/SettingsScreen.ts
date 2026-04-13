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
import { Unit, type Settings } from '../state/AppState.js';
import { createButton } from '../components/Button.js';
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

type FocusField = 'unit' | 'low' | 'high' | 'save' | 'logout';

const FOCUS_ORDER: ReadonlyArray<FocusField> = [
  'unit',
  'low',
  'high',
  'save',
  'logout',
];

const UNIT_OPTIONS = [
  { name: 'mg/dL', description: Unit.MgDl },
  { name: 'mmol/L', description: Unit.MmolL },
];

export type SettingsScreenOptions = {
  readonly settings: Settings;
  readonly onSave: (settings: Settings) => Promise<void>;
  readonly onLogout: () => Promise<void>;
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

function mgdlToDisplay(mgdl: number, unit: Unit): string {
  return unit === Unit.MmolL ? (mgdl / 18.0).toFixed(1) : String(mgdl);
}

function displayToMgdl(value: string, unit: Unit): number {
  const num = parseFloat(value.trim());
  return unit === Unit.MmolL
    ? Math.round(num * 18.0)
    : parseInt(value.trim(), 10);
}

function unitLabel(unit: Unit): string {
  return unit === Unit.MmolL ? 'mmol/L' : 'mg/dL';
}

function buildThresholdRow(
  ctx: RenderContext,
  id: string,
  label: string,
  initialMgdl: number,
  initialUnit: Unit,
): { row: BoxRenderable; input: InputRenderable; unitText: TextRenderable } {
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
    value: mgdlToDisplay(initialMgdl, initialUnit),
    width: 8,
    textColor: COLOR_DEFAULT_FG,
    backgroundColor: COLOR_TAB_INACTIVE_BG,
    focusedBackgroundColor: COLOR_TAB_INACTIVE_BG,
    cursorColor: COLOR_TAB_ACTIVE_BG,
  });

  row.add(input);

  const unitText = new TextRenderable(ctx, {
    id: `settings-${id}-unit`,
    content: unitLabel(initialUnit),
    fg: COLOR_AXIS,
  });

  row.add(unitText);

  return { row, input, unitText };
}

function buildUnitSection(
  ctx: RenderContext,
  initialUnit: Unit,
): { row: BoxRenderable; select: SelectRenderable } {
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

  const select = new SelectRenderable(ctx, {
    id: 'settings-unit-select',
    options: UNIT_OPTIONS,
    width: 10,
    height: 2,
    textColor: COLOR_TAB_INACTIVE_FG,
    backgroundColor: COLOR_BG,
    focusedBackgroundColor: COLOR_TAB_INACTIVE_BG,
    focusedTextColor: COLOR_DEFAULT_FG,
    selectedBackgroundColor: COLOR_TAB_ACTIVE_BG,
    selectedTextColor: COLOR_TAB_ACTIVE_FG,
    showDescription: false,
  });
  select.setSelectedIndex(initialUnit === Unit.MmolL ? 1 : 0);

  row.add(select);

  return { row, select };
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createSettingsScreen(
  ctx: RenderContext,
  options: SettingsScreenOptions,
): SettingsScreenComponent {
  let currentFocus: FocusField = 'unit';
  let currentUnit: Unit = options.settings.unit;
  let isSaving = false;

  // ─── Build UI ───────────────────────────────────────────────────────────────

  const root = new BoxRenderable(ctx, {
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

  const { row: unitRow, select: unitSelect } = buildUnitSection(
    ctx,
    options.settings.unit,
  );

  const {
    row: lowRow,
    input: lowInput,
    unitText: lowUnitText,
  } = buildThresholdRow(
    ctx,
    'low',
    'Low threshold:',
    options.settings.lowThreshold,
    options.settings.unit,
  );

  const {
    row: highRow,
    input: highInput,
    unitText: highUnitText,
  } = buildThresholdRow(
    ctx,
    'high',
    'High threshold:',
    options.settings.highThreshold,
    options.settings.unit,
  );

  const statusText = new TextRenderable(ctx, {
    id: 'settings-status',
    content: '',
    fg: COLOR_AXIS,
    width: '100%',
  });

  const saveButtonRow = new BoxRenderable(ctx, {
    id: 'settings-save-row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  });
  const saveButton = createButton(ctx, {
    id: 'settings-save-button',
    label: 'Save',
    onClick: () => {
      void save();
    },
  });

  const logoutButtonRow = new BoxRenderable(ctx, {
    id: 'settings-logout-row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  });
  const logoutButton = createButton(ctx, {
    id: 'settings-logout-button',
    label: 'Logout',
    onClick: () => {
      void options.onLogout();
    },
  });

  card.add(titleBox);
  card.add(unitRow);
  card.add(lowRow);
  card.add(highRow);
  card.add(statusText);
  saveButtonRow.add(saveButton.root);
  card.add(saveButtonRow);
  logoutButtonRow.add(logoutButton.root);
  card.add(logoutButtonRow);
  root.add(card);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function setStatus(message: string, isError = false): void {
    statusText.content = message;
    statusText.fg = isError ? COLOR_MEASUREMENT_RED : COLOR_MEASUREMENT_GREEN;
  }

  function applyFocus(field: FocusField): void {
    unitSelect.blur();
    lowInput.blur();
    highInput.blur();
    saveButton.root.blur();
    logoutButton.root.blur();

    currentFocus = field;

    if (field === 'unit') {
      unitSelect.focus();
    } else if (field === 'low') {
      lowInput.focus();
    } else if (field === 'high') {
      highInput.focus();
    } else if (field === 'save') {
      saveButton.root.focus();
    } else {
      logoutButton.root.focus();
    }
  }

  function advanceFocus(direction: 1 | -1): void {
    const idx = FOCUS_ORDER.indexOf(currentFocus);
    const next =
      FOCUS_ORDER[(idx + direction + FOCUS_ORDER.length) % FOCUS_ORDER.length];
    applyFocus(next);
  }

  function applyUnit(newUnit: Unit): void {
    if (newUnit === currentUnit) {
      return;
    }
    const lowMgdl = displayToMgdl(lowInput.value, currentUnit);
    const highMgdl = displayToMgdl(highInput.value, currentUnit);
    currentUnit = newUnit;
    lowInput.value = mgdlToDisplay(
      isNaN(lowMgdl) ? options.settings.lowThreshold : lowMgdl,
      newUnit,
    );
    highInput.value = mgdlToDisplay(
      isNaN(highMgdl) ? options.settings.highThreshold : highMgdl,
      newUnit,
    );
    lowUnitText.content = unitLabel(newUnit);
    highUnitText.content = unitLabel(newUnit);
  }

  // ─── Save ────────────────────────────────────────────────────────────────────

  async function save(): Promise<void> {
    if (isSaving) {
      return;
    }

    const lowMgdl = displayToMgdl(lowInput.value, currentUnit);
    const highMgdl = displayToMgdl(highInput.value, currentUnit);

    if (isNaN(lowMgdl) || lowMgdl < 40 || lowMgdl > 400) {
      applyFocus('low');
      setStatus('Low must be 40–400 mg/dL', true);
      return;
    }
    if (isNaN(highMgdl) || highMgdl < 40 || highMgdl > 400) {
      applyFocus('high');
      setStatus('High must be 40–400 mg/dL', true);
      return;
    }
    if (lowMgdl >= highMgdl) {
      applyFocus('low');
      setStatus('Low must be less than High', true);
      return;
    }

    isSaving = true;
    setStatus('Saving…');

    try {
      await options.onSave({
        ...options.settings,
        lowThreshold: lowMgdl,
        highThreshold: highMgdl,
        unit: currentUnit,
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

  unitSelect.on(SelectRenderableEvents.ITEM_SELECTED, () => {
    applyUnit(unitSelect.getSelectedIndex() === 1 ? Unit.MmolL : Unit.MgDl);
    advanceFocus(1);
  });
  lowInput.on(InputRenderableEvents.ENTER, () => {
    advanceFocus(1);
  });
  highInput.on(InputRenderableEvents.ENTER, () => {
    advanceFocus(1);
  });

  ctx.keyInput.on('keypress', onKeyPress);

  applyFocus('unit');

  // ─── Destroy ─────────────────────────────────────────────────────────────────

  function destroy(): void {
    ctx.keyInput.off('keypress', onKeyPress);
  }

  return { root, destroy };
}
