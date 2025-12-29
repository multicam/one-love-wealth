import { writable } from 'svelte/store';

export const activePanel = writable('charts');
export const crosshairPosition = writable(null);

// Shared time range for synchronized chart scrolling/zooming
// { from: timestamp, to: timestamp }
export const visibleTimeRange = writable(null);
