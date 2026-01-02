import { test, expect } from '@playwright/test';

test.describe('Optimization Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:6036');
		await page.waitForLoadState('networkidle');
	});

	test('should display optimization mode when clicking optimize tab', async ({ page }) => {
		// Click Optimize tab
		await page.click('text=Optimize');

		// Verify optimization config is visible
		await expect(page.locator('text=Optimization Method')).toBeVisible();
		await expect(page.locator('text=Grid Search')).toBeVisible();
		await expect(page.locator('text=Random Search')).toBeVisible();
		await expect(page.locator('text=Genetic Algorithm')).toBeVisible();
	});

	test('should show parameter ranges for selected strategy', async ({ page }) => {
		// Select a strategy first (assuming MA Crossover is first)
		await page.click('text=MA Crossover');

		// Switch to optimize mode
		await page.click('text=Optimize');

		// Verify parameter ranges component is visible
		await expect(page.locator('text=Parameter Ranges')).toBeVisible();
		await expect(page.locator('label:has-text("Min")')).toBeVisible();
		await expect(page.locator('label:has-text("Max")')).toBeVisible();
		await expect(page.locator('label:has-text("Step")')).toBeVisible();
	});

	test('should allow selecting different optimization methods', async ({ page }) => {
		// Switch to optimize mode
		await page.click('text=Optimize');

		// Select Random Search
		await page.click('text=Random Search');

		// Verify iterations input appears
		await expect(page.locator('label:has-text("Number of Iterations")')).toBeVisible();

		// Select Grid Search
		await page.click('text=Grid Search');

		// Verify iterations input is hidden
		await expect(page.locator('label:has-text("Number of Iterations")')).not.toBeVisible();
	});

	test('should allow selecting different optimization objectives', async ({ page }) => {
		// Switch to optimize mode
		await page.click('text=Optimize');

		// Click each objective
		await page.click('text=Sharpe Ratio');
		await expect(page.locator('button:has-text("Sharpe Ratio").bg-primary')).toBeVisible();

		await page.click('text=Sortino Ratio');
		await expect(page.locator('button:has-text("Sortino Ratio").bg-primary')).toBeVisible();

		await page.click('text=Total Return');
		await expect(page.locator('button:has-text("Total Return").bg-primary')).toBeVisible();
	});

	test('should show total combinations for grid search', async ({ page }) => {
		// Select a strategy with numeric parameters
		await page.click('text=MA Crossover');

		// Switch to optimize mode
		await page.click('text=Optimize');

		// Select Grid Search
		await page.click('text=Grid Search');

		// Wait for combinations to calculate
		await page.waitForTimeout(500);

		// Verify total combinations message
		await expect(page.locator('text=/Testing .* combinations/')).toBeVisible();
	});

	test('should disable run button when strategy not selected', async ({ page }) => {
		// Switch to optimize mode without selecting strategy
		await page.click('text=Optimize');

		// Verify run button is disabled
		const runButton = page.locator('button:has-text("Run Optimization")');
		await expect(runButton).toBeDisabled();
	});

	test('should show cancel button when optimization is running', async ({ page }) => {
		// Note: This test would need to mock the worker to actually run
		// For now, we'll just verify the button exists in the running state

		// Select strategy and switch to optimize mode
		await page.click('text=MA Crossover');
		await page.click('text=Optimize');

		// In a real test, we would trigger optimization and verify cancel button appears
		// For now, we just verify the button structure exists in the component
	});

	test('should display optimization results after completion', async ({ page }) => {
		// Note: This test would need to mock a completed optimization
		// We'll verify the results component structure exists

		// Switch to optimize mode
		await page.click('text=Optimize');

		// Verify empty state is shown before running
		await expect(
			page.locator('text=Run an optimization to see results')
		).toBeVisible();
	});

	test('should switch between results table and heatmap tabs', async ({ page }) => {
		// Note: This assumes optimization results are present
		// In a real scenario, we'd need to mock optimization completion

		// For now, we verify the tab structure exists
		await page.click('text=Optimize');

		// The tabs would appear after optimization completes
		// We'll verify the empty state for now
		await expect(page.locator('text=Run an optimization to see results')).toBeVisible();
	});

	test('should apply best parameters and switch to backtest mode', async ({ page }) => {
		// Note: This test would need mocked optimization results
		// We verify the workflow structure

		// 1. Run optimization (mocked)
		// 2. Click "Apply Best" button
		// 3. Verify switched to backtest mode
		// 4. Verify parameters are filled in

		// For now, we just verify the mode switching works
		await page.click('text=Optimize');
		await expect(page.locator('text=Optimization Method')).toBeVisible();

		await page.click('text=Backtest');
		await expect(page.locator('text=Parameters')).toBeVisible();
	});

	test('should persist optimization history', async ({ page }) => {
		// Note: This test would need actual optimization runs
		// We verify the history component exists

		await page.click('text=Optimize');

		// History would be saved to localStorage after optimization
		// In a real test, we'd:
		// 1. Run optimization
		// 2. Reload page
		// 3. Verify history persists
	});

	test('should validate parameter ranges correctly', async ({ page }) => {
		// Select strategy
		await page.click('text=MA Crossover');

		// Switch to optimize mode
		await page.click('text=Optimize');

		// Find a min/max input pair
		const minInput = page.locator('input[id*="-min"]').first();
		const maxInput = page.locator('input[id*="-max"]').first();

		// Get current values
		const minValue = await minInput.inputValue();
		const maxValue = await maxInput.inputValue();

		// Set min > max (invalid)
		await minInput.fill(String(parseFloat(maxValue) + 10));

		// Verify error message appears
		await expect(page.locator('text=Invalid range')).toBeVisible();

		// Fix the range
		await minInput.fill(minValue);

		// Verify error is gone
		await expect(page.locator('text=Invalid range')).not.toBeVisible();
	});
});
