# Copilot Instructions

## Project

`libretui` is a TUI application for visualising Abbott FreeStyle Libre CGM data in the terminal. It uses `@opentui/core` for rendering and `libre-link-unofficial-api` to fetch data from Abbott's LibreView API.

## Runtime

**Bun** is required to run the application. npm is used for package management.

```bash
npm install      # Install dependencies
bun src/index.ts # Run the app (or: npm start)
```

## Commands

```bash
npm start          # Run application (bun src/index.ts)
npm run typecheck  # TypeScript type check (no emit)
npm run lint       # ESLint
npm run format     # Prettier (writes)
npm run build      # Compile to dist/
bun test           # Run tests
```

## Module System

All source files use **ESM** (`import`/`export`). No `require()`.

## Project Structure

```
src/
  index.ts              # Entry point: renderer setup, screen routing, global key handling
  state/
    AppState.ts         # Shared enums and types: Screen, Unit, Server, Settings
  services/
    LibreService.ts     # Abbott API: login, fetchReadings, logout
    DataPoller.ts       # Shared polling singleton: start/stop/on/off events
    SettingsStore.ts    # Persist settings to ~/.config/libretui/settings.json
    CredentialStore.ts  # Persist credentials via envsec SDK
  screens/
    LoginScreen.ts      # Server selection, email, password input, login button; onLogin callback
    LiveScreen.ts       # Live BG reading; subscribes to DataPoller 'data' events
    GraphScreen.ts      # Historical BG graph; subscribes to DataPoller, resize-aware
    SettingsScreen.ts   # Unit (mg/dL / mmol/L) and alert thresholds
  components/
    NavBar.ts           # Top navigation bar shared by Live, Graph, Settings
    AppLayout.ts        # Shared layout shell: NavBar + content slot for nav screens
    TrendArrow.ts       # Glucose trend direction arrow
    BgGraph.ts          # FrameBufferRenderable glucose history graph
    Button.ts           # Reusable focusable button component
    theme.ts            # Central colour palette (pre-parsed RGBA constants)
```

## Architecture

### Screen Component Pattern

Every screen is created by a factory function and returns `{ root: BoxRenderable, destroy: () => void }`:

```typescript
type MyScreenComponent = { root: BoxRenderable; destroy: () => void };

export function createMyScreen(ctx: RenderContext, options: MyScreenOptions): MyScreenComponent {
  // build UI sections via dedicated builder functions
  // wire events in the factory
  return { root, destroy };
}
```

- `root` — the top-level `BoxRenderable` attached to the renderer via `renderer.root.add(root)`.
- `destroy()` — removes all keypress/resize listeners and cleans up the component tree.
- UI construction is split into **section builder functions** (e.g. `buildEmailSection`, `buildPasswordSection`). The factory function only handles event wiring.

### Screen Navigation (`src/index.ts`)

- `mount(screen, component)` — tears down the current screen and attaches the new one.
- `navigateTo(screen)` — builds the appropriate component and calls `mount`.
- Global Tab/Shift+Tab cycles between `Live` and `Graph` screens.
- Global Escape navigates away from `Settings` back to `Live`.
- `Login` and `Settings` intercept Tab internally for field focus, so the global handler skips Tab when those screens are active.

### Password Field

`LoginScreen` uses a regular `InputRenderable` for the password field. The value is shown as typed and `Enter` submits from that input.

### Unit Conversion

`SettingsScreen` stores thresholds internally in mg/dL and converts to/from the selected display unit using `mgdlToDisplay` / `displayToMgdl` helpers. When the unit tab changes, displayed input values update automatically.

### AppLayout Component

`src/components/AppLayout.ts` exports `createAppLayout(ctx, options)` returning `{ root, setActiveTab, setContent, clearContent }`.

- Instantiated **once** in `index.ts` and kept alive across screen navigations.
- Contains the `NavBar` and a `contentSlot` (`BoxRenderable` with `flexGrow: 1`).
- `setContent(content)` swaps the active screen's content box into the slot.
- `clearContent()` removes the current content (called before destroy).
- `setActiveTab(screen)` delegates to the NavBar's `setActive`.
- Only used for nav screens (Live, Graph, Settings). Login/AutoLogin mount directly on `renderer.root`.
- Live, Graph, and Settings screens no longer create their own outer root or NavBar — they return their content box as `root`.

