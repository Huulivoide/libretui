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

> This file should be updated as the project architecture is implemented.
