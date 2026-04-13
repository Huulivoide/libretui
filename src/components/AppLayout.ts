import { BoxRenderable, type RenderContext } from '@opentui/core';
import { Screen } from '../state/AppState.js';
import { createNavBar } from './NavBar.js';
import { COLOR_BG } from './theme.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppLayoutOptions = {
  readonly onNavigate: (screen: Screen) => void;
};

export type AppLayoutComponent = {
  readonly root: BoxRenderable;
  readonly setActiveTab: (screen: Screen) => void;
  readonly setContent: (content: BoxRenderable) => void;
  readonly clearContent: () => void;
};

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createAppLayout(
  ctx: RenderContext,
  options: AppLayoutOptions,
): AppLayoutComponent {
  const root = new BoxRenderable(ctx, {
    id: 'app-layout',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: COLOR_BG,
  });

  const { root: navBarRoot, setActive } = createNavBar(ctx, {
    onNavigate: options.onNavigate,
  });

  const contentSlot = new BoxRenderable(ctx, {
    id: 'app-layout-content',
    flexGrow: 1,
    flexDirection: 'column',
  });

  root.add(navBarRoot);
  root.add(contentSlot);

  let currentContentId: string | null = null;

  function setContent(content: BoxRenderable): void {
    if (currentContentId) {
      contentSlot.remove(currentContentId);
    }
    currentContentId = content.id;
    contentSlot.add(content);
  }

  function clearContent(): void {
    if (currentContentId) {
      contentSlot.remove(currentContentId);
    }
    currentContentId = null;
  }

  function setActiveTab(screen: Screen): void {
    setActive(screen);
  }

  return { root, setActiveTab, setContent, clearContent };
}
