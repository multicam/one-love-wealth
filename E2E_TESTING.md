# E2E Testing with Playwright

This monorepo uses a shared Playwright configuration for end-to-end testing across all packages.

## Setup

Install Playwright browsers (one-time setup):

```bash
bun run playwright:install
```

## Running Tests

### Run all e2e tests

```bash
bun run test:e2e
```

### Run tests for a specific package

```bash
# Crypto Viz
bun run test:e2e:crypto-viz

# Macro View
bun run test:e2e:macro-view

# Trading Dashboards
bun run test:e2e:trading-dashboards
```

### Run from within a package

```bash
cd packages/crypto-viz
bun run test:e2e
```

## Configuration

The shared Playwright configuration is located at the root `playwright.config.ts`.

Each package has its own:
- `e2e/` directory containing test files
- Project configuration in the root config
- Dev server configuration for running tests

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
bunx playwright show-report
```

Test artifacts (screenshots, videos, traces) are saved to `test-results/`.
