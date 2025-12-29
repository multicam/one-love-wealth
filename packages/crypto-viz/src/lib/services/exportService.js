import { get } from 'svelte/store';
import { settings } from '$lib/stores/settings.js';
import { selectedCrypto } from '$lib/stores/crypto.js';
import { strategyEvents } from '$lib/stores/events.js';

const STATE_VERSION = 1;

/**
 * @typedef {Object} ExportedState
 * @property {number} version
 * @property {string} exportedAt
 * @property {string} selectedCrypto
 * @property {import('$lib/stores/settings.js').Settings} settings
 * @property {import('$lib/stores/events.js').StrategyEvent[]} events
 */

/**
 * Export current application state to JSON
 * @returns {ExportedState}
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
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string} [error]
 */

/**
 * Validate imported state
 * @param {unknown} state - State to validate
 * @returns {ValidationResult}
 */
export function validateState(state) {
    if (!state || typeof state !== 'object') {
        return { valid: false, error: 'Invalid state format' };
    }
    
    const stateObj = /** @type {Record<string, unknown>} */ (state);
    
    if (!stateObj.version || (typeof stateObj.version === 'number' && stateObj.version > STATE_VERSION)) {
        return { valid: false, error: 'Unsupported state version' };
    }
    
    if (!stateObj.settings || typeof stateObj.settings !== 'object') {
        return { valid: false, error: 'Missing or invalid settings' };
    }
    
    return { valid: true };
}

/**
 * @typedef {Object} ImportResult
 * @property {boolean} success
 * @property {string} [error]
 */

/**
 * Import state from JSON object
 * @param {unknown} state - State to import
 * @returns {ImportResult}
 */
export function importState(state) {
    const validation = validateState(state);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }
    
    try {
        const stateObj = /** @type {ExportedState} */ (state);
        
        if (stateObj.selectedCrypto) {
            selectedCrypto.set(stateObj.selectedCrypto);
        }
        
        if (stateObj.settings) {
            settings.set(stateObj.settings);
        }
        
        if (stateObj.events) {
            strategyEvents.set(stateObj.events);
        }
        
        return { success: true };
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, error: message };
    }
}

/**
 * Import state from file
 * @param {File} file - JSON file to import
 * @returns {Promise<ImportResult>}
 */
export async function importFromFile(file) {
    try {
        const text = await file.text();
        const state = JSON.parse(text);
        return importState(state);
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, error: 'Failed to parse file: ' + message };
    }
}
