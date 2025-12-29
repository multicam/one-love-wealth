import { writable } from 'svelte/store';

/**
 * @typedef {Object} CrosshairData
 * @property {number} time
 * @property {number} price
 */

/**
 * @typedef {Object} TimeRange
 * @property {number} from
 * @property {number} to
 */

/** @type {import('svelte/store').Writable<string>} */
export const activePanel = writable('charts');

/** @type {import('svelte/store').Writable<CrosshairData | null>} */
export const crosshairPosition = writable(null);

// Shared time range for synchronized chart scrolling/zooming
/** @type {import('svelte/store').Writable<TimeRange | null>} */
export const visibleTimeRange = writable(null);
