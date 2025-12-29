/**
 * Light Theme Configuration
 * 
 * Alternative light theme for MacroView.
 */

import type { DesignSystemConfig } from '../design-system';

export const lightTheme: Partial<DesignSystemConfig['colors']> = {
	background: {
		primary: '#ffffff',
		secondary: '#f8fafc',
		tertiary: '#f1f5f9',
		card: 'rgba(255, 255, 255, 0.8)',
		cardHover: 'rgba(241, 245, 249, 0.8)',
	},
	text: {
		primary: '#0f172a',
		secondary: '#334155',
		muted: '#64748b',
		inverse: '#f8fafc',
	},
	border: {
		default: '#e2e8f0',
		subtle: 'rgba(226, 232, 240, 0.5)',
		strong: '#cbd5e1',
	},
	chart: {
		series: [
			'#2563eb',
			'#d97706',
			'#16a34a',
			'#dc2626',
			'#7c3aed',
			'#0891b2',
			'#db2777',
			'#65a30d',
			'#ea580c',
			'#0d9488',
		],
		grid: '#e2e8f0',
		axis: '#64748b',
		tooltip: {
			bg: 'rgba(255, 255, 255, 0.95)',
			text: '#334155',
			border: '#e2e8f0',
		},
	},
};

export default lightTheme;
