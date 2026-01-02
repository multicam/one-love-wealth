/**
 * UI Store
 * Manages UI state (mode, sidebar, dialogs)
 * Uses Svelte 5 runes with proper module state pattern
 */

export type AppMode = 'backtest' | 'optimize' | 'validate';

// Create a state object that can be mutated
class UIState {
	mode = $state<AppMode>('backtest');
	sidebarOpen = $state(true);
	rightPanelOpen = $state(true);
	showSettings = $state(false);
	showHelp = $state(false);
	activeDialog = $state<string | null>(null);
	dialogData = $state<any>(null);

	// Derived properties
	get isBacktestMode() {
		return this.mode === 'backtest';
	}

	get isOptimizeMode() {
		return this.mode === 'optimize';
	}

	get isValidateMode() {
		return this.mode === 'validate';
	}

	// Actions
	setMode(newMode: AppMode): void {
		this.mode = newMode;
	}

	toggleSidebar(): void {
		this.sidebarOpen = !this.sidebarOpen;
	}

	toggleRightPanel(): void {
		this.rightPanelOpen = !this.rightPanelOpen;
	}

	toggleSettings(): void {
		this.showSettings = !this.showSettings;
	}

	toggleHelp(): void {
		this.showHelp = !this.showHelp;
	}

	openDialog(dialogId: string, data?: any): void {
		this.activeDialog = dialogId;
		this.dialogData = data ?? null;
	}

	closeDialog(): void {
		this.activeDialog = null;
		this.dialogData = null;
	}

	closeAllPanels(): void {
		this.showSettings = false;
		this.showHelp = false;
		this.activeDialog = null;
		this.dialogData = null;
	}
}

// Export a single instance
export const ui = new UIState();
