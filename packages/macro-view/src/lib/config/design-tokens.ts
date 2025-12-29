/**
 * Design Tokens - Runtime Exports
 * 
 * Convenience exports for using design tokens in components.
 * Import specific tokens as needed to keep bundle size minimal.
 */

import { designSystem } from './design-system';

export const colors = designSystem.colors;
export const typography = designSystem.typography;
export const spacing = designSystem.spacing;
export const borderRadius = designSystem.borderRadius;
export const shadows = designSystem.shadows;
export const components = designSystem.components;
export const breakpoints = designSystem.breakpoints;
export const transitions = designSystem.transitions;

export const chartColors = designSystem.colors.chart;
export const semanticColors = designSystem.colors.semantic;

export { designSystem };
