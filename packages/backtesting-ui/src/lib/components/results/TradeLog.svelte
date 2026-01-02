<script lang="ts">
	import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-svelte';
	import type { Trade } from '@one-love-wealth/backtesting';

	interface Props {
		trades: Trade[];
	}

	let { trades }: Props = $props();

	// Sort state
	type SortField = 'timestamp' | 'symbol' | 'side' | 'quantity' | 'price' | 'value';
	let sortField = $state<SortField>('timestamp');
	let sortDirection = $state<'asc' | 'desc'>('asc');

	// Filter state
	let filterSide = $state<'all' | 'buy' | 'sell'>('all');
	let filterSymbol = $state('');

	// Sorted and filtered trades
	const processedTrades = $derived(() => {
		let result = [...trades];

		// Filter by side
		if (filterSide !== 'all') {
			result = result.filter((t) => t.side === filterSide);
		}

		// Filter by symbol
		if (filterSymbol) {
			const query = filterSymbol.toLowerCase();
			result = result.filter((t) => t.symbol.toLowerCase().includes(query));
		}

		// Sort
		result.sort((a, b) => {
			let aVal: any;
			let bVal: any;

			switch (sortField) {
				case 'timestamp':
					aVal = a.timestamp;
					bVal = b.timestamp;
					break;
				case 'symbol':
					aVal = a.symbol;
					bVal = b.symbol;
					break;
				case 'side':
					aVal = a.side;
					bVal = b.side;
					break;
				case 'quantity':
					aVal = a.quantity;
					bVal = b.quantity;
					break;
				case 'price':
					aVal = a.price;
					bVal = b.price;
					break;
				case 'value':
					aVal = a.value;
					bVal = b.value;
					break;
			}

			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		return result;
	});

	// Toggle sort
	function toggleSort(field: SortField) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}
	}

	// Format helpers
	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	}

	function formatNumber(value: number, decimals = 2): string {
		return value.toFixed(decimals);
	}

	// Calculate P&L for each trade pair (simplified)
	function calculatePnL(trade: Trade, index: number): { pnl: number; pnlPercent: number } | null {
		// This is a simplified calculation - in a real app you'd match entry/exit pairs
		// For now, return null to indicate no P&L display
		return null;
	}
</script>

