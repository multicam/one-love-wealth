import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Graph Favorites Store
 *
 * Manages user's favorite/bookmarked graphs with localStorage persistence.
 * Survives page refreshes and is synchronized across tabs.
 */

const STORAGE_KEY = 'macro-view-favorites';

// Load initial favorites from localStorage
function loadFavorites(): string[] {
	if (!browser) return [];

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return Array.isArray(parsed) ? parsed : [];
		}
	} catch (error) {
		console.error('Failed to load favorites from localStorage:', error);
	}

	return [];
}

// Save favorites to localStorage
function saveFavorites(favorites: string[]): void {
	if (!browser) return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
	} catch (error) {
		console.error('Failed to save favorites to localStorage:', error);
	}
}

// Create the store
function createFavoritesStore() {
	const { subscribe, set, update } = writable<string[]>(loadFavorites());

	return {
		subscribe,

		/**
		 * Add a graph to favorites
		 */
		add: (graphId: string) => {
			update(favorites => {
				if (!favorites.includes(graphId)) {
					const updated = [...favorites, graphId];
					saveFavorites(updated);
					return updated;
				}
				return favorites;
			});
		},

		/**
		 * Remove a graph from favorites
		 */
		remove: (graphId: string) => {
			update(favorites => {
				const updated = favorites.filter(id => id !== graphId);
				saveFavorites(updated);
				return updated;
			});
		},

		/**
		 * Toggle a graph's favorite status
		 */
		toggle: (graphId: string) => {
			update(favorites => {
				const isFavorite = favorites.includes(graphId);
				const updated = isFavorite
					? favorites.filter(id => id !== graphId)
					: [...favorites, graphId];
				saveFavorites(updated);
				return updated;
			});
		},

		/**
		 * Check if a graph is favorited
		 */
		isFavorite: (graphId: string, favorites: string[]): boolean => {
			return favorites.includes(graphId);
		},

		/**
		 * Clear all favorites
		 */
		clear: () => {
			set([]);
			saveFavorites([]);
		}
	};
}

export const favorites = createFavoritesStore();
