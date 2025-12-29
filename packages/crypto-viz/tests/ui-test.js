import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, 'screenshots');

async function testUI() {
    console.log('🎭 Starting Playwright UI test...');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    
    // Collect ALL console messages for debugging
    /** @type {string[]} */
    const logs = [];
    /** @type {string[]} */
    const errors = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(`[${msg.type()}] ${text}`);
        if (msg.type() === 'error') {
            errors.push(text);
        }
    });
    page.on('pageerror', err => errors.push(err.message));
    
    // Monitor network requests
    page.on('requestfailed', request => {
        console.log(`❌ Request failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    page.on('request', request => {
        if (request.url().includes('coingecko')) {
            console.log(`🌐 API Request: ${request.url()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('coingecko')) {
            console.log(`📥 API Response: ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        // Navigate to app
        const port = process.env.PORT || '5173';
        console.log(`📍 Navigating to http://localhost:${port}...`);
        await page.goto(`http://localhost:${port}`, { waitUntil: 'domcontentloaded' });
        
        // Wait for hydration and data load
        console.log('⏳ Waiting for data to load...');
        await page.waitForTimeout(5000);
        
        // Try to wait for canvas or data
        try {
            await page.waitForSelector('canvas', { timeout: 5000 });
            console.log('✅ Canvas found');
        } catch {
            console.log('⚠️ No canvas found after 5s');
        }
        
        // Take initial screenshot
        const screenshot1 = join(screenshotDir, 'initial-state.png');
        await page.screenshot({ path: screenshot1, fullPage: true });
        console.log(`📸 Screenshot saved: ${screenshot1}`);
        
        // Check for visible elements
        const hasChartContainer = await page.locator('.bg-surface').first().isVisible();
        const hasNavButtons = await page.locator('button').first().isVisible();
        const hasSettingsPanel = await page.locator('text=Settings').isVisible();
        
        console.log('\n📊 UI Element Check:');
        console.log(`  - Chart container visible: ${hasChartContainer}`);
        console.log(`  - Nav buttons visible: ${hasNavButtons}`);
        console.log(`  - Settings panel visible: ${hasSettingsPanel}`);
        
        // Check if charts have content (canvas with data)
        const chartCanvases = await page.locator('canvas').count();
        console.log(`  - Chart canvases found: ${chartCanvases}`);
        
        // Check for "No data" or error messages
        const noDataVisible = await page.locator('text=No data').isVisible().catch(() => false);
        const errorVisible = await page.locator('.text-danger').isVisible().catch(() => false);
        
        console.log(`  - "No data" message: ${noDataVisible}`);
        console.log(`  - Error message visible: ${errorVisible}`);
        
        // Report console logs
        console.log('\n📝 Console Logs:');
        logs.slice(-20).forEach(l => console.log(`  ${l}`));
        
        // Report console errors
        if (errors.length > 0) {
            console.log('\n❌ Console Errors:');
            errors.forEach(e => console.log(`  - ${e}`));
        } else {
            console.log('\n✅ No console errors');
        }
        
        // Click on ETH to test interaction
        console.log('\n🖱️ Testing crypto selector...');
        const ethButton = page.locator('button:has-text("ETH")');
        if (await ethButton.isVisible()) {
            await ethButton.click();
            await page.waitForTimeout(3000);
            
            const screenshot2 = join(screenshotDir, 'after-eth-click.png');
            await page.screenshot({ path: screenshot2, fullPage: true });
            console.log(`📸 Screenshot saved: ${screenshot2}`);
        }
        
        // Final assessment
        console.log('\n📋 Test Summary:');
        if (chartCanvases > 0 && !noDataVisible && errors.length === 0) {
            console.log('✅ UI Test PASSED - Charts rendering, no errors');
        } else if (chartCanvases === 0) {
            console.log('❌ UI Test FAILED - No chart canvases found');
        } else if (noDataVisible) {
            console.log('⚠️ UI Test WARNING - "No data" message visible');
        } else if (errors.length > 0) {
            console.log('❌ UI Test FAILED - Console errors detected');
        }
        
    } catch (err) {
        console.error('❌ Test error:', err instanceof Error ? err.message : String(err));
        const errorScreenshot = join(screenshotDir, 'error-state.png');
        await page.screenshot({ path: errorScreenshot }).catch(() => {});
    } finally {
        await browser.close();
    }
}

// Ensure screenshot directory exists
import { mkdirSync } from 'fs';
try { mkdirSync(screenshotDir, { recursive: true }); } catch {}

testUI();
