import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: '.',
	timeout: 30000,
	expect: {
		timeout: 5000
	},
	fullyParallel: false, // Run projects sequentially to avoid port conflicts
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1, // Single worker to avoid conflicts with shared servers
	reporter: 'html',
	use: {
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	},
	// WebServers must be defined at root level, not per-project
	webServer: [
		{
			command: 'cd packages/crypto-viz && bun run dev',
			url: 'http://localhost:6006',
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
			stdout: 'pipe',
			stderr: 'pipe'
		},
		{
			command: 'cd packages/macro-view && bun run build && bun run preview',
			url: 'http://localhost:4173',
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
			stdout: 'pipe',
			stderr: 'pipe'
		},
		{
			command: 'cd packages/trading-dashboards && bun run dev',
			url: 'http://localhost:6009',
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
			stdout: 'pipe',
			stderr: 'pipe'
		}
	],
	projects: [
		{
			name: 'crypto-viz',
			testDir: './packages/crypto-viz/e2e',
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:6006'
			}
		},
		{
			name: 'macro-view',
			testDir: './packages/macro-view/e2e',
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:4173'
			}
		},
		{
			name: 'trading-dashboards',
			testDir: './packages/trading-dashboards/e2e',
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:6009'
			}
		}
	],
	outputDir: 'test-results'
});
