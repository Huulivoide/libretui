# libretui

A terminal UI for visualising [Abbott FreeStyle Libre](https://www.freestyle.abbott/) continuous glucose monitor (CGM) data, right in your terminal.

![libretui screenshot](https://github.com/Huulivoide/libretui/assets/placeholder.png)

## Features

- **Live screen** — real-time BG reading with large pallet-font value and braille trend arrow, colour-coded by measurement state
- **Graph screen** — scrolling historical BG graph with high/low threshold lines
- **Settings screen** — switch between mg/dL and mmol/L; configure alert thresholds
- **Single shared poller** — one background poll (every 60 s) feeds all screens simultaneously
- **Credential storage** — login credentials persisted securely via the envsec SDK
- **Settings persistence** — unit and threshold settings saved to `~/.config/libretui/settings.json`

## Requirements

- [Bun](https://bun.sh/) runtime
- An active [LibreView](https://www.libreview.com/) account linked to a FreeStyle Libre sensor

## Installation

```bash
git clone https://github.com/Huulivoide/libretui.git
cd libretui
npm install
```

## Usage

```bash
npm start
# or
bun src/index.ts
```

On first launch you will be prompted to select your LibreView server region, enter your email address and password. Credentials are saved and reused on subsequent launches.

### Key bindings

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Cycle between Live and Graph screens |
| `s` | Open Settings |
| `Esc` | Close Settings, return to Live |
| `Ctrl+C` / `q` | Quit |

## Development

```bash
npm run typecheck  # TypeScript type check
npm run lint       # ESLint
npm run format     # Prettier (writes)
npm run build      # Compile to dist/
bun test           # Run tests
```

## License

[ISC](./LICENSE) © Jesse Jaara
