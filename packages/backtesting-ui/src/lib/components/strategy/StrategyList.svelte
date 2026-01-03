<script lang="ts">
	import { Search, Info } from "lucide-svelte";
	import { strategy } from "$lib/stores/strategy";
	import { STRATEGIES } from "$lib/strategies/registry";
	import type { StrategyDefinition } from "$lib/strategies/types";
	import StrategyDescription from "./StrategyDescription.svelte";

	// Search state
	let searchQuery = $state("");

	// Modal state
	let showDescriptionModal = $state(false);
	let selectedStrategyForDescription = $state<StrategyDefinition | null>(
		null,
	);

	// Group strategies by category
	const categoryOrder = [
		"trend",
		"momentum",
		"mean-reversion",
		"volatility",
		"multi-symbol",
	];
	const categoryLabels: Record<string, string> = {
		trend: "Trend Following",
		momentum: "Momentum",
		"mean-reversion": "Mean Reversion",
		volatility: "Volatility",
		"multi-symbol": "Multi-Symbol",
	};

	// Reactive state from store
	const currentStrategy = $derived(strategy.selectedStrategy);

	// Filtered and grouped strategies
	const groupedStrategies = $derived.by(() => {
		const allStrategies = Object.values(STRATEGIES);
		const q = searchQuery.toLowerCase().trim();

		// Filter by search query
		const filtered =
			q === ""
				? allStrategies
				: allStrategies.filter(
						(s) =>
							s.name.toLowerCase().includes(q) ||
							s.description.toLowerCase().includes(q) ||
							s.tags?.some((t) => t.toLowerCase().includes(q)),
					);

		// Group by category
		const groups: Record<string, StrategyDefinition[]> = {};
		for (const cat of categoryOrder) {
			groups[cat] = filtered.filter((s) => s.category === cat);
		}

		return groups;
	});

	// Handle strategy selection
	function selectStrategy(strategyId: string) {
		strategy.selectStrategy(strategyId);
	}

	// Handle info button click
	function showDescription(
		strategyDef: StrategyDefinition,
		event: MouseEvent | KeyboardEvent,
	) {
		event.stopPropagation(); // Prevent triggering the select action
		selectedStrategyForDescription = strategyDef;
		showDescriptionModal = true;
	}

	// Close modal
	function closeModal() {
		showDescriptionModal = false;
		selectedStrategyForDescription = null;
	}

	// Keyboard handler for modal
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && showDescriptionModal) {
			closeModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="h-full flex flex-col">
	<!-- Header -->
	<div class="p-4 border-b border-border">
		<h2 class="text-lg font-semibold text-text-primary mb-3">Strategies</h2>

		<!-- Search Input -->
		<div class="relative">
			<div
				class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
			>
				<Search size={16} />
			</div>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search strategies..."
				class="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
			/>
		</div>
	</div>

	<!-- Strategy List -->
	<div class="flex-1 overflow-y-auto">
		{#each categoryOrder as category}
			{@const strategiesInCategory = groupedStrategies[category]}
			{#if strategiesInCategory.length > 0}
				<div class="py-3">
					<!-- Category Header -->
					<div
						class="px-4 py-1 text-xs font-semibold text-text-secondary uppercase tracking-wide"
					>
						{categoryLabels[category]}
					</div>

					<!-- Strategies -->
					{#each strategiesInCategory as strategyDef}
						{@const isSelected =
							currentStrategy?.id === strategyDef.id}
						<button
							type="button"
							class="w-full px-4 py-3 text-left hover:bg-surface transition-colors group relative {isSelected
								? 'bg-primary/10 border-l-2 border-primary'
								: ''}"
							onclick={() => selectStrategy(strategyDef.id)}
						>
							<div class="flex items-start justify-between gap-2">
								<div class="flex-1 min-w-0">
									<div
										class="font-medium text-sm text-text-primary mb-1"
									>
										{strategyDef.name}
									</div>
									<div
										class="text-xs text-text-secondary line-clamp-2"
									>
										{strategyDef.description}
									</div>
								</div>

								<!-- Info Icon -->
								<div
									role="button"
									tabindex="0"
									class="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
									onclick={(e) =>
										showDescription(strategyDef, e)}
									onkeydown={(e) => {
										if (
											e.key === "Enter" ||
											e.key === " "
										) {
											e.preventDefault();
											showDescription(strategyDef, e);
										}
									}}
									title="View documentation"
								>
									<Info size={14} />
								</div>
							</div>

							<!-- Tags (if present) -->
							{#if strategyDef.tags && strategyDef.tags.length > 0}
								<div class="flex gap-1 mt-2 flex-wrap">
									{#each strategyDef.tags.slice(0, 3) as tag}
										<span
											class="px-1.5 py-0.5 text-xs bg-background rounded text-text-secondary"
										>
											{tag}
										</span>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		{/each}

		<!-- No Results -->
		{#if Object.values(groupedStrategies).every((arr) => arr.length === 0)}
			<div class="p-8 text-center">
				<div class="text-text-secondary text-sm mb-2">
					No strategies found
				</div>
				<div class="text-text-secondary text-xs">
					Try adjusting your search query
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Strategy Description Modal -->
{#if showDescriptionModal && selectedStrategyForDescription}
	<StrategyDescription
		strategy={selectedStrategyForDescription}
		onClose={closeModal}
	/>
{/if}
