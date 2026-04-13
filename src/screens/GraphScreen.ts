import {
  BoxRenderable,
  TextRenderable,
  type RenderContext,
} from '@opentui/core';
import { type GlucoseReading } from 'libre-link-unofficial-api';
import { Screen, type Settings } from '../state/AppState.js';
import { createNavBar } from '../components/NavBar.js';
import {
  createTrendArrow,
  type TrendArrowComponent,
} from '../components/TrendArrow.js';
import { createBgGraph, type BgGraphComponent } from '../components/BgGraph.js';
import * as LibreService from '../services/LibreService.js';
import {
  COLOR_BG,
  COLOR_AXIS,
  COLOR_MEASUREMENT_RED,
} from '../components/theme.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const NAVBAR_HEIGHT = 1;
const HEADER_HEIGHT = 1;
const CHROME_HEIGHT = NAVBAR_HEIGHT + HEADER_HEIGHT;

// ─── Types ────────────────────────────────────────────────────────────────────

export type GraphScreenOptions = {
  readonly settings: Settings;
  readonly onNavigate: (screen: Screen) => void;
};

export type GraphScreenComponent = {
  readonly root: BoxRenderable;
  readonly destroy: () => void;
};

// ─── Section builders ────────────────────────────────────────────────────────

function buildHeader(ctx: RenderContext): {
  root: BoxRenderable;
  trendArrow: TrendArrowComponent;
  lastUpdatedText: TextRenderable;
  errorText: TextRenderable;
} {
  const root = new BoxRenderable(ctx, {
    id: 'graph-header',
    flexDirection: 'row',
    width: '100%',
    height: HEADER_HEIGHT,
    alignItems: 'center',
    gap: 2,
    paddingLeft: 1,
    backgroundColor: COLOR_BG,
  });

  const trendArrow = createTrendArrow(ctx);

  const lastUpdatedText = new TextRenderable(ctx, {
    id: 'graph-last-updated',
    content: 'Fetching…',
    fg: COLOR_AXIS,
    flexGrow: 1,
  });

  const errorText = new TextRenderable(ctx, {
    id: 'graph-error',
    content: '',
    fg: COLOR_MEASUREMENT_RED,
  });
  errorText.visible = false;

  root.add(trendArrow.root);
  root.add(lastUpdatedText);
  root.add(errorText);

  return { root, trendArrow, lastUpdatedText, errorText };
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createGraphScreen(
  ctx: RenderContext,
  options: GraphScreenOptions,
): GraphScreenComponent {
  let currentGraph: BgGraphComponent | null = null;
  let latestReadings: ReadonlyArray<GlucoseReading> = [];
  let stopped = false;

  // ─── Build UI ───────────────────────────────────────────────────────────────

  const root = new BoxRenderable(ctx, {
    id: 'graph-root',
    width: '100%',
    height: '100%',
    backgroundColor: COLOR_BG,
    flexDirection: 'column',
  });

  const { root: navBarRoot, setActive } = createNavBar(ctx, {
    onNavigate: options.onNavigate,
  });
  setActive(Screen.Graph);

  const {
    root: headerRoot,
    trendArrow,
    lastUpdatedText,
    errorText,
  } = buildHeader(ctx);

  const graphContainer = new BoxRenderable(ctx, {
    id: 'graph-container',
    width: '100%',
    flexGrow: 1,
  });

  root.add(navBarRoot);
  root.add(headerRoot);
  root.add(graphContainer);

  // ─── Graph lifecycle ────────────────────────────────────────────────────────

  function rebuildGraph(width: number, height: number): void {
    if (currentGraph) {
      graphContainer.remove('bg-graph');
    }
    const graphHeight = Math.max(1, height - CHROME_HEIGHT);
    currentGraph = createBgGraph(ctx, width, graphHeight);
    graphContainer.add(currentGraph.root);
    if (latestReadings.length > 0) {
      currentGraph.update(latestReadings, options.settings);
    }
  }

  rebuildGraph(ctx.width, ctx.height);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function onReadings(readings: ReadonlyArray<GlucoseReading>): void {
    const latest = readings.at(-1);
    if (!latest) {
      return;
    }
    latestReadings = readings;
    errorText.visible = false;
    trendArrow.update(latest, options.settings.unit);
    lastUpdatedText.content = `Updated ${latest.timestamp.toLocaleTimeString()}`;
    currentGraph?.update(readings, options.settings);
  }

  function onError(err: unknown): void {
    const message = err instanceof Error ? err.message : 'Stream error';
    errorText.content = message;
    errorText.visible = true;
    lastUpdatedText.content = 'Retrying…';
  }

  // ─── Data fetching ──────────────────────────────────────────────────────────

  async function fetchHistory(): Promise<void> {
    try {
      const readings = await LibreService.history();
      if (!stopped) {
        onReadings(readings);
      }
    } catch (err) {
      if (!stopped) {
        onError(err);
      }
    }
  }

  void fetchHistory();

  // ─── Resize ──────────────────────────────────────────────────────────────────

  function onResize(width: number, height: number): void {
    rebuildGraph(width, height);
  }

  ctx.on('resize', onResize);

  // ─── Destroy ─────────────────────────────────────────────────────────────────

  function destroy(): void {
    stopped = true;
    ctx.off('resize', onResize);
  }

  return { root, destroy };
}
