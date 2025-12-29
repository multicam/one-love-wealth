import { writable } from 'svelte/store';

export interface Settings {
	// Add future settings here
}

function createSettingsStore() {
	const initialSettings: Settings = {};

	const { subscribe, set, update } = writable<Settings>(initialSettings);

	return {
		subscribe,
		set,
		update,
		load: () => {
			if (typeof localStorage !== 'undefined') {
				const stored = localStorage.getItem('macroview-settings');
				if (stored) {
					set(JSON.parse(stored));
				}
			}
		},
		save: (settings: Settings) => {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('macroview-settings', JSON.stringify(settings));
				set(settings);
			}
		}
	};
}

export const settings = createSettingsStore();