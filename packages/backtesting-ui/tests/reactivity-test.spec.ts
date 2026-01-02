import { test, expect } from '@playwright/test';

test.skip('test reactivity without snippets', async ({ page }) => {
  // Listen to console logs
  page.on('console', msg => {
    console.log('BROWSER:', msg.text());
  });

  // Navigate to test page
  await page.goto('http://localhost:6037/test');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('h2:has-text("Test Debug Panel")', { timeout: 10000 });

  console.log('=== BEFORE CLICK ===');

  // Check initial state
  const modeBefore = await page.textContent('.text-2xl.font-bold.text-primary');
  console.log('Mode before:', modeBefore);

  // Should show red border (backtest mode)
  const redBorderBefore = await page.locator('.border-red-500').count();
  console.log('Red borders before:', redBorderBefore);

  // Click Walk-Forward button
  const walkForwardBtn = page.getByRole('button', { name: 'Walk-Forward', exact: true });
  await walkForwardBtn.click();

  // Wait for mode to change (wait for green border to appear)
  await page.waitForSelector('.border-green-500', { timeout: 5000 });

  console.log('=== AFTER CLICK ===');

  // Check if mode changed in debug panel
  const modeAfter = await page.textContent('.text-2xl.font-bold.text-primary');
  console.log('Mode after:', modeAfter);

  // Check if green border appeared
  const greenBorderCount = await page.locator('.border-green-500').count();
  console.log('Green borders after:', greenBorderCount);

  // Check if success text appeared
  const hasSuccessText = await page.getByText('✅ WALK-FORWARD MODE ACTIVE!').isVisible().catch(() => false);
  console.log('Has success text:', hasSuccessText);

  // Take screenshot
  await page.screenshot({ path: '/tmp/test-reactivity.png' });

  // Assert
  expect(modeAfter).toBe('walk-forward');
  await expect(page.getByText('✅ WALK-FORWARD MODE ACTIVE!')).toBeVisible();
});
