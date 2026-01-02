<script lang="ts">
	import { X, CheckCircle, AlertCircle, TrendingUp, Calendar } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { StrategyDefinition } from '$lib/strategies/types';
	import type { StrategyDocs } from '$lib/strategies/docs/types';
	import { loadStrategyDocs } from '$lib/strategies/docs/loader';

	interface Props {
		strategy: StrategyDefinition;
		onClose: () => void;
	}

	let { strategy, onClose }: Props = $props();

	// Documentation state
	let docs = $state<StrategyDocs | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Load documentation
	onMount(async () => {
		try {
			isLoading = true;
			error = null;
			const loadedDocs = await loadStrategyDocs(strategy.id);
			docs = loadedDocs;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load documentation';
		} finally {
			isLoading = false;
		}
	});

	// Close on Escape handled by parent component
</script>

<!-- Modal Backdrop -->
<div
	class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
	onclick={onClose}
	role="button"
	tabindex="-1"
>
	<!-- Modal Content -->
	<div
		class="bg-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
		onclick={(e) => e.stopPropagation()}
		role="dialog"
		aria-labelledby="modal-title"
	>
		<!-- Header -->
		<div class="flex items-start justify-between p-6 border-b border-border">
			<div class="flex-1">
				<h2 id="modal-title" class="text-2xl font-bold text-text-primary mb-2">
					{strategy.name}
				</h2>
				<p class="text-sm text-text-secondary">{strategy.description}</p>

				<!-- Category & Tags -->
				<div class="flex gap-2 mt-3 flex-wrap">
					<span class="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md font-medium">
						{strategy.category}
					</span>
					{#if strategy.tags && strategy.tags.length > 0}
						{#each strategy.tags.slice(0, 5) as tag}
							<span class="px-2 py-1 text-xs bg-background text-text-secondary rounded-md">
								{tag}
							</span>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Close Button -->
			<button
				type="button"
				onclick={onClose}
				class="ml-4 flex-shrink-0 w-8 h-8 rounded-lg hover:bg-background flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
				aria-label="Close modal"
			>
				<X size={20} />
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-6">
			{#if isLoading}
				<div class="flex items-center justify-center py-12">
					<div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				</div>
			{:else if error}
				<div class="text-center py-12">
					<AlertCircle size={48} class="mx-auto text-red-500 mb-4" />
					<p class="text-text-secondary">{error}</p>
				</div>
			{:else if docs}
				<!-- How It Works -->
				{#if docs.howItWorks}
					<section class="mb-6">
						<h3 class="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
							<TrendingUp size={18} class="text-primary" />
							How It Works
						</h3>
						<div class="text-sm text-text-secondary leading-relaxed space-y-3">
							{#each docs.howItWorks.split('\n\n') as paragraph}
								<p>{paragraph}</p>
							{/each}
						</div>
					</section>
				{/if}

				<!-- When to Use -->
				{#if docs.whenToUse}
					<section class="mb-6">
						<h3 class="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
							<Calendar size={18} class="text-primary" />
							When to Use
						</h3>
						<div class="text-sm text-text-secondary leading-relaxed space-y-3">
							{#each docs.whenToUse.split('\n\n') as paragraph}
								<p>{paragraph}</p>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Strengths & Weaknesses -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<!-- Strengths -->
					{#if docs.strengths && docs.strengths.length > 0}
						<section>
							<h3 class="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
								<CheckCircle size={18} class="text-green-500" />
								Strengths
							</h3>
							<ul class="space-y-2">
								{#each docs.strengths as strength}
									<li class="text-sm text-text-secondary flex items-start gap-2">
										<span class="text-green-500 mt-1">•</span>
										<span>{strength}</span>
									</li>
								{/each}
							</ul>
						</section>
					{/if}

					<!-- Weaknesses -->
					{#if docs.weaknesses && docs.weaknesses.length > 0}
						<section>
							<h3 class="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
								<AlertCircle size={18} class="text-orange-500" />
								Weaknesses
							</h3>
							<ul class="space-y-2">
								{#each docs.weaknesses as weakness}
									<li class="text-sm text-text-secondary flex items-start gap-2">
										<span class="text-orange-500 mt-1">•</span>
										<span>{weakness}</span>
									</li>
								{/each}
							</ul>
						</section>
					{/if}
				</div>

				<!-- Examples -->
				{#if docs.examples && docs.examples.length > 0}
					<section class="mb-6">
						<h3 class="text-lg font-semibold text-text-primary mb-3">Examples</h3>
						<ul class="space-y-2">
							{#each docs.examples as example}
								<li class="text-sm text-text-secondary flex items-start gap-2">
									<span class="text-primary mt-1">→</span>
									<span>{example}</span>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				<!-- Preset Information -->
				{#if strategy.preset}
					<section class="bg-primary/5 rounded-lg p-4 border border-primary/20">
						<h3 class="text-sm font-semibold text-primary mb-2">
							💡 Recommended Preset
						</h3>
						<p class="text-sm text-text-secondary mb-3">
							{strategy.preset.rationale}
						</p>

						{#if strategy.preset.optimizedFor && strategy.preset.optimizedFor.length > 0}
							<div class="mb-3">
								<div class="text-xs font-medium text-text-primary mb-1">Optimized for:</div>
								<div class="flex flex-wrap gap-1">
									{#each strategy.preset.optimizedFor as item}
										<span class="px-2 py-0.5 text-xs bg-background rounded text-text-secondary">
											{item}
										</span>
									{/each}
								</div>
							</div>
						{/if}

						{#if strategy.preset.expectedMetrics}
							<div class="grid grid-cols-2 gap-2 text-xs">
								{#if strategy.preset.expectedMetrics.sharpe}
									<div>
										<span class="text-text-secondary">Sharpe:</span>
										<span class="text-text-primary font-medium ml-1">
											{strategy.preset.expectedMetrics.sharpe}
										</span>
									</div>
								{/if}
								{#if strategy.preset.expectedMetrics.maxDrawdown}
									<div>
										<span class="text-text-secondary">Max DD:</span>
										<span class="text-text-primary font-medium ml-1">
											{strategy.preset.expectedMetrics.maxDrawdown}
										</span>
									</div>
								{/if}
								{#if strategy.preset.expectedMetrics.winRate}
									<div>
										<span class="text-text-secondary">Win Rate:</span>
										<span class="text-text-primary font-medium ml-1">
											{strategy.preset.expectedMetrics.winRate}
										</span>
									</div>
								{/if}
								{#if strategy.preset.expectedMetrics.annualReturn}
									<div>
										<span class="text-text-secondary">Annual Return:</span>
										<span class="text-text-primary font-medium ml-1">
											{strategy.preset.expectedMetrics.annualReturn}
										</span>
									</div>
								{/if}
							</div>
						{/if}
					</section>
				{/if}

				<!-- Notes -->
				{#if docs.notes}
					<section class="mt-6 text-xs text-text-secondary italic">
						<p>{docs.notes}</p>
					</section>
				{/if}
			{:else}
				<div class="text-center py-12">
					<p class="text-text-secondary">No documentation available for this strategy.</p>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="border-t border-border p-4 bg-background/50">
			<button
				type="button"
				onclick={onClose}
				class="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
			>
				Close
			</button>
		</div>
	</div>
</div>
