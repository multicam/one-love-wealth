import { expect, test } from '@playwright/test';

test.describe('Crypto Viz Charts', () => {
	test('renders chart canvases', async ({ page }) => {
		await page.goto('/');
		
		// Wait for data to load
		await page.waitForTimeout(5000);
		
		// Check for canvas elements (charts)
		const canvases = await page.locator('canvas').count();
		expect(canvases).toBeGreaterThan(0);
	});

	test('displays chart container', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('.bg-surface').first()).toBeVisible();
	});

	test('shows navigation buttons', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('button').first()).toBeVisible();
	});

	test('crypto selector works', async ({ page }) => {
		await page.goto('/');
		await page.waitForTimeout(3000);
		
		// Find and click ETH button
		const ethButton = page.locator('button:has-text("ETH")');
		if (await ethButton.isVisible()) {
			await ethButton.click();
			await page.waitForTimeout(3000);
			
			// Verify charts still render after switching
			const canvases = await page.locator('canvas').count();
			expect(canvases).toBeGreaterThan(0);
		}
	});

	test('no error messages displayed', async ({ page }) => {
		await page.goto('/');
		await page.waitForTimeout(5000);
		
		// Check no error state is visible
		const errorVisible = await page.locator('.text-danger').isVisible().catch(() => false);
		expect(errorVisible).toBe(false);
	});
});
