<script lang="ts">
	import {
		ChevronDown,
		ChevronUp,
		TrendingUp,
		CheckCircle,
		BarChart3,
		Table,
	} from "lucide-svelte";
	import { optimization } from "$lib/stores/optimization.svelte";
	import { strategy } from "$lib/stores/strategy.svelte";
	import { ui } from "$lib/stores/ui.svelte";
	import { toastStore } from "@one-love-wealth/shared-ui";
	import ParameterHeatmap from "./ParameterHeatmap.svelte";

	// Tab state
	let activeTab = $state<"table" | "heatmap">("table");

	// Sorting
	type SortField = "rank" | "objective" | "sharpe" | "maxDrawdown";
	let sortField = $state<SortField>("rank");
	let sortDirection = $state<"asc" | "desc">("asc");

	// Pagination
	let showAll = $state(false);
	const pageSize = 20;

	// Get results
	const results = $derived.by(() => {
		if (!optimization.result) return [];

		let sorted = [...optimization.result.allResults];

		// Sort
		switch (sortField) {
			case "rank":
				// Already sorted by objective
				break;
			case "objective":
				sorted.sort((a, b) =>
					sortDirection === "asc"
						? a.objectiveValue - b.objectiveValue
						: b.objectiveValue - a.objectiveValue,
				);
				break;
			case "sharpe":
				sorted.sort((a, b) =>
					sortDirection === "asc"
						? (a.result.metrics.sharpeRatio ?? 0) -
							(b.result.metrics.sharpeRatio ?? 0)
						: (b.result.metrics.sharpeRatio ?? 0) -
							(a.result.metrics.sharpeRatio ?? 0),
				);
				break;
			case "maxDrawdown":
				sorted.sort((a, b) =>
					sortDirection === "asc"
						? (a.result.metrics.maxDrawdownPercent ?? 0) -
							(b.result.metrics.maxDrawdownPercent ?? 0)
						: (b.result.metrics.maxDrawdownPercent ?? 0) -
							(a.result.metrics.maxDrawdownPercent ?? 0),
				);
				break;
		}

		return sorted;
	});

	// Displayed results
	const displayedResults = $derived.by(() => {
		const r = results;
		return showAll ? r : r.slice(0, pageSize);
	});

	// Toggle sort
	function toggleSort(field: SortField) {
		if (sortField === field) {
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		} else {
			sortField = field;
			sortDirection = "asc";
		}
	}

	// Apply best parameters
	function applyBestParameters() {
		if (!optimization.result?.bestResult?.params) return;

		// Copy best params to strategy store
		strategy.updateParams({ ...optimization.result.bestResult.params });

		// Switch to backtest mode
		ui.setMode("backtest");

		// Show confirmation
		toastStore.success("Best parameters applied! Ready to run backtest.");
	}

	// Format helpers
	function formatPercent(value: number): string {
		return `${(value * 100).toFixed(2)}%`;
	}

	function formatNumber(value: number): string {
		return value.toFixed(2);
	}

	function formatParams(params: Record<string, any>): string {
		return Object.entries(params)
			.map(
				([key, val]) =>
					`${key}: ${typeof val === "number" ? val.toFixed(2) : val}`,
			)
			.join(", ");
	}
</script>

