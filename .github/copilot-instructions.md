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
    LibreService.ts     # Abbott API: login, read, history, stream, logout
    SettingsStore.ts    # Persist settings to ~/.config/libretui/settings.json
    CredentialStore.ts  # Persist credentials via envsec SDK
  screens/
    LoginScreen.ts      # Server selection, email, password input, login button; onLogin callback
    LiveScreen.ts       # Real-time BG reading via async generator stream
    GraphScreen.ts      # Historical BG graph; resize-aware
    SettingsScreen.ts   # Unit (mg/dL / mmol/L) and alert thresholds
  components/
    NavBar.ts           # Top navigation bar shared by Live, Graph, Settings
    TrendArrow.ts       # Glucose trend direction arrow
    BgGraph.ts          # FrameBufferRenderable glucose history graph
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

### BgGraph Sizing

`BgGraph` is a `FrameBufferRenderable` with a fixed pixel size. `GraphScreen` listens to `ctx.on('resize')` and rebuilds the graph with the new terminal dimensions.

### Streaming

`LiveScreen` consumes `LibreService.stream()`, an async generator. `destroy()` calls `generator.return()` to terminate the stream.

## Code Style Conventions

These are enforced by ESLint where possible and must be followed everywhere:

- **`type` over `interface`** — always use `type` for type definitions, never `interface`.
- **`readonly` by default** — all properties on types/objects should be `readonly` unless mutation is explicitly required.
- **`Array<T>` / `ReadonlyArray<T>`** — never use `T[]` or `readonly T[]` shorthand notation.
- **Always brace `if` blocks** — every `if`/`else`/`for`/`while` body must use `{}`, even single-line ones.
- **No confusing void expressions** — arrow function shorthands that call a `void`-returning function must use braces: `() => { fn(); }` not `() => fn()`.
- **String enum values match key names** — e.g. `Login = 'Login'`, not `Login = 'login'`.
- **Use library getters for BG values** — `GlucoseReading.value` (mg/dL) and `GlucoseReading.mmol` (mmol/L) are available directly; don't write custom conversion utilities.

## PR Convention

Every PR description must include a **"Prompts used"** section briefly summarising the user prompts that drove the work in that PR.
