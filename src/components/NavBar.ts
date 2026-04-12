import {
  BoxRenderable,
  TextRenderable,
  RGBA,
  type RenderContext,
} from '@opentui/core';
import { Screen } from '../state/AppState.js';

type NavTab = {
  readonly screen: Screen;
  readonly label: string;
};

const NAV_TABS: ReadonlyArray<NavTab> = [
  { screen: Screen.Live, label: 'Live' },
  { screen: Screen.Graph, label: 'Graph' },
  { screen: Screen.Settings, label: 'Settings' },
];

const ACTIVE_BG = RGBA.fromHex('#7aa2f7');
const ACTIVE_FG = RGBA.fromHex('#1a1b26');
const INACTIVE_BG = RGBA.fromHex('#1e2030');
const INACTIVE_FG = RGBA.fromHex('#545c7e');

type TabEntry = {
  readonly box: BoxRenderable;
  readonly label: TextRenderable;
  readonly screen: Screen;
};

export type NavBarComponent = {
  readonly root: BoxRenderable;
  readonly setActive: (screen: Screen) => void;
};

export function createNavBar(ctx: RenderContext): NavBarComponent {
  const root = new BoxRenderable(ctx, {
    id: 'navbar',
    flexDirection: 'row',
    width: '100%',
    height: 1,
    backgroundColor: INACTIVE_BG,
  });

  const tabs: Array<TabEntry> = NAV_TABS.map((tab) => {
    const box = new BoxRenderable(ctx, {
      id: `navbar-tab-${tab.screen}`,
      flexDirection: 'row',
      paddingLeft: 2,
      paddingRight: 2,
      backgroundColor: INACTIVE_BG,
    });
    const label = new TextRenderable(ctx, {
      id: `navbar-label-${tab.screen}`,
      content: tab.label,
      fg: INACTIVE_FG,
    });
    box.add(label);
    root.add(box);
    return { box, label, screen: tab.screen };
  });

  const setActive = (screen: Screen): void => {
    for (const tab of tabs) {
      const isActive = tab.screen === screen;
      tab.box.backgroundColor = isActive ? ACTIVE_BG : INACTIVE_BG;
      tab.label.fg = isActive ? ACTIVE_FG : INACTIVE_FG;
    }
  };

  return { root, setActive };
}
