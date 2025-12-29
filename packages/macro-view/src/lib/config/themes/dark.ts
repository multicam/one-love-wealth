/**
 * Dark Theme Configuration
 * 
 * Default theme for MacroView - optimized for financial/crypto aesthetics.
 */

import type { DesignSystemConfig } from '../design-system';

export const darkTheme: Partial<DesignSystemConfig['colors']> = {
	background: {
		primary: '#020617',
		secondary: '#0f172a',
		tertiary: '#1e293b',
		card: 'rgba(15, 23, 42, 0.5)',
		cardHover: 'rgba(30, 41, 59, 0.5)',
	},
	text: {
		primary: '#f8fafc',
		secondary: '#cbd5e1',
		muted: '#64748b',
		inverse: '#0f172a',
	},
	border: {
		default: '#334155',
		subtle: 'rgba(51, 65, 85, 0.5)',
		strong: '#475569',
	},
	chart: {
		series: [
			'#3b82f6',
			'#f59e0b',
			'#22c55e',
			'#ef4444',
			'#8b5cf6',
			'#06b6d4',
			'#ec4899',
			'#84cc16',
			'#f97316',
			'#14b8a6',
		],
		grid: '#1e293b',
		axis: '#64748b',
		tooltip: {
			bg: 'rgba(15, 23, 42, 0.95)',
			text: '#e2e8f0',
			border: '#334155',
		},
	},
};

export default darkTheme;
