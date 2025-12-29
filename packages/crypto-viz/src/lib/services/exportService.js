import { get } from 'svelte/store';
import { settings } from '$lib/stores/settings.js';
import { selectedCrypto } from '$lib/stores/crypto.js';
import { strategyEvents } from '$lib/stores/events.js';

const STATE_VERSION = 1;

/**
 * Export current application state to JSON
 * @returns {Object} Exportable state object
 */
export function exportState() {
    return {
        version: STATE_VERSION,
        exportedAt: new Date().toISOString(),
        selectedCrypto: get(selectedCrypto),
        settings: get(settings),
        events: get(strategyEvents)
    };
}

/**
 * Download state as JSON file
 */
export function downloadState() {
    const state = exportState();
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-viz-state-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Validate imported state
 * @param {Object} state - State to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateState(state) {
    if (!state || typeof state !== 'object') {
        return { valid: false, error: 'Invalid state format' };
    }
    
    if (!state.version || state.version > STATE_VERSION) {
        return { valid: false, error: 'Unsupported state version' };
    }
    
    if (!state.settings || typeof state.settings !== 'object') {
        return { valid: false, error: 'Missing or invalid settings' };
    }
    
    return { valid: true };
}

/**
 * Import state from JSON object
 * @param {Object} state - State to import
 * @returns {{success: boolean, error?: string}}
 */
export function importState(state) {
    const validation = validateState(state);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }
    
    try {
        if (state.selectedCrypto) {
            selectedCrypto.set(state.selectedCrypto);
        }
        
        if (state.settings) {
            settings.set(state.settings);
        }
        
        if (state.events) {
            strategyEvents.set(state.events);
        }
        
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Import state from file
 * @param {File} file - JSON file to import
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function importFromFile(file) {
    try {
        const text = await file.text();
        const state = JSON.parse(text);
        return importState(state);
    } catch (e) {
        return { success: false, error: 'Failed to parse file: ' + e.message };
    }
}
