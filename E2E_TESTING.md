# E2E Testing with Playwright

This monorepo uses Playwright for end-to-end testing. Each package has its own Playwright configuration that imports shared settings from `workspace.config.ts`.

## Workspace Configuration

Port settings and package configuration are centralized in `workspace.config.ts` at the root:

```typescript
import { packages, getDevUrl, getPreviewUrl } from './workspace.config';

// Get port for crypto-viz: 6006
packages['crypto-viz'].devPort;

// Get full URL: http://localhost:6006
getDevUrl('crypto-viz');
```

### Package Ports

| Package | Dev Port | Preview Port |
|---------|----------|-------------|
| crypto-viz | 6006 | 6106 |
| macro-view | 6003 | 4173 |
| trading-dashboards | 6009 | 6109 |

## Setup

Install Playwright browsers (one-time setup):

```bash
bun run playwright:install
```

## Running Tests

### Run all e2e tests (from root)

This starts all dev servers and runs all tests:

```bash
bun run test:e2e
```

### Run tests for a specific package (recommended)

Each package has its own Playwright config. This only starts the server needed for that package:

```bash
# From root directory
bun run test:e2e:crypto-viz
bun run test:e2e:macro-view
bun run test:e2e:trading-dashboards

# Or from within the package directory
cd packages/crypto-viz
bun run test:e2e
```

## Configuration

### Workspace Config (`workspace.config.ts`)

Centralized configuration for all packages:
- Port numbers for dev and preview servers
- Package names and test directories
- Helper functions for URLs and paths

### Per-Package Configs

Each package has its own `playwright.config.ts` that:
- Imports settings from the workspace config
- Configures its own webServer (only starts that package's server)
- Runs tests from that package's `e2e/` directory

### Root Config (`playwright.config.ts`)

Used when running all tests together:
- Starts all dev servers simultaneously
- Runs tests from all packages
- Uses project-based organization

## Writing Tests

Create test files in `packages/<package-name>/e2e/` using the standard Playwright test format:

```typescript
import { expect, test } from '@playwright/test';

test.describe('Feature', () => {
  test('should work', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## Test Reports

After running tests, view the HTML report:

```bash
# From root (for all tests)
bunx playwright show-report

# From package directory (for that package's tests)
cd packages/crypto-viz
bunx playwright show-report
```

Test artifacts (screenshots, videos, traces) are saved to `test-results/` in the directory where tests were run.
