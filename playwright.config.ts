import { defineConfig, devices } from '@playwright/test';
import { packages, getDevUrl, getPreviewUrl, getPackagePath } from './workspace.config';

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
			command: `cd ${getPackagePath('crypto-viz')} && bun run dev`,
			url: getDevUrl('crypto-viz'),
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
			stdout: 'pipe',
			stderr: 'pipe'
		},
		{
			command: `cd ${getPackagePath('macro-view')} && bun run build && bun run preview`,
			url: getPreviewUrl('macro-view'),
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
			stdout: 'pipe',
			stderr: 'pipe'
		},
		{
			command: `cd ${getPackagePath('trading-dashboards')} && bun run dev`,
			url: getDevUrl('trading-dashboards'),
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
			stdout: 'pipe',
			stderr: 'pipe'
		}
	],
	projects: [
		{
			name: 'crypto-viz',
			testDir: `./${getPackagePath('crypto-viz')}/${packages['crypto-viz'].testDir}`,
			use: {
				...devices['Desktop Chrome'],
				baseURL: getDevUrl('crypto-viz')
			}
		},
		{
			name: 'macro-view',
			testDir: `./${getPackagePath('macro-view')}/${packages['macro-view'].testDir}`,
			use: {
				...devices['Desktop Chrome'],
				baseURL: getPreviewUrl('macro-view')
			}
		},
		{
			name: 'trading-dashboards',
			testDir: `./${getPackagePath('trading-dashboards')}/${packages['trading-dashboards'].testDir}`,
			use: {
				...devices['Desktop Chrome'],
				baseURL: getDevUrl('trading-dashboards')
			}
		}
	],
	outputDir: 'test-results'
});
