/**
 * MacroView Design System Configuration
 * 
 * Centralized design tokens for consistent styling across the application.
 * This file is the single source of truth for colors, typography, spacing, and component styles.
 */

export interface ColorScale {
	50: string;
	100: string;
	200: string;
	300: string;
	400: string;
	500: string;
	600: string;
	700: string;
	800: string;
	900: string;
	950: string;
}

export interface DesignSystemConfig {
	colors: {
		primary: ColorScale;
		accent: ColorScale;
		semantic: {
			success: string;
			warning: string;
			error: string;
			info: string;
		};
		chart: {
			series: string[];
			grid: string;
			axis: string;
			tooltip: {
				bg: string;
				text: string;
				border: string;
			};
		};
		background: {
			primary: string;
			secondary: string;
			tertiary: string;
			card: string;
			cardHover: string;
		};
		text: {
			primary: string;
			secondary: string;
			muted: string;
			inverse: string;
		};
		border: {
			default: string;
			subtle: string;
			strong: string;
		};
	};
	typography: {
		fontFamily: {
			sans: string;
			mono: string;
		};
		fontSize: Record<string, [string, { lineHeight: string }]>;
		fontWeight: Record<string, string>;
	};
	spacing: Record<string, string>;
	borderRadius: Record<string, string>;
	shadows: Record<string, string>;
	components: {
		card: {
			base: string;
			hover: string;
		};
		button: {
			primary: string;
			secondary: string;
			ghost: string;
		};
		input: {
			base: string;
			focus: string;
		};
		chartContainer: {
			base: string;
		};
		navigation: {
			item: string;
			itemActive: string;
		};
	};
	breakpoints: Record<string, string>;
	transitions: {
		duration: Record<string, string>;
		easing: Record<string, string>;
	};
}

export const designSystem: DesignSystemConfig = {
	colors: {
		primary: {
			50: '#eff6ff',
			100: '#dbeafe',
			200: '#bfdbfe',
			300: '#93c5fd',
			400: '#60a5fa',
			500: '#3b82f6',
			600: '#2563eb',
			700: '#1d4ed8',
			800: '#1e40af',
			900: '#1e3a8a',
			950: '#172554',
		},
		accent: {
			50: '#eef2ff',
			100: '#e0e7ff',
			200: '#c7d2fe',
			300: '#a5b4fc',
			400: '#818cf8',
			500: '#6366f1',
			600: '#4f46e5',
			700: '#4338ca',
			800: '#3730a3',
			900: '#312e81',
			950: '#1e1b4b',
		},
		semantic: {
			success: '#22c55e',
			warning: '#f59e0b',
			error: '#ef4444',
			info: '#3b82f6',
		},
		chart: {
			series: [
				'#3b82f6', // Blue - primary
				'#f59e0b', // Amber - secondary
				'#22c55e', // Green - tertiary
				'#ef4444', // Red
				'#8b5cf6', // Violet
				'#06b6d4', // Cyan
				'#ec4899', // Pink
				'#84cc16', // Lime
				'#f97316', // Orange
				'#14b8a6', // Teal
			],
			grid: '#1e293b',
			axis: '#64748b',
			tooltip: {
				bg: 'rgba(15, 23, 42, 0.95)',
				text: '#e2e8f0',
				border: '#334155',
			},
		},
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
	},
	typography: {
		fontFamily: {
			sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
			mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
		},
		fontSize: {
			xs: ['0.75rem', { lineHeight: '1rem' }],
			sm: ['0.875rem', { lineHeight: '1.25rem' }],
			base: ['1rem', { lineHeight: '1.5rem' }],
			lg: ['1.125rem', { lineHeight: '1.75rem' }],
			xl: ['1.25rem', { lineHeight: '1.75rem' }],
			'2xl': ['1.5rem', { lineHeight: '2rem' }],
			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
			'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
		},
		fontWeight: {
			normal: '400',
			medium: '500',
			semibold: '600',
			bold: '700',
			black: '900',
		},
	},
	spacing: {
		px: '1px',
		0: '0',
		0.5: '0.125rem',
		1: '0.25rem',
		1.5: '0.375rem',
		2: '0.5rem',
		2.5: '0.625rem',
		3: '0.75rem',
		3.5: '0.875rem',
		4: '1rem',
		5: '1.25rem',
		6: '1.5rem',
		7: '1.75rem',
		8: '2rem',
		9: '2.25rem',
		10: '2.5rem',
		11: '2.75rem',
		12: '3rem',
		14: '3.5rem',
		16: '4rem',
		20: '5rem',
		24: '6rem',
		28: '7rem',
		32: '8rem',
		36: '9rem',
		40: '10rem',
		44: '11rem',
		48: '12rem',
		52: '13rem',
		56: '14rem',
		60: '15rem',
		64: '16rem',
		72: '18rem',
		80: '20rem',
		96: '24rem',
	},
	borderRadius: {
		none: '0',
		sm: '0.125rem',
		DEFAULT: '0.25rem',
		md: '0.375rem',
		lg: '0.5rem',
		xl: '0.75rem',
		'2xl': '1rem',
		'3xl': '1.5rem',
		full: '9999px',
	},
	shadows: {
		sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
		DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
		md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
		lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
		xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
		glow: '0 0 20px rgba(59, 130, 246, 0.3)',
		'glow-accent': '0 0 20px rgba(99, 102, 241, 0.3)',
	},
	components: {
		card: {
			base: 'bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl',
			hover: 'hover:bg-slate-800/50 hover:border-slate-700/50 transition-colors',
		},
		button: {
			primary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors',
			secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium px-4 py-2 rounded-lg transition-colors',
			ghost: 'hover:bg-slate-800 text-slate-400 hover:text-slate-100 px-3 py-2 rounded-lg transition-colors',
		},
		input: {
			base: 'bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500',
			focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
		},
		chartContainer: {
			base: 'bg-slate-900/30 border border-slate-800/30 rounded-xl p-4',
		},
		navigation: {
			item: 'flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-xl transition-colors',
			itemActive: 'flex items-center gap-3 px-4 py-3 text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl',
		},
	},
	breakpoints: {
		sm: '640px',
		md: '768px',
		lg: '1024px',
		xl: '1280px',
		'2xl': '1536px',
	},
	transitions: {
		duration: {
			fast: '150ms',
			DEFAULT: '200ms',
			slow: '300ms',
			slower: '500ms',
		},
		easing: {
			DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
			in: 'cubic-bezier(0.4, 0, 1, 1)',
			out: 'cubic-bezier(0, 0, 0.2, 1)',
			'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
		},
	},
};

export default designSystem;
