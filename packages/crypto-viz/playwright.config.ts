import { defineConfig, devices } from '@playwright/test';
import { packages, getDevUrl } from '../../workspace.config';

const pkg = packages['crypto-viz'];

export default defineConfig({
	testDir: `./${pkg.testDir}`,
	timeout: 30000,
	expect: {
		timeout: 5000
	},
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: getDevUrl('crypto-viz'),
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	},
	webServer: {
		command: `bun run dev`,
		url: getDevUrl('crypto-viz'),
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		stdout: 'pipe',
		stderr: 'pipe'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	outputDir: 'test-results'
});
