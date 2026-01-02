/**
 * UI Store
 * Manages UI state (mode, sidebar, dialogs)
 */

export type AppMode = 'backtest' | 'optimize' | 'validate';

// State
export let mode = $state<AppMode>('backtest');
export let sidebarOpen = $state(true);
export let rightPanelOpen = $state(true);
export let showSettings = $state(false);
export let showHelp = $state(false);

// Dialog state
export let activeDialog = $state<string | null>(null);
export let dialogData = $state<any>(null);

// Derived
export const isBacktestMode = $derived(mode === 'backtest');
export const isOptimizeMode = $derived(mode === 'optimize');
export const isValidateMode = $derived(mode === 'validate');

// Actions
export function setMode(newMode: AppMode): void {
	mode = newMode;
}

export function toggleSidebar(): void {
	sidebarOpen = !sidebarOpen;
}

export function toggleRightPanel(): void {
	rightPanelOpen = !rightPanelOpen;
}

export function toggleSettings(): void {
	showSettings = !showSettings;
}

export function toggleHelp(): void {
	showHelp = !showHelp;
}

export function openDialog(dialogId: string, data?: any): void {
	activeDialog = dialogId;
	dialogData = data ?? null;
}

export function closeDialog(): void {
	activeDialog = null;
	dialogData = null;
}

export function closeAllPanels(): void {
	showSettings = false;
	showHelp = false;
	activeDialog = null;
	dialogData = null;
}
