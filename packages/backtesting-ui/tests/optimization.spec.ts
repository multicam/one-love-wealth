import { test, expect } from '@playwright/test';

test.describe('Optimization Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:6036');
		await page.waitForLoadState('domcontentloaded');
		// Wait for Svelte app to hydrate by checking for the header element
		await page.waitForSelector('h1:has-text("Backtesting UI")', { timeout: 15000 });
	});

	test('should display optimization mode when clicking optimize tab', async ({ page }) => {
		// Navigate directly to optimize route
		await page.goto('http://localhost:6036/optimize');
		await page.waitForLoadState('domcontentloaded');

		// Verify optimization config is visible
		await expect(page.getByText('Optimization Method')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('Grid Search')).toBeVisible();
	});

	test.skip('should show parameter ranges for selected strategy', async ({ page }) => {
		// Navigate directly to optimize route
		await page.goto('http://localhost:6036/optimize');
		await page.waitForLoadState('domcontentloaded');

		// Wait for page to load
		await expect(page.getByText('Optimization Method')).toBeVisible({ timeout: 10000 });

		// Wait for strategy list to be visible
		await page.waitForSelector('button:has-text("MA Crossover")', { state: 'visible' });

		// Select a strategy from left panel
		const strategyBtn = page.getByRole('button', { name: /MA Crossover/ });
		await strategyBtn.click();

		// Give Svelte time to process the click and update stores
		await page.waitForTimeout(2000);

		// Verify parameter ranges component is visible with longer timeout
		await expect(page.getByText('Parameter Ranges')).toBeVisible({ timeout: 10000 });
	});

	test.skip('should allow selecting different optimization methods', async ({ page }) => {
		// Navigate directly to optimize route
		await page.goto('http://localhost:6036/optimize');
		await page.waitForLoadState('domcontentloaded');

		// Wait for panel to load
		await expect(page.getByText('Optimization Method')).toBeVisible({ timeout: 10000 });

		// Grid Search is selected by default, verify it
		await expect(page.getByText(/Tests all parameter combinations/)).toBeVisible();

		// Select Random Search
		const randomBtn = page.getByRole('button', { name: /Random Search/ });
		await randomBtn.click();

		// Give Svelte time to process the click
		await page.waitForTimeout(1000);

		// Verify iterations input appears with longer timeout
		await expect(page.getByText('Number of Iterations')).toBeVisible({ timeout: 10000 });
	});

	test('should allow selecting different optimization objectives', async ({ page }) => {
		// Navigate directly to optimize route
		await page.goto('http://localhost:6036/optimize');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.getByText('Optimization Objective')).toBeVisible();

		// Click objectives - they should all be visible
		await expect(page.getByRole('button', { name: 'Sharpe Ratio', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sortino Ratio', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Total Return', exact: true })).toBeVisible();
	});

	test.skip('should show total combinations for grid search', async ({ page }) => {
		// Navigate directly to optimize route
		await page.goto('http://localhost:6036/optimize');
		await page.waitForLoadState('domcontentloaded');

		// Wait for page to load
		await expect(page.getByText('Optimization Method')).toBeVisible({ timeout: 10000 });

		// Select a strategy with numeric parameters
		await page.getByRole('button', { name: /MA Crossover/ }).click();

		// Wait for combinations to calculate and parameters to load
		await page.waitForTimeout(2000);

		// Verify total combinations message exists with longer timeout
		await expect(page.getByText(/Testing.*combinations/)).toBeVisible({ timeout: 10000 });
	});

	test('should disable run button when strategy not selected', async ({ page }) => {
		// Navigate directly to optimize route without selecting strategy
		await page.goto('http://localhost:6036/optimize');
		await page.waitForLoadState('domcontentloaded');

		// Wait for panel
		await expect(page.getByText('Optimization Method')).toBeVisible();

		// Verify run button is disabled
		const runButton = page.getByRole('button', { name: /Run Optimization/ });
		await expect(runButton).toBeDisabled({ timeout: 5000 });
	});
});
