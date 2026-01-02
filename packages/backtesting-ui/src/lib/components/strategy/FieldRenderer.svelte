<script lang="ts">
	import { HelpCircle } from 'lucide-svelte';
	import type { StrategyField } from '$lib/strategies/types';

	interface Props {
		field: StrategyField;
		value: any;
		onUpdate: (value: any) => void;
		disabled?: boolean;
	}

	let { field, value, onUpdate, disabled = false }: Props = $props();

	// Format percent value for display (0-1 → 0-100)
	function formatPercent(val: number): string {
		return `${Math.round(val * 100)}%`;
	}

	// Parse percent input (0-100 → 0-1)
	function parsePercent(val: string): number {
		const num = parseFloat(val);
		return isNaN(num) ? 0 : Math.max(0, Math.min(100, num)) / 100;
	}
</script>

<div class="field-renderer">
	<!-- Label & Help -->
	<div class="flex items-center justify-between mb-2">
		<label for={field.key} class="text-sm font-medium text-text-primary">
			{field.label}
		</label>
		{#if field.help}
			<div class="group relative">
				<button
					type="button"
					class="text-text-secondary hover:text-text-primary transition-colors"
					title={field.help}
				>
					<HelpCircle size={14} />
				</button>
				<!-- Tooltip -->
				<div
					class="absolute right-0 bottom-full mb-2 w-64 p-2 bg-surface border border-border rounded-lg text-xs text-text-secondary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10 shadow-lg"
				>
					{field.help}
				</div>
			</div>
		{/if}
	</div>

	<!-- Field Input -->
	{#if field.type === 'symbol'}
		<!-- Symbol Input -->
		<input
			id={field.key}
			type="text"
			value={value || ''}
			oninput={(e) => onUpdate(e.currentTarget.value.toUpperCase())}
			placeholder="Enter symbol (e.g., SPY)"
			{disabled}
			class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
		/>
	{:else if field.type === 'slider'}
		<!-- Slider Input -->
		<div class="space-y-2">
			<input
				id={field.key}
				type="range"
				min={field.min}
				max={field.max}
				step={field.step}
				value={value ?? field.default}
				oninput={(e) => onUpdate(parseFloat(e.currentTarget.value))}
				{disabled}
				class="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
			/>
			<div class="flex justify-between text-xs text-text-secondary">
				<span>{field.min}</span>
				<span class="font-medium text-text-primary">{value ?? field.default}</span>
				<span>{field.max}</span>
			</div>
		</div>
	{:else if field.type === 'percent'}
		<!-- Percent Input (0-1 stored as decimal, displayed as 0-100%) -->
		<div class="space-y-2">
			<input
				id={field.key}
				type="range"
				min={field.min !== undefined ? field.min * 100 : 0}
				max={field.max !== undefined ? field.max * 100 : 100}
				step={(field.step ?? 0.01) * 100}
				value={(value ?? field.default ?? 0) * 100}
				oninput={(e) => onUpdate(parseFloat(e.currentTarget.value) / 100)}
				{disabled}
				class="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
			/>
			<div class="flex justify-between text-xs text-text-secondary">
				<span>{field.min !== undefined ? formatPercent(field.min) : '0%'}</span>
				<span class="font-medium text-text-primary">
					{formatPercent(value ?? field.default ?? 0)}
				</span>
				<span>{field.max !== undefined ? formatPercent(field.max) : '100%'}</span>
			</div>
		</div>
	{:else if field.type === 'radio'}
		<!-- Radio Button Group -->
		<div class="flex gap-2 flex-wrap">
			{#each field.options as option}
				<button
					type="button"
					onclick={() => onUpdate(option.value)}
					{disabled}
					class="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed {value ===
					option.value
						? 'bg-primary text-white'
						: 'bg-background text-text-secondary hover:text-text-primary hover:bg-surface'}"
				>
					{option.label}
				</button>
			{/each}
		</div>
	{:else if field.type === 'toggle'}
		<!-- Toggle Switch -->
		<button
			type="button"
			role="switch"
			aria-checked={value ?? field.default ?? false}
			aria-label="Toggle {field.label}"
			onclick={() => onUpdate(!(value ?? field.default ?? false))}
			{disabled}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed {value ??
			field.default ??
			false
				? 'bg-primary'
				: 'bg-background border border-border'}"
		>
			<span
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {value ??
				field.default ??
				false
					? 'translate-x-6'
					: 'translate-x-1'}"
			></span>
		</button>
		<span class="ml-3 text-sm text-text-secondary">
			{value ?? field.default ?? false ? 'Enabled' : 'Disabled'}
		</span>
	{:else if field.type === 'number'}
		<!-- Number Input -->
		<input
			id={field.key}
			type="number"
			min={field.min}
			max={field.max}
			step={field.step}
			value={value ?? field.default}
			oninput={(e) => onUpdate(parseFloat(e.currentTarget.value))}
			{disabled}
			class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
		/>
	{:else if field.type === 'select'}
		<!-- Select Dropdown -->
		<select
			id={field.key}
			value={value ?? field.default}
			onchange={(e) => onUpdate(e.currentTarget.value)}
			{disabled}
			class="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#each field.options as option}
				<option value={option.value}>
					{option.label}
					{#if option.description}
						- {option.description}
					{/if}
				</option>
			{/each}
		</select>
	{/if}
</div>

<style>
	/* Custom slider track styling for better cross-browser support */
	input[type='range']::-webkit-slider-track {
		background: rgb(var(--color-background) / 1);
		border-radius: 0.5rem;
	}

	input[type='range']::-moz-range-track {
		background: rgb(var(--color-background) / 1);
		border-radius: 0.5rem;
	}
</style>