<div class="space-y-4">
	<!-- Filters & Controls -->
	<div class="flex items-center gap-4 p-4 bg-surface/50 rounded-lg border border-border">
		<!-- Trade Count -->
		<div class="text-sm font-medium text-text-primary">
			{processedTrades().length} {processedTrades().length === 1 ? 'trade' : 'trades'}
		</div>

		<!-- Side Filter -->
		<div class="flex items-center gap-2">
			<label for="side-filter" class="text-xs text-text-secondary">Side:</label>
			<select
				id="side-filter"
				bind:value={filterSide}
				class="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
			>
				<option value="all">All</option>
				<option value="buy">Buy Only</option>
				<option value="sell">Sell Only</option>
			</select>
		</div>

		<!-- Symbol Filter -->
		<div class="flex items-center gap-2 flex-1 max-w-xs">
			<label for="symbol-filter" class="text-xs text-text-secondary">Symbol:</label>
			<input
				id="symbol-filter"
				type="text"
				placeholder="Filter by symbol..."
				bind:value={filterSymbol}
				class="flex-1 px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
			/>
		</div>

		<!-- Clear Filters -->
		{#if filterSide !== 'all' || filterSymbol}
			<button
				type="button"
				onclick={() => {
					filterSide = 'all';
					filterSymbol = '';
				}}
				class="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface/50 border border-border rounded-lg hover:border-primary/50 transition-colors"
			>
				Clear Filters
			</button>
		{/if}
	</div>

	<!-- Trade Table -->
	{#if processedTrades().length > 0}
		<div class="bg-surface rounded-lg border border-border overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border bg-surface/50">
							<th class="text-left px-4 py-3">
								<button
									type="button"
									onclick={() => toggleSort('timestamp')}
									class="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors"
								>
									Date
									<ArrowUpDown
										size={14}
										class={sortField === 'timestamp' ? 'text-primary' : 'text-text-secondary'}
									/>
								</button>
							</th>
							<th class="text-left px-4 py-3">
								<button
									type="button"
									onclick={() => toggleSort('symbol')}
									class="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors"
								>
									Symbol
									<ArrowUpDown
										size={14}
										class={sortField === 'symbol' ? 'text-primary' : 'text-text-secondary'}
									/>
								</button>
							</th>
							<th class="text-left px-4 py-3">
								<button
									type="button"
									onclick={() => toggleSort('side')}
									class="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors"
								>
									Side
									<ArrowUpDown
										size={14}
										class={sortField === 'side' ? 'text-primary' : 'text-text-secondary'}
									/>
								</button>
							</th>
							<th class="text-right px-4 py-3">
								<button
									type="button"
									onclick={() => toggleSort('quantity')}
									class="flex items-center gap-1 justify-end font-medium text-text-secondary hover:text-text-primary transition-colors w-full"
								>
									Quantity
									<ArrowUpDown
										size={14}
										class={sortField === 'quantity' ? 'text-primary' : 'text-text-secondary'}
									/>
								</button>
							</th>
							<th class="text-right px-4 py-3">
								<button
									type="button"
									onclick={() => toggleSort('price')}
									class="flex items-center gap-1 justify-end font-medium text-text-secondary hover:text-text-primary transition-colors w-full"
								>
									Price
									<ArrowUpDown
										size={14}
										class={sortField === 'price' ? 'text-primary' : 'text-text-secondary'}
									/>
								</button>
							</th>
							<th class="text-right px-4 py-3">
								<button
									type="button"
									onclick={() => toggleSort('value')}
									class="flex items-center gap-1 justify-end font-medium text-text-secondary hover:text-text-primary transition-colors w-full"
								>
									Value
									<ArrowUpDown
										size={14}
										class={sortField === 'value' ? 'text-primary' : 'text-text-secondary'}
									/>
								</button>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each processedTrades() as trade, index (trade.timestamp + trade.symbol + index)}
							<tr class="border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
								<!-- Date & Time -->
								<td class="px-4 py-3">
									<div class="text-text-primary font-medium">{formatDate(trade.timestamp)}</div>
									<div class="text-xs text-text-secondary">{formatTime(trade.timestamp)}</div>
								</td>

								<!-- Symbol -->
								<td class="px-4 py-3">
									<span class="font-medium text-text-primary">{trade.symbol}</span>
								</td>

								<!-- Side -->
								<td class="px-4 py-3">
									<div class="flex items-center gap-1.5">
										{#if trade.side === 'buy'}
											<TrendingUp size={16} class="text-green-500" />
											<span class="font-medium text-green-500">Buy</span>
										{:else}
											<TrendingDown size={16} class="text-red-500" />
											<span class="font-medium text-red-500">Sell</span>
										{/if}
									</div>
								</td>

								<!-- Quantity -->
								<td class="px-4 py-3 text-right">
									<span class="font-mono text-text-primary">{formatNumber(trade.quantity)}</span>
								</td>

								<!-- Price -->
								<td class="px-4 py-3 text-right">
									<span class="font-mono text-text-primary">{formatCurrency(trade.price)}</span>
								</td>

								<!-- Value -->
								<td class="px-4 py-3 text-right">
									<span class="font-mono font-medium text-text-primary">
										{formatCurrency(trade.value)}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<!-- Empty State -->
		<div class="bg-surface/50 rounded-lg p-8 border border-border">
			<div class="text-center">
				<ArrowUpDown size={48} class="mx-auto text-text-secondary mb-4" />
				<h3 class="text-lg font-semibold text-text-primary mb-2">No Trades Found</h3>
				<p class="text-sm text-text-secondary">
					{#if trades.length === 0}
						No trades were executed during this backtest period.
					{:else}
						No trades match the current filters. Try adjusting your filter settings.
					{/if}
				</p>
			</div>
		</div>
	{/if}
</div>