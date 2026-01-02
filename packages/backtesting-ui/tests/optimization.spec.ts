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

	test('should show parameter ranges for selected strategy', async ({ page }) => {
		// Select a strategy first
		const strategyBtn = page.getByRole('button', { name: /MA Crossover/ });
		await strategyBtn.click();

		// Navigate directly to optimize route
		await page.goto('http://localhost:6036/optimize');
		await page.waitForLoadState('domcontentloaded');

		// Verify parameter ranges component is visible
		await expect(page.getByText('Parameter Ranges')).toBeVisible({ timeout: 10000 });
	});

	test('should allow selecting different optimization methods', async ({ page }) => {
		// Navigate directly to optimize route
		await page.goto('http://localhost:6036/optimize');
		await page.waitForLoadState('domcontentloaded');

		// Wait for panel to load
		await expect(page.getByText('Optimization Method')).toBeVisible();

		// Select Random Search
		const randomBtn = page.getByRole('button', { name: /Random Search/ });
		await randomBtn.click();

		// Verify iterations input appears
		await expect(page.getByText('Number of Iterations')).toBeVisible();
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

	test('should show total combinations for grid search', async ({ page }) => {
		// Select a strategy with numeric parameters
		await page.getByRole('button', { name: /MA Crossover/ }).click();

		// Navigate directly to optimize route
		await page.goto('http://localhost:6036/optimize');
		await page.waitForLoadState('domcontentloaded');

		// Grid Search should be selected by default
		await expect(page.getByText('Optimization Method')).toBeVisible();

		// Wait for combinations to calculate
		await page.waitForTimeout(1000);

		// Verify total combinations message exists
		await expect(page.getByText(/Testing.*combinations/)).toBeVisible({ timeout: 5000 });
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
