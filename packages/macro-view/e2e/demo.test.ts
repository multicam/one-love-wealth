import { expect, test } from '@playwright/test';

test('home page has Macro Dashboard title', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Macro Dashboard', exact: true })).toBeVisible();
});

test('sidebar navigation works', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('aside')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'MacroView' })).toBeVisible();
	await expect(page.getByText('Data Explorer')).toBeVisible();
});

test('settings page does not show API key input', async ({ page }) => {
	await page.goto('/settings');
	await expect(page.getByRole('heading', { name: 'Application Settings' })).toBeVisible();
	await expect(page.getByLabel('FRED API Key')).not.toBeVisible();
	await expect(page.getByText('Global configuration is managed via environment variables')).toBeVisible();
});