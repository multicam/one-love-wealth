import { test } from '@playwright/test';

test('debug store update', async ({ page }) => {
  // Listen to console
  page.on('console', msg => {
    console.log('BROWSER:', msg.text());
  });

  // Navigate to test page
  await page.goto('http://localhost:6037/test');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('h2:has-text("Test Debug Panel")', { timeout: 10000 });

  console.log('=== Loaded ===');
  await page.waitForTimeout(1000);

  // Click Walk-Forward button
  console.log('=== Clicking Walk-Forward button ===');
  const walkForwardBtn = page.getByRole('button', { name: 'Walk-Forward', exact: true });
  await walkForwardBtn.click();

  // Wait to see console logs
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: '/tmp/debug-store.png' });

  console.log('=== Screenshot taken ===');
});
