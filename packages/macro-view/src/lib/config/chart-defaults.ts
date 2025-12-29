/**
 * Chart.js Default Configuration
 * 
 * Applies design system tokens to Chart.js defaults for consistent chart styling.
 */

import { designSystem } from './design-system';

const { colors } = designSystem;

export const chartDefaults = {
	color: colors.text.secondary,
	borderColor: colors.chart.grid,
	backgroundColor: colors.chart.series,
	
	font: {
		family: designSystem.typography.fontFamily.sans,
		size: 12,
	},

	scales: {
		x: {
			ticks: { color: colors.chart.axis },
			grid: { color: colors.chart.grid },
		},
		y: {
			ticks: { color: colors.chart.axis },
			grid: { color: colors.chart.grid },
		},
	},

	plugins: {
		legend: {
			labels: { color: colors.text.secondary },
		},
		title: {
			color: colors.text.muted,
			font: { size: 16, weight: '600' as const },
		},
		tooltip: {
			backgroundColor: colors.chart.tooltip.bg,
			titleColor: colors.text.primary,
			bodyColor: colors.chart.tooltip.text,
			borderColor: colors.chart.tooltip.border,
			borderWidth: 1,
			cornerRadius: 8,
			padding: 12,
		},
	},
};

export const getSeriesColor = (index: number): string => {
	return colors.chart.series[index % colors.chart.series.length];
};

export const getSeriesColors = (count: number): string[] => {
	return Array.from({ length: count }, (_, i) => getSeriesColor(i));
};

export default chartDefaults;
