/**
 * Workspace Configuration
 * Centralized configuration for dev server ports and package settings.
 * This file is imported by package scripts and Playwright configs.
 */

export interface PackageConfig {
	name: string;
	devPort: number;
	previewPort: number;
	testDir: string;
}

export const packages = {
	'backtesting-ui': {
		name: 'backtesting-ui',
		devPort: 6036,
		previewPort: 6136,
		testDir: 'e2e'
	},
	'crypto-viz': {
		name: 'crypto-viz',
		devPort: 6006,
		previewPort: 6106,
		testDir: 'e2e'
	},
	'macro-view': {
		name: 'macro-view',
		devPort: 6003,
		previewPort: 6103,
		testDir: 'e2e'
	},
	'trading-dashboards': {
		name: 'trading-dashboards',
		devPort: 6009,
		previewPort: 6109,
		testDir: 'e2e'
	}
} as const satisfies Record<string, PackageConfig>;

export type PackageName = keyof typeof packages;

/**
 * Get the dev server URL for a package
 */
export function getDevUrl(pkg: PackageName): string {
	return `http://localhost:${packages[pkg].devPort}`;
}

/**
 * Get the preview server URL for a package
 */
export function getPreviewUrl(pkg: PackageName): string {
	return `http://localhost:${packages[pkg].previewPort}`;
}

/**
 * Get the package directory path
 */
export function getPackagePath(pkg: PackageName): string {
	return `packages/${pkg}`;
}
