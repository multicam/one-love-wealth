#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const cmd = args[0];
const url = args[1] || 'http://localhost:5173';
const outputDir = args[2] || './screenshots';

fs.mkdirSync(outputDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
  
  // Capture network requests
  const networkLogs = [];
  page.on('response', res => networkLogs.push({
    url: res.url(),
    status: res.status(),
    ok: res.ok()
  }));

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    switch (cmd) {
      case 'screenshot': {
        const name = args[3] || 'screenshot';
        const filepath = path.join(outputDir, `${name}.png`);
        await page.screenshot({ path: filepath, fullPage: true });
        console.log(JSON.stringify({ success: true, file: filepath }));
        break;
      }
        
      case 'console':
        console.log(JSON.stringify({ console: consoleLogs }, null, 2));
        break;
        
      case 'network':
        console.log(JSON.stringify({ network: networkLogs }, null, 2));
        break;
        
      case 'click': {
        const selector = args[3];
        await page.click(selector);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(outputDir, 'after-click.png') });
        console.log(JSON.stringify({ success: true, clicked: selector }));
        break;
      }
        
      case 'perf': {
        const timing = await page.evaluate(() => JSON.stringify(performance.timing));
        const entries = await page.evaluate(() => JSON.stringify(performance.getEntriesByType('navigation')[0]));
        console.log(JSON.stringify({ timing: JSON.parse(timing), navigation: JSON.parse(entries) }, null, 2));
        break;
      }
        
      case 'full': {
        // Full diagnostic: screenshot + console + network
        const diagName = args[3] || 'diagnostic';
        const screenshotPath = path.join(outputDir, `${diagName}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(JSON.stringify({
          screenshot: screenshotPath,
          console: consoleLogs,
          network: networkLogs.filter(n => !n.ok),
          errors: consoleLogs.filter(c => c.type === 'error')
        }, null, 2));
        break;
      }
        
      default:
        console.log('Usage: node pw-test.js <command> [url] [outputDir] [extra]');
        console.log('Commands: screenshot, console, network, click, perf, full');
    }
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
  } finally {
    await browser.close();
  }
}

run();
