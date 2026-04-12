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

## Code Style Conventions

These are enforced by ESLint where possible and must be followed everywhere:

- **`type` over `interface`** — always use `type` for type definitions, never `interface`.
- **`readonly` by default** — all properties on types/objects should be `readonly` unless mutation is explicitly required.
- **`Array<T>` / `ReadonlyArray<T>`** — never use `T[]` or `readonly T[]` shorthand notation.
- **Always brace `if` blocks** — every `if`/`else`/`for`/`while` body must use `{}`, even single-line ones.
- **String enum values match key names** — e.g. `Login = 'Login'`, not `Login = 'login'`.
- **Use library getters for BG values** — `GlucoseReading.value` (mg/dL) and `GlucoseReading.mmol` (mmol/L) are available directly; don't write custom conversion utilities.

## PR Convention

Every PR description must include a **"Prompts used"** section briefly summarising the user prompts that drove the work in that PR.

> This file should be updated as the project architecture is implemented.
