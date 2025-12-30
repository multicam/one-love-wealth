import { expect, test } from '@playwright/test';

test.describe('Trading Dashboards', () => {
	test('home page loads', async ({ page }) => {
		await page.goto('/');
		// Wait for page to load and check that content is rendered
		await expect(page.locator('.logo').first()).toBeVisible();
	});

	test('navigation is visible', async ({ page }) => {
		await page.goto('/');
		// Check for navigation elements
		const nav = page.locator('nav, [role="navigation"], aside');
		await expect(nav.first()).toBeVisible();
	});

	test('macro page is accessible', async ({ page }) => {
		await page.goto('/macro');
		await page.waitForLoadState('networkidle');
		// Page should load without errors
		const errorVisible = await page.locator('.error, [class*="error"]').isVisible().catch(() => false);
		expect(errorVisible).toBe(false);
	});
});
