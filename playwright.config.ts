import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: '.',
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
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	},
	projects: [
		{
			name: 'crypto-viz',
			testDir: './packages/crypto-viz/e2e',
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:6006'
			},
			webServer: {
				command: 'bun run --cwd packages/crypto-viz dev',
				url: 'http://localhost:6006',
				reuseExistingServer: !process.env.CI,
				timeout: 120000
			}
		},
		{
			name: 'macro-view',
			testDir: './packages/macro-view/e2e',
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:4173'
			},
			webServer: {
				command: 'bun run --cwd packages/macro-view build && bun run --cwd packages/macro-view preview',
				url: 'http://localhost:4173',
				reuseExistingServer: !process.env.CI,
				timeout: 120000
			}
		},
		{
			name: 'trading-dashboards',
			testDir: './packages/trading-dashboards/e2e',
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:6009'
			},
			webServer: {
				command: 'bun run --cwd packages/trading-dashboards dev',
				url: 'http://localhost:6009',
				reuseExistingServer: !process.env.CI,
				timeout: 120000
			}
		}
	],
	outputDir: 'test-results'
});
