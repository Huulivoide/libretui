import { BoxRenderable, TextRenderable, type RenderContext } from '@opentui/core';
import { Screen } from '../state/AppState.js';
import {
  COLOR_TAB_ACTIVE_BG,
  COLOR_TAB_ACTIVE_FG,
  COLOR_TAB_INACTIVE_BG,
  COLOR_TAB_INACTIVE_FG,
} from './theme.js';

type NavTab = {
  readonly screen: Screen;
  readonly label: string;
};

const NAV_TABS: ReadonlyArray<NavTab> = [
  { screen: Screen.Live, label: 'Live' },
  { screen: Screen.Graph, label: 'Graph' },
  { screen: Screen.Settings, label: 'Settings' },
];

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
    backgroundColor: COLOR_TAB_INACTIVE_BG,
  });

  const tabs: Array<TabEntry> = NAV_TABS.map((tab) => {
    const box = new BoxRenderable(ctx, {
      id: `navbar-tab-${tab.screen}`,
      flexDirection: 'row',
      paddingLeft: 2,
      paddingRight: 2,
      backgroundColor: COLOR_TAB_INACTIVE_BG,
    });
    const label = new TextRenderable(ctx, {
      id: `navbar-label-${tab.screen}`,
      content: tab.label,
      fg: COLOR_TAB_INACTIVE_FG,
    });
    box.add(label);
    root.add(box);
    return { box, label, screen: tab.screen };
  });

  const setActive = (screen: Screen): void => {
    for (const tab of tabs) {
      const isActive = tab.screen === screen;
      tab.box.backgroundColor = isActive ? COLOR_TAB_ACTIVE_BG : COLOR_TAB_INACTIVE_BG;
      tab.label.fg = isActive ? COLOR_TAB_ACTIVE_FG : COLOR_TAB_INACTIVE_FG;
    }
  };

  return { root, setActive };
}
