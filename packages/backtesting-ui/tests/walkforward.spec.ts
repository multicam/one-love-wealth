import { test, expect } from '@playwright/test';

test.describe('Walk-Forward Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6036');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h1:has-text("Backtesting UI")', { timeout: 15000 });
  });

  test('should display walk-forward mode when clicking walk-forward tab', async ({ page }) => {
    // Navigate directly to walk-forward route
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    // Verify config panel appears
    await expect(page.getByRole('heading', { name: 'Walk-Forward Analysis' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Window Configuration')).toBeVisible();
    await expect(page.getByText('In-Sample Period')).toBeVisible();
    await expect(page.getByText('Out-of-Sample Period')).toBeVisible();
  });

  test('should show window configuration sliders', async ({ page }) => {
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    // Check for sliders
    const sliders = page.locator('input[type="range"]');
    await expect(sliders).toHaveCount(3); // in-sample, out-sample, step size

    // Check for anchored checkbox
    const anchoredCheckbox = page.locator('input[type="checkbox"]');
    await expect(anchoredCheckbox).toBeVisible();
  });

  test('should show empty state in results panel initially', async ({ page }) => {
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    // Center panel should show "No Results Yet"
    await expect(page.getByText('No Results Yet')).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText('Configure your walk-forward parameters and run an analysis')
    ).toBeVisible();
  });

  test('should adjust sliders correctly', async ({ page }) => {
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    await page.waitForSelector('text=In-Sample Period', { timeout: 10000 });

    // Get the in-sample slider
    const inSampleSlider = page.locator('input[type="range"]').first();

    // Move slider and verify value updates
    await inSampleSlider.fill('70');

    // Check that percentage is displayed
    await expect(page.getByText('70%')).toBeVisible();
  });

  test('should show run button disabled when no strategy selected', async ({ page }) => {
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    await page.waitForSelector('button:has-text("Run Walk-Forward Analysis")', { timeout: 10000 });

    const runButton = page.getByRole('button', { name: 'Run Walk-Forward Analysis' });
    await expect(runButton).toBeDisabled();
  });

  test('should enable run button when strategy is selected', async ({ page }) => {
    // Navigate to walk-forward route
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    // Select strategy directly from left panel
    const strategy = page.getByRole('button', { name: /MA Crossover/ });
    await strategy.click();

    // Wait for strategy selection to persist
    await page.waitForTimeout(500);

    // Verify run button is enabled
    const runButton = page.getByRole('button', { name: 'Run Walk-Forward Analysis' });
    await expect(runButton).toBeEnabled();
  });

  test('should display timeline visualization after analysis (mock)', async ({ page }) => {
    // This test assumes mock data returns immediately

    // Navigate to walk-forward route
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    // Select strategy directly from left panel
    await page.getByRole('button', { name: /MA Crossover/ }).click();

    // Wait for strategy selection
    await page.waitForTimeout(500);

    // Run analysis
    const runButton = page.getByRole('button', { name: 'Run Walk-Forward Analysis' });
    await runButton.click();

    // Wait for analysis to complete (mock should be fast)
    await page.waitForSelector('text=Timeline', { timeout: 30000 });

    // Verify results tabs appear
    await expect(page.getByRole('button', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Timeline', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Windows', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Equity Curve', exact: true })).toBeVisible();
  });

  test('should show aggregate metrics in overview tab', async ({ page }) => {
    // Navigate to walk-forward route
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    // Select strategy directly from left panel
    await page.getByRole('button', { name: /MA Crossover/ }).click();

    // Wait for strategy selection
    await page.waitForTimeout(500);

    // Run analysis
    const runButton = page.getByRole('button', { name: 'Run Walk-Forward Analysis' });
    await runButton.click();

    // Wait for overview
    await page.waitForSelector('text=Aggregate Performance', { timeout: 30000 });

    // Check for key metrics
    await expect(page.getByText('In-Sample Average')).toBeVisible();
    await expect(page.getByText('Out-of-Sample Average')).toBeVisible();
    await expect(page.getByText('Degradation Analysis')).toBeVisible();
    await expect(page.getByText(/PASS|FAIL/)).toBeVisible();
  });

  test('should display timeline graph when clicking timeline tab', async ({ page }) => {
    // Navigate to walk-forward route
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    // Select strategy directly from left panel
    await page.getByRole('button', { name: /MA Crossover/ }).click();

    // Wait for strategy selection
    await page.waitForTimeout(500);

    // Run analysis
    const runButton = page.getByRole('button', { name: 'Run Walk-Forward Analysis' });
    await runButton.click();

    // Wait for results
    await page.waitForSelector('button:has-text("Timeline")', { timeout: 30000 });

    // Click timeline tab
    const timelineTab = page.getByRole('button', { name: 'Timeline', exact: true });
    await timelineTab.click();

    // Verify timeline visualization appears
    await expect(page.getByText('Timeline')).toBeVisible();

    // Check for SVG (d3 chart)
    const svg = page.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should display window results table', async ({ page }) => {
    // Navigate to walk-forward route
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    // Select strategy directly from left panel
    await page.getByRole('button', { name: /MA Crossover/ }).click();

    // Wait for strategy selection
    await page.waitForTimeout(500);

    // Run analysis
    const runButton = page.getByRole('button', { name: 'Run Walk-Forward Analysis' });
    await runButton.click();

    // Wait for results
    await page.waitForSelector('button:has-text("Windows")', { timeout: 30000 });

    // Click windows tab
    const windowsTab = page.getByRole('button', { name: 'Windows', exact: true });
    await windowsTab.click();

    // Verify table appears
    await expect(page.getByText('Per-Window Results')).toBeVisible();
    await expect(page.getByText('In-Sample Sharpe')).toBeVisible();
    await expect(page.getByText('Out-Sample Sharpe')).toBeVisible();
    await expect(page.getByText('Degradation')).toBeVisible();
  });

  test('should display equity curve chart', async ({ page }) => {
    // Navigate to walk-forward route
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    // Select strategy directly from left panel
    await page.getByRole('button', { name: /MA Crossover/ }).click();

    // Wait for strategy selection
    await page.waitForTimeout(500);

    // Run analysis
    const runButton = page.getByRole('button', { name: 'Run Walk-Forward Analysis' });
    await runButton.click();

    // Wait for results
    await page.waitForSelector('button:has-text("Equity Curve")', { timeout: 30000 });

    // Click equity curve tab
    const equityTab = page.getByRole('button', { name: 'Equity Curve', exact: true });
    await equityTab.click();

    // Verify equity curve appears
    await expect(page.getByText('Stitched Out-of-Sample Equity Curve')).toBeVisible();

    // Check for SVG (d3 chart)
    const svg = page.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should allow resetting configuration', async ({ page }) => {
    await page.goto('http://localhost:6036/walk-forward');
    await page.waitForLoadState('domcontentloaded');

    await page.waitForSelector('text=Window Configuration', { timeout: 10000 });

    // Change a slider
    const inSampleSlider = page.locator('input[type="range"]').first();
    await inSampleSlider.fill('70');
    await expect(page.getByText('70%')).toBeVisible();

    // Click reset button
    const resetButton = page.getByRole('button', { name: 'Reset to Defaults' });
    await resetButton.click();

    // Verify default value is restored (60%)
    await expect(page.getByText('60%')).toBeVisible();
  });
});
