# ALIVE Life Simulator

ALIVE is a life simulation game built with HTML, CSS, and JavaScript.

## Features

- Dynamic city and economy simulation
- Health and education systems
- Career development and job requirements
- Rich asset library for characters and environments

## Development

To run the project locally, you can use the built-in server:

```bash
node server.js
```

Or open `index.html` directly in your browser.

## Build

Scripts for building and processing data are included:

- `build.ps1` / `build.js`: Main build scripts.
- `generate_cities.js`: Generates city data.
- `generate_items.js`: Generates item data.
- `validate_json.js`: Validates data structures.

## Testing

### Unit & Integration Tests

```bash
npm test
```

Runs smoke tests, game lifecycle tests, IAP tests, integrity checks, and asset integrity checks.

### Visual Regression Tests (Playwright)

Visual tests capture screenshots of key screens and compare them against baselines to catch UI regressions.

#### First-time setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (one-time)
npm run test:visual:install
```

#### Running visual tests

```bash
# Run all visual tests
npm run test:visual

# Update baseline snapshots (after intentional UI changes)
npm run test:visual:update
```

#### What gets tested

| Screen | Snapshot |
|---|---|
| Menu / Title | `01-menu.png` |
| Character Creation | `02-create.png` |
| Game HUD | `03-game-hud.png` |
| Shop Overlay | `04-shop.png` |
| Summary / Death | `05-summary.png` |

Each screen is tested on Desktop Chrome (1280×720) and Mobile Safari (375×812).

#### Troubleshooting

- **"browserType.launch: Executable doesn't exist"** — Run `npm run test:visual:install` to download browsers.
- **Diff failures** — Check `test-results/` for actual vs expected diff images.
- **Update snapshots** — Run `npm run test:visual:update` after intentional UI changes, then commit the new `.png` files.
- **CI failures** — Download the `test-results` artifact from the GitHub Actions run for diff screenshots.

### Full CI Pipeline

```bash
npm run ci
```

Runs all unit tests, then visual regression tests.