{#if optimization.result}
	<div class="h-full flex flex-col">
		<!-- Header -->
		<div class="p-4 border-b border-border">
			<div class="flex items-center justify-between mb-2">
				<h2 class="text-lg font-semibold text-text-primary">
					Optimization Results
				</h2>
				<button
					type="button"
					onclick={applyBestParameters}
					class="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
				>
					<CheckCircle size={16} />
					Apply Best
				</button>
			</div>
			<div class="text-sm text-text-secondary">
				Found {optimization.result.totalCombinations} results
				{#if optimization.result.method === "grid"}
					(exhaustive search)
				{:else if optimization.result.method === "random"}
					(random sampling)
				{:else}
					(genetic evolution)
				{/if}
			</div>
		</div>

		<!-- Best Result Highlight -->
		<div class="p-4 bg-primary/5 border-b border-primary/20">
			<div class="text-xs font-semibold text-primary mb-1">
				Best Result
			</div>
			<div class="flex items-center justify-between">
				<div>
					<div class="text-sm font-medium text-text-primary">
						{optimization.result.objective
							.toLowerCase()
							.includes("sharpe")
							? "Sharpe Ratio"
							: optimization.result.objective
										.toLowerCase()
										.includes("sortino")
								? "Sortino Ratio"
								: "Total Return"}:
						<span class="text-primary ml-1">
							{optimization.result.bestResult.objectiveValue.toFixed(
								2,
							)}
						</span>
					</div>
					<div class="text-xs text-text-secondary mt-1">
						{formatParams(optimization.result.bestResult.params)}
					</div>
				</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="border-b border-border flex">
			<button
				type="button"
				onclick={() => (activeTab = "table")}
				class="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors {activeTab ===
				'table'
					? 'text-primary border-b-2 border-primary'
					: 'text-text-secondary hover:text-text-primary'}"
			>
				<Table size={16} />
				Results Table
			</button>
			<button
				type="button"
				onclick={() => (activeTab = "heatmap")}
				class="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors {activeTab ===
				'heatmap'
					? 'text-primary border-b-2 border-primary'
					: 'text-text-secondary hover:text-text-primary'}"
			>
				<BarChart3 size={16} />
				Heatmap
			</button>
		</div>

		<!-- Tab Content -->
		{#if activeTab === "table"}
			<!-- Results Table -->
			<div class="flex-1 overflow-y-auto">
				<table class="w-full text-sm">
					<thead
						class="sticky top-0 bg-surface border-b border-border"
					>
						<tr>
							<th class="px-3 py-2 text-left">
								<button
									type="button"
									onclick={() => toggleSort("rank")}
									class="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary"
								>
									Rank
									{#if sortField === "rank"}
										{#if sortDirection === "asc"}
											<ChevronUp size={14} />
										{:else}
											<ChevronDown size={14} />
										{/if}
									{/if}
								</button>
							</th>
							<th
								class="px-3 py-2 text-left text-xs font-medium text-text-secondary"
							>
								Parameters
							</th>
							<th class="px-3 py-2 text-right">
								<button
									type="button"
									onclick={() => toggleSort("objective")}
									class="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary ml-auto"
								>
									Objective
									{#if sortField === "objective"}
										{#if sortDirection === "asc"}
											<ChevronUp size={14} />
										{:else}
											<ChevronDown size={14} />
										{/if}
									{/if}
								</button>
							</th>
							<th class="px-3 py-2 text-right">
								<button
									type="button"
									onclick={() => toggleSort("sharpe")}
									class="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary ml-auto"
								>
									Sharpe
									{#if sortField === "sharpe"}
										{#if sortDirection === "asc"}
											<ChevronUp size={14} />
										{:else}
											<ChevronDown size={14} />
										{/if}
									{/if}
								</button>
							</th>
							<th class="px-3 py-2 text-right">
								<button
									type="button"
									onclick={() => toggleSort("maxDrawdown")}
									class="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary ml-auto"
								>
									Max DD
									{#if sortField === "maxDrawdown"}
										{#if sortDirection === "asc"}
											<ChevronUp size={14} />
										{:else}
											<ChevronDown size={14} />
										{/if}
									{/if}
								</button>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each displayedResults as result, index}
							<tr
								class="border-b border-border/50 hover:bg-surface/50 transition-colors"
							>
								<td
									class="px-3 py-2 text-text-primary font-medium"
									>#{index + 1}</td
								>
								<td
									class="px-3 py-2 text-text-secondary text-xs"
								>
									{formatParams(result.params)}
								</td>
								<td
									class="px-3 py-2 text-right font-medium text-primary"
								>
									{result.objectiveValue.toFixed(2)}
								</td>
								<td
									class="px-3 py-2 text-right text-text-primary"
								>
									{formatNumber(
										result.result.metrics.sharpeRatio ?? 0,
									)}
								</td>
								<td
									class="px-3 py-2 text-right font-medium {Math.abs(
										result.result.metrics
											.maxDrawdownPercent ?? 0,
									) < 0.2
										? 'text-green-500'
										: 'text-orange-500'}"
								>
									{formatPercent(
										Math.abs(
											result.result.metrics
												.maxDrawdownPercent ?? 0,
										),
									)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Show All Button -->
			{#if results.length > pageSize}
				<div class="border-t border-border p-3 text-center">
					<button
						type="button"
						onclick={() => (showAll = !showAll)}
						class="text-sm text-primary hover:text-primary/80 transition-colors"
					>
						{showAll
							? "Show Top 20"
							: `Show All ${results.length} Results`}
					</button>
				</div>
			{/if}
		{:else}
			<!-- Heatmap -->
			<div class="flex-1 overflow-y-auto p-4">
				<ParameterHeatmap />
			</div>
		{/if}
	</div>
{:else}
	<!-- Empty State -->
	<div class="h-full flex items-center justify-center p-6">
		<div class="text-center">
			<TrendingUp size={48} class="mx-auto text-text-secondary mb-3" />
			<p class="text-sm text-text-secondary">
				Run an optimization to see results
			</p>
		</div>
	</div>
{/if}
