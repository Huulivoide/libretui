import {
  BoxRenderable,
  TextRenderable,
  TextAttributes,
  RenderableEvents,
  type RenderContext,
} from '@opentui/core';
import { RGBA } from '@opentui/core';
import {
  COLOR_DEFAULT_FG,
  COLOR_TAB_ACTIVE_BG,
  COLOR_TAB_ACTIVE_FG,
  COLOR_TAB_INACTIVE_BG,
} from './theme.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonOptions = {
  readonly id: string;
  readonly label: string;
  readonly onClick: () => void;
  readonly paddingLeft?: number;
  readonly paddingRight?: number;
  readonly normalBg?: RGBA;
  readonly normalFg?: RGBA;
  readonly focusedBg?: RGBA;
  readonly focusedFg?: RGBA;
};

export type ButtonComponent = {
  readonly root: BoxRenderable;
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createButton(
  ctx: RenderContext,
  options: ButtonOptions,
): ButtonComponent {
  const normalBg = options.normalBg ?? COLOR_TAB_INACTIVE_BG;
  const normalFg = options.normalFg ?? COLOR_DEFAULT_FG;
  const focusedBg = options.focusedBg ?? COLOR_TAB_ACTIVE_BG;
  const focusedFg = options.focusedFg ?? COLOR_TAB_ACTIVE_FG;

  const root = new BoxRenderable(ctx, {
    id: options.id,
    focusable: true,
    paddingLeft: options.paddingLeft ?? 3,
    paddingRight: options.paddingRight ?? 3,
    backgroundColor: normalBg,
    onMouseDown: () => {
      options.onClick();
    },
    onKeyDown: (key) => {
      if (
        key.name === 'enter' ||
        key.name === 'return' ||
        key.name === 'space'
      ) {
        options.onClick();
      }
    },
  });

  const label = new TextRenderable(ctx, {
    id: `${options.id}-label`,
    content: options.label,
    fg: normalFg,
    attributes: TextAttributes.BOLD,
  });

  root.add(label);

  root.on(RenderableEvents.FOCUSED, () => {
    root.backgroundColor = focusedBg;
    label.fg = focusedFg;
  });

  root.on(RenderableEvents.BLURRED, () => {
    root.backgroundColor = normalBg;
    label.fg = normalFg;
  });

  return { root };
}