### Button Component

`src/components/Button.ts` exports `createButton(ctx, options)` returning `{ root: BoxRenderable }`.

- The `root` is a `BoxRenderable` with `focusable: true` containing a `TextRenderable` label.
- It subscribes to `RenderableEvents.FOCUSED`/`BLURRED` on itself to auto-toggle colors — no manual color management in callers.
- `onMouseDown` on the root fires `onClick` (click activates even when unfocused).
- `onKeyDown` on the root fires `onClick` for Enter/Space when focused.
- Callers call `.root.focus()` / `.root.blur()` for Tab-cycle focus management.
- Centering is the caller's responsibility (wrap in a `BoxRenderable` row with `justifyContent: 'center'`).

```typescript
type ButtonOptions = {
  readonly id: string;
  readonly label: string;
  readonly onClick: () => void;
  readonly paddingLeft?: number;   // default 3
  readonly paddingRight?: number;  // default 3
  readonly normalBg?: RGBA;        // default COLOR_TAB_INACTIVE_BG
  readonly normalFg?: RGBA;        // default COLOR_DEFAULT_FG
  readonly focusedBg?: RGBA;       // default COLOR_TAB_ACTIVE_BG
  readonly focusedFg?: RGBA;       // default COLOR_TAB_ACTIVE_FG
};
```

### DataPoller Service

`src/services/DataPoller.ts` is a **module-level singleton** that polls the Abbott API every 60 s and emits typed events to all subscribers.

- `start()` — begins polling immediately and at every 60 s interval.
- `stop()` — clears the interval; called on logout.
- `on('data', handler)` / `off('data', handler)` — subscribe to successful poll results (`ReadonlyArray<GlucoseReading>`).
- `on('error', handler)` / `off('error', handler)` — subscribe to poll errors (`string` message).
- Errors do **not** stop polling — the poller retries on the next tick.
- `index.ts` calls `DataPoller.start()` after successful login and `DataPoller.stop()` on logout.
- Live and Graph screens subscribe in their factory and unsubscribe in `destroy()`.
- Internally calls `LibreService.fetchReadings()` which merges `graphData` + `connection.glucoseItem` (only if `glucoseItem` timestamp is strictly later than the last `graphData` entry).

### BgGraph Sizing

`BgGraph` is a `FrameBufferRenderable` with a fixed pixel size. `GraphScreen` listens to `ctx.on('resize')` and rebuilds the graph with the new terminal dimensions.

### Streaming

`DataPoller` replaces the old per-screen streaming/fetching. `LiveScreen` shows the last item from the polled array; `GraphScreen` renders the full array as a graph.

## Code Style Conventions

These are enforced by ESLint where possible and must be followed everywhere:

- **`type` over `interface`** — always use `type` for type definitions, never `interface`.
- **`readonly` by default** — all properties on types/objects should be `readonly` unless mutation is explicitly required.
- **`Array<T>` / `ReadonlyArray<T>`** — never use `T[]` or `readonly T[]` shorthand notation.
- **Always brace `if` blocks** — every `if`/`else`/`for`/`while` body must use `{}`, even single-line ones.
- **No confusing void expressions** — arrow function shorthands that call a `void`-returning function must use braces: `() => { fn(); }` not `() => fn()`.
- **String enum values match key names** — e.g. `Login = 'Login'`, not `Login = 'login'`.
- **Use library getters for BG values** — `GlucoseReading.value` (mg/dL) and `GlucoseReading.mmol` (mmol/L) are available directly; don't write custom conversion utilities.

## Git Workflow

**Never commit directly to `main`.** All changes must be made on a feature branch and submitted via a pull request. This applies to every change, no matter how small.

## PR Convention

Every PR description must include a **"Prompts used"** section briefly summarising the user prompts that drove the work in that PR.
