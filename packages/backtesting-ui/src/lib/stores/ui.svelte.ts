/**
 * UI Store
 * Manages UI state (mode, sidebar, dialogs)
 * Uses traditional writable store pattern for reliable reactivity
 */

import { writable, derived } from 'svelte/store';

export type AppMode = 'backtest' | 'optimize' | 'walk-forward';

interface UIState {
	mode: AppMode;
	sidebarOpen: boolean;
	rightPanelOpen: boolean;
	showSettings: boolean;
	showHelp: boolean;
	activeDialog: string | null;
	dialogData: any;
}

// Create writable store with initial state
const initialState: UIState = {
	mode: 'backtest',
	sidebarOpen: true,
	rightPanelOpen: true,
	showSettings: false,
	showHelp: false,
	activeDialog: null,
	dialogData: null,
};

function createUIStore() {
	const { subscribe, set, update } = writable<UIState>(initialState);

	return {
		subscribe,
		setMode: (newMode: AppMode) => {
			console.log('[ui.store] Setting mode to:', newMode);
			update((state) => ({ ...state, mode: newMode }));
		},
		toggleSidebar: () => {
			update((state) => ({ ...state, sidebarOpen: !state.sidebarOpen }));
		},
		toggleRightPanel: () => {
			update((state) => ({ ...state, rightPanelOpen: !state.rightPanelOpen }));
		},
		toggleSettings: () => {
			update((state) => ({ ...state, showSettings: !state.showSettings }));
		},
		toggleHelp: () => {
			update((state) => ({ ...state, showHelp: !state.showHelp }));
		},
		openDialog: (dialogId: string, data?: any) => {
			update((state) => ({
				...state,
				activeDialog: dialogId,
				dialogData: data ?? null,
			}));
		},
		closeDialog: () => {
			update((state) => ({
				...state,
				activeDialog: null,
				dialogData: null,
			}));
		},
		closeAllPanels: () => {
			update((state) => ({
				...state,
				showSettings: false,
				showHelp: false,
				activeDialog: null,
				dialogData: null,
			}));
		},
	};
}

export const ui = createUIStore();

// Derived stores
export const mode = derived(ui, ($ui) => $ui.mode);
export const isBacktestMode = derived(ui, ($ui) => $ui.mode === 'backtest');
export const isOptimizeMode = derived(ui, ($ui) => $ui.mode === 'optimize');
export const isWalkForwardMode = derived(ui, ($ui) => $ui.mode === 'walk-forward');
