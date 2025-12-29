<script lang="ts">
	import { dataProviderRegistry } from '$lib/data-providers';
	import type { DataSourceConfig, DataProviderType } from '$lib/types/data-provider';
	import type { FetchResult } from '$lib/data-providers';
	import { getAllCachedSeries, formatAge, clearAllCache, type CacheEntry } from '$lib/utils/cache-inspector';

	let selectedProvider: DataProviderType = 'fred';
	let selectedSeries = 'M2SL';
	let fetchResult: FetchResult | null = null;
	let loading = false;
	let error: string | null = null;
	let cacheEntries: CacheEntry[] = [];
	let showCache = false;

	// Provider definitions
	const providers: Array<{ type: DataProviderType; name: string; icon: string; available: boolean }> = [
		{ type: 'fred', name: 'FRED', icon: '📊', available: true },
		{ type: 'coingecko', name: 'CoinGecko', icon: '🦎', available: true },
		{ type: 'yahoo', name: 'Yahoo Finance', icon: '💹', available: true },
		{ type: 'worldbank', name: 'World Bank', icon: '🏦', available: true },
		{ type: 'bls', name: 'BLS', icon: '👷', available: true },
		{ type: 'treasury', name: 'Treasury', icon: '💰', available: true },
		{ type: 'hyperliquid', name: 'Hyperliquid', icon: '⚡', available: true }
	];

	// Series options
	const seriesOptions: Record<string, Array<{ id: string; name: string }>> = {
		fred: [
			{ id: 'M2SL', name: 'M2 Money Supply' },
			{ id: 'IPMAN', name: 'ISM Manufacturing PMI' },
			{ id: 'GS10', name: '10Y Treasury Rate' },
			{ id: 'FEDFUNDS', name: 'Fed Funds Rate' },
			{ id: 'GFDEGDQ188S', name: 'Federal Debt/GDP' },
			{ id: 'CIVPART', name: 'Labor Force Participation' },
			{ id: 'GDPC1', name: 'Real GDP' },
			{ id: 'NFCI', name: 'Financial Conditions Index' }
		],
		coingecko: [
			{ id: 'bitcoin', name: 'Bitcoin' },
			{ id: 'ethereum', name: 'Ethereum' },
			{ id: 'solana', name: 'Solana' },
			{ id: 'cardano', name: 'Cardano' }
		],
		yahoo: [
			{ id: '^GSPC', name: 'S&P 500' },
			{ id: '^NDX', name: 'NASDAQ 100' },
			{ id: '^DJI', name: 'Dow Jones' },
			{ id: '^VIX', name: 'VIX (Volatility)' },
			{ id: 'AAPL', name: 'Apple Inc.' },
			{ id: 'MSFT', name: 'Microsoft Corp.' }
		],
		worldbank: [
			{ id: 'NY.GDP.MKTP.CD', name: 'GDP (Current USD)' },
			{ id: 'NY.GDP.MKTP.KD.ZG', name: 'GDP Growth (%)' },
			{ id: 'SP.POP.TOTL', name: 'Population, Total' },
			{ id: 'GC.DOD.TOTL.GD.ZS', name: 'Debt % of GDP' },
			{ id: 'FP.CPI.TOTL.ZG', name: 'Inflation (CPI)' },
			{ id: 'SL.UEM.TOTL.ZS', name: 'Unemployment (%)' }
		],
		bls: [
			{ id: 'LNS14000000', name: 'Unemployment Rate' },
			{ id: 'LNS11300000', name: 'Labor Force Participation' },
			{ id: 'CES0000000001', name: 'Nonfarm Payrolls' },
			{ id: 'CUUR0000SA0', name: 'CPI All Items' },
			{ id: 'WPUFD4', name: 'PPI Final Demand' },
			{ id: 'LNS12300000', name: 'Employment-Population Ratio' }
		],
		treasury: [
			{ id: 'debt_to_penny', name: 'Debt to the Penny' },
			{ id: 'historical_debt', name: 'Historical Debt Outstanding' },
			{ id: 'avg_interest_rates', name: 'Average Interest Rates' },
			{ id: 'interest_expense', name: 'Interest Expense' }
		],
		hyperliquid: [
			{ id: 'BTC', name: 'Bitcoin Perpetual' },
			{ id: 'ETH', name: 'Ethereum Perpetual' },
			{ id: 'SOL', name: 'Solana Perpetual' },
			{ id: 'HYPE', name: 'Hyperliquid Token' }
		]
	};

	// FRED-specific parameters
	let fredUnits: string = 'lin';
	let fredFrequency: string = '';
	let fredDateRangeStart: string = '';
	let fredLimit: number | null = null;

	// CoinGecko-specific parameters
	let coinGeckoCurrency: string = 'usd';
	let coinGeckoDays: string | number = 'max';

	// Yahoo-specific parameters
	let yahooInterval: string = '1d';
	let yahooDateRangeStart: string = '';
	let yahooDateRangeEnd: string = '';

	// WorldBank-specific parameters
	let worldBankCountry: string = 'USA';
	let worldBankStartYear: string = '';
	let worldBankEndYear: string = '';

	// BLS-specific parameters
	let blsStartYear: string = '';
	let blsEndYear: string = '';
	let blsCalculations: boolean = false;

	// Treasury-specific parameters
	let treasuryDateRangeStart: string = '';
	let treasuryDateRangeEnd: string = '';

	// Hyperliquid-specific parameters
	let hyperliquidDataType: string = 'candles';
	let hyperliquidInterval: string = '1d';
	let hyperliquidStartTime: string = '';
	let hyperliquidEndTime: string = '';

	$: currentSeriesOptions = seriesOptions[selectedProvider] || [];

	async function handleFetch() {
		loading = true;
		error = null;

		try {
			const config = buildConfig();
			fetchResult = await dataProviderRegistry.fetch(config);
		} catch (err: any) {
			error = err.message || 'Unknown error';
			fetchResult = null;
		} finally {
			loading = false;
		}
	}

	function buildConfig(): DataSourceConfig {
		const baseConfig = {
			id: `${selectedProvider}-${selectedSeries}`,
			name: selectedSeries,
			type: selectedProvider
		};

		if (selectedProvider === 'fred') {
			return {
				...baseConfig,
				type: 'fred',
				seriesId: selectedSeries,
				units: fredUnits !== '' ? (fredUnits as any) : undefined,
				frequency: fredFrequency !== '' ? (fredFrequency as any) : undefined,
				dateRange: fredDateRangeStart ? { start: fredDateRangeStart, limit: fredLimit || undefined } : undefined
			};
		} else if (selectedProvider === 'coingecko') {
			return {
				...baseConfig,
				type: 'coingecko',
				coinId: selectedSeries,
				vsCurrency: coinGeckoCurrency as any,
				days: coinGeckoDays === 'max' ? 'max' : Number(coinGeckoDays)
			};
		} else if (selectedProvider === 'yahoo') {
			return {
				...baseConfig,
				type: 'yahoo',
				symbol: selectedSeries,
				interval: yahooInterval as any,
				dateRange: yahooDateRangeStart || yahooDateRangeEnd ? {
					start: yahooDateRangeStart || undefined,
					end: yahooDateRangeEnd || undefined
				} : undefined
			};
		} else if (selectedProvider === 'worldbank') {
			return {
				...baseConfig,
				type: 'worldbank',
				indicatorCode: selectedSeries,
				countryCode: worldBankCountry,
				dateRange: worldBankStartYear || worldBankEndYear ? {
					start: worldBankStartYear ? Number(worldBankStartYear) : undefined,
					end: worldBankEndYear ? Number(worldBankEndYear) : undefined
				} : undefined
			};
		} else if (selectedProvider === 'bls') {
			const config: any = {
				...baseConfig,
				type: 'bls',
				seriesId: selectedSeries
			};

			// Only add dateRange if at least one year is specified
			if (blsStartYear && blsEndYear) {
				config.dateRange = {
					startYear: Number(blsStartYear),
					endYear: Number(blsEndYear)
				};
			}

			if (blsCalculations) {
				config.calculations = true;
			}

			return config;
		} else if (selectedProvider === 'treasury') {
			return {
				...baseConfig,
				type: 'treasury',
				dataset: selectedSeries as any,
				dateRange: treasuryDateRangeStart || treasuryDateRangeEnd ? {
					start: treasuryDateRangeStart || undefined,
					end: treasuryDateRangeEnd || undefined
				} : undefined
			};
		} else if (selectedProvider === 'hyperliquid') {
			return {
				...baseConfig,
				type: 'hyperliquid',
				coin: selectedSeries,
				dataType: hyperliquidDataType as any,
				interval: hyperliquidInterval as any,
				dateRange: hyperliquidStartTime || hyperliquidEndTime ? {
					startTime: hyperliquidStartTime ? new Date(hyperliquidStartTime).getTime() : undefined,
					endTime: hyperliquidEndTime ? new Date(hyperliquidEndTime).getTime() : undefined
				} : undefined
			};
		}

		return baseConfig as any;
	}

	async function loadCacheInfo() {
		cacheEntries = await getAllCachedSeries();
		showCache = true;
	}

	async function handleClearCache() {
		if (confirm('Clear all cached data?')) {
			await clearAllCache();
			cacheEntries = [];
			alert('Cache cleared!');
		}
	}

	// Auto-select first series when provider changes
	$: if (selectedProvider && currentSeriesOptions.length > 0) {
		selectedSeries = currentSeriesOptions[0].id;
	}
</script>

<div class="api-tester">
	<header>
		<h1>API Visual Testing & Configuration</h1>
		<p>Test data providers with live parameter testing and visual feedback</p>
	</header>

	<div class="content">
		<!-- Column 1: Provider & Series Selection -->
		<aside class="sidebar left">
			<section>
				<h3>1. Select Provider</h3>
				<div class="provider-grid">
					{#each providers as provider}
						<button
							class="provider-btn"
							class:active={selectedProvider === provider.type}
							class:disabled={!provider.available}
							disabled={!provider.available}
							on:click={() => (selectedProvider = provider.type)}
						>
							<span class="icon">{provider.icon}</span>
							<span class="name">{provider.name}</span>
							{#if !provider.available}
								<span class="badge">Coming Soon</span>
							{/if}
						</button>
					{/each}
				</div>
			</section>

			<section>
				<h3>2. Select Series</h3>
				<select bind:value={selectedSeries} class="series-select">
					{#each currentSeriesOptions as option}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
			</section>

			<section>
				<h3>3. Fetch Data</h3>
				<button class="fetch-btn" on:click={handleFetch} disabled={loading}>
					{loading ? 'Fetching...' : 'Fetch Data'}
				</button>
			</section>

			<section>
				<h3>Cache Tools</h3>
				<div class="cache-tools">
					<button on:click={loadCacheInfo} class="secondary-btn">View Cache</button>
					<button on:click={handleClearCache} class="danger-btn">Clear All</button>
				</div>
			</section>
		</aside>

		<!-- Column 2: Debug Graph / Results -->
		<main class="main-column">
			{#if loading}
				<div class="status-box loading">
					<p>⏳ Fetching data...</p>
				</div>
			{:else if error}
				<div class="status-box error">
					<h3>❌ Error</h3>
					<p>{error}</p>
				</div>
			{:else if fetchResult}
				<div class="results">
					<div class="result-header">
						<h3>✅ Success</h3>
						<div class="meta">
							<span class="badge">{fetchResult.fromCache ? 'Cached' : 'Fresh'}</span>
							{#if fetchResult.fetchDuration}
								<span class="badge">{fetchResult.fetchDuration.toFixed(0)}ms</span>
							{/if}
							<span class="badge">{fetchResult.series.data.length} points</span>
						</div>
					</div>

					<div class="data-preview">
						<h4>Data Preview (First 10 points)</h4>
						<table>
							<thead>
								<tr>
									<th>Date</th>
									<th>Value</th>
								</tr>
							</thead>
							<tbody>
								{#each fetchResult.series.data.slice(0, 10) as point}
									<tr>
										<td>{new Date(point.time).toISOString().split('T')[0]}</td>
										<td>{(point.value ?? 0).toFixed(2)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<div class="data-stats">
						<h4>Statistics</h4>
						<dl>
							<dt>Series ID:</dt>
							<dd>{fetchResult.series.id}</dd>
							<dt>Source:</dt>
							<dd>{fetchResult.series.source}</dd>
							<dt>Total Points:</dt>
							<dd>{fetchResult.series.data.length}</dd>
							<dt>Last Updated:</dt>
							<dd>{new Date(fetchResult.series.lastUpdated).toLocaleString()}</dd>
							{#if fetchResult.series.data.length > 0}
								<dt>Date Range:</dt>
								<dd>
									{new Date(fetchResult.series.data[0].time).toISOString().split('T')[0]} to {new Date(fetchResult.series.data[fetchResult.series.data.length - 1].time).toISOString().split('T')[0]}
								</dd>
							{/if}
						</dl>
					</div>
				</div>
			{:else if showCache}
				<div class="cache-view">
					<h3>📦 Cache Inspector</h3>
					<p class="cache-summary">
						{cacheEntries.length} cached series, {cacheEntries.reduce((sum, e) => sum + e.dataPoints, 0).toLocaleString()} total data points
					</p>
					<div class="cache-list">
						{#each cacheEntries as entry}
							<div class="cache-entry">
								<div class="cache-entry-header">
									<strong>{entry.id}</strong>
									<span class="badge">{entry.source}</span>
								</div>
								<div class="cache-entry-meta">
									{entry.dataPoints} points · {entry.sizeKB} KB · Age: {formatAge(entry.age)}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="status-box empty">
					<p>👈 Select a provider and series, then click "Fetch Data"</p>
				</div>
			{/if}
		</main>

		<!-- Column 3: Parameters -->
		<aside class="sidebar right">
			<h3>Parameters</h3>

			{#if selectedProvider === 'fred'}
				<section>
					<label>
						<span>Units (Transformation)</span>
						<select bind:value={fredUnits}>
							<option value="lin">Levels (lin)</option>
							<option value="pc1">YoY % (pc1) ⭐</option>
							<option value="pch">% Change (pch)</option>
							<option value="ch1">Change from Year Ago (ch1)</option>
							<option value="log">Natural Log (log)</option>
						</select>
					</label>
				</section>

				<section>
					<label>
						<span>Frequency</span>
						<select bind:value={fredFrequency}>
							<option value="">Default</option>
							<option value="d">Daily</option>
							<option value="w">Weekly</option>
							<option value="m">Monthly</option>
							<option value="q">Quarterly</option>
							<option value="a">Annual</option>
						</select>
					</label>
				</section>

				<section>
					<label>
						<span>Start Date</span>
						<input type="date" bind:value={fredDateRangeStart} />
					</label>
				</section>

				<section>
					<label>
						<span>Limit (Recent N Points)</span>
						<input type="number" bind:value={fredLimit} placeholder="All" min="1" max="10000" />
					</label>
				</section>
			{:else if selectedProvider === 'coingecko'}
				<section>
					<label>
						<span>Currency</span>
						<select bind:value={coinGeckoCurrency}>
							<option value="usd">USD</option>
							<option value="eur">EUR</option>
							<option value="gbp">GBP</option>
							<option value="btc">BTC</option>
							<option value="eth">ETH</option>
						</select>
					</label>
				</section>

				<section>
					<label>
						<span>Days of History</span>
						<select bind:value={coinGeckoDays}>
							<option value="max">Maximum</option>
							<option value={1}>1 Day</option>
							<option value={7}>7 Days</option>
							<option value={30}>30 Days</option>
							<option value={90}>90 Days</option>
							<option value={365}>1 Year</option>
						</select>
					</label>
				</section>
			{:else if selectedProvider === 'yahoo'}
				<section>
					<label>
						<span>Interval</span>
						<select bind:value={yahooInterval}>
							<option value="1d">Daily (1d)</option>
							<option value="1wk">Weekly (1wk)</option>
							<option value="1mo">Monthly (1mo)</option>
						</select>
					</label>
				</section>

				<section>
					<label>
						<span>Start Date</span>
						<input type="date" bind:value={yahooDateRangeStart} />
					</label>
				</section>

				<section>
					<label>
						<span>End Date</span>
						<input type="date" bind:value={yahooDateRangeEnd} />
					</label>
				</section>
			{:else if selectedProvider === 'worldbank'}
				<section>
					<label>
						<span>Country Code</span>
						<select bind:value={worldBankCountry}>
							<option value="USA">United States</option>
							<option value="CHN">China</option>
							<option value="JPN">Japan</option>
							<option value="DEU">Germany</option>
							<option value="GBR">United Kingdom</option>
							<option value="FRA">France</option>
							<option value="WLD">World</option>
						</select>
					</label>
				</section>

				<section>
					<label>
						<span>Start Year</span>
						<input type="number" bind:value={worldBankStartYear} placeholder="e.g., 2000" min="1960" />
					</label>
				</section>

				<section>
					<label>
						<span>End Year</span>
						<input type="number" bind:value={worldBankEndYear} placeholder="e.g., 2023" />
					</label>
				</section>
			{:else if selectedProvider === 'bls'}
				<section>
					<label>
						<span>Start Year</span>
						<input type="number" bind:value={blsStartYear} placeholder="e.g., 2010" min="1947" />
					</label>
				</section>

				<section>
					<label>
						<span>End Year</span>
						<input type="number" bind:value={blsEndYear} placeholder="e.g., 2024" />
					</label>
				</section>

				<section>
					<label>
						<input type="checkbox" bind:checked={blsCalculations} style="width: auto; margin-right: 0.5rem;" />
						<span>Include Calculations (Percent Changes)</span>
					</label>
				</section>

				<div class="info-box" style="margin-top: 1rem;">
					<p style="font-size: 0.75rem;">
						BLS API: 25 requests/day without API key, 500/day with key.
					</p>
				</div>
			{:else if selectedProvider === 'treasury'}
				<section>
					<label>
						<span>Start Date</span>
						<input type="date" bind:value={treasuryDateRangeStart} />
					</label>
				</section>

				<section>
					<label>
						<span>End Date</span>
						<input type="date" bind:value={treasuryDateRangeEnd} />
					</label>
				</section>

				<div class="info-box" style="margin-top: 1rem;">
					<p style="font-size: 0.75rem;">
						Treasury API is free and open. Large datasets may take longer to fetch.
					</p>
				</div>
			{:else if selectedProvider === 'hyperliquid'}
				<section>
					<label>
						<span>Data Type</span>
						<select bind:value={hyperliquidDataType}>
							<option value="candles">Candles (OHLCV)</option>
							<option value="fundingHistory">Funding History</option>
							<option value="openInterest">Open Interest</option>
						</select>
					</label>
				</section>

				{#if hyperliquidDataType === 'candles'}
					<section>
						<label>
							<span>Interval</span>
							<select bind:value={hyperliquidInterval}>
								<option value="1m">1 Minute</option>
								<option value="5m">5 Minutes</option>
								<option value="15m">15 Minutes</option>
								<option value="1h">1 Hour</option>
								<option value="4h">4 Hours</option>
								<option value="1d">1 Day</option>
								<option value="1w">1 Week</option>
							</select>
						</label>
					</section>
				{/if}

				<section>
					<label>
						<span>Start Time</span>
						<input type="datetime-local" bind:value={hyperliquidStartTime} />
					</label>
				</section>

				<section>
					<label>
						<span>End Time</span>
						<input type="datetime-local" bind:value={hyperliquidEndTime} />
					</label>
				</section>

				<div class="info-box" style="margin-top: 1rem;">
					<p style="font-size: 0.75rem;">
						Hyperliquid DEX API. No API key required for market data.
					</p>
				</div>
			{/if}

			<div class="info-box">
				<h4>ℹ️ About This Tool</h4>
				<p>
					Test API providers with live parameter configuration. Changes to parameters take effect on next fetch.
				</p>
				<p><strong>Green badge</strong> = Cached data<br /><strong>Blue badge</strong> = Fresh from API</p>
			</div>
		</aside>
	</div>
</div>

<style>
	.api-tester {
		min-height: 100vh;
		background: #0a0a0a;
		color: #e5e5e5;
	}

	header {
		padding: 2rem;
		border-bottom: 1px solid #333;
		background: #111;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		color: #fff;
	}

	header p {
		margin: 0.5rem 0 0 0;
		color: #888;
	}

	.content {
		display: grid;
		grid-template-columns: 300px 1fr 320px;
		gap: 1px;
		background: #222;
		min-height: calc(100vh - 120px);
	}

	.sidebar {
		background: #1a1a1a;
		padding: 1.5rem;
		overflow-y: auto;
	}

	.main-column {
		background: #1a1a1a;
		padding: 2rem;
		overflow-y: auto;
	}

	section {
		margin-bottom: 1.5rem;
	}

	h3 {
		font-size: 0.875rem;
		text-transform: uppercase;
		color: #888;
		margin: 0 0 1rem 0;
		letter-spacing: 0.05em;
	}

	h4 {
		font-size: 1rem;
		color: #ccc;
		margin: 0 0 0.75rem 0;
	}

	.provider-grid {
		display: grid;
		gap: 0.5rem;
	}

	.provider-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: #222;
		border: 1px solid #333;
		border-radius: 6px;
		color: #e5e5e5;
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
	}

	.provider-btn:hover:not(.disabled) {
		background: #2a2a2a;
		border-color: #444;
	}

	.provider-btn.active {
		background: #1e40af;
		border-color: #3b82f6;
	}

	.provider-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.provider-btn .icon {
		font-size: 1.5rem;
	}

	.provider-btn .name {
		flex: 1;
		text-align: left;
		font-weight: 500;
	}

	.provider-btn .badge {
		font-size: 0.625rem;
		padding: 0.125rem 0.375rem;
		background: #333;
		border-radius: 3px;
		color: #888;
	}

	.series-select {
		width: 100%;
		padding: 0.625rem;
		background: #222;
		border: 1px solid #333;
		border-radius: 6px;
		color: #e5e5e5;
		font-size: 0.875rem;
	}

	.fetch-btn {
		width: 100%;
		padding: 0.875rem;
		background: #10b981;
		border: none;
		border-radius: 6px;
		color: white;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.fetch-btn:hover:not(:disabled) {
		background: #059669;
	}

	.fetch-btn:disabled {
		background: #333;
		cursor: not-allowed;
	}

	.cache-tools {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.secondary-btn,
	.danger-btn {
		padding: 0.625rem;
		border: 1px solid #333;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.secondary-btn {
		background: #222;
		color: #e5e5e5;
	}

	.secondary-btn:hover {
		background: #2a2a2a;
	}

	.danger-btn {
		background: #7f1d1d;
		color: #fca5a5;
		border-color: #991b1b;
	}

	.danger-btn:hover {
		background: #991b1b;
	}

	label {
		display: block;
	}

	label span {
		display: block;
		font-size: 0.875rem;
		color: #888;
		margin-bottom: 0.5rem;
	}

	input,
	select {
		width: 100%;
		padding: 0.625rem;
		background: #222;
		border: 1px solid #333;
		border-radius: 6px;
		color: #e5e5e5;
		font-size: 0.875rem;
	}

	.status-box {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		border: 2px dashed #333;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
	}

	.status-box.error {
		border-color: #dc2626;
		background: #7f1d1d22;
	}

	.status-box.loading {
		border-color: #3b82f6;
		background: #1e40af22;
	}

	.results {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid #333;
	}

	.meta {
		display: flex;
		gap: 0.5rem;
	}

	.badge {
		padding: 0.25rem 0.625rem;
		background: #333;
		border-radius: 4px;
		font-size: 0.75rem;
		color: #888;
	}

	.data-preview table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.data-preview th,
	.data-preview td {
		padding: 0.625rem;
		text-align: left;
		border-bottom: 1px solid #333;
	}

	.data-preview th {
		background: #222;
		font-weight: 600;
		color: #888;
		text-transform: uppercase;
		font-size: 0.75rem;
	}

	.data-stats dl {
		display: grid;
		grid-template-columns: 140px 1fr;
		gap: 0.75rem;
		font-size: 0.875rem;
	}

	.data-stats dt {
		color: #888;
	}

	.data-stats dd {
		margin: 0;
		color: #e5e5e5;
		font-family: monospace;
	}

	.cache-view {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.cache-summary {
		color: #888;
		font-size: 0.875rem;
	}

	.cache-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.cache-entry {
		padding: 1rem;
		background: #222;
		border: 1px solid #333;
		border-radius: 6px;
	}

	.cache-entry-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.cache-entry-meta {
		font-size: 0.75rem;
		color: #888;
	}

	.info-box {
		margin-top: 2rem;
		padding: 1rem;
		background: #222;
		border: 1px solid #333;
		border-radius: 6px;
	}

	.info-box h4 {
		margin-top: 0;
		font-size: 0.875rem;
	}

	.info-box p {
		font-size: 0.8125rem;
		color: #888;
		margin: 0.5rem 0;
		line-height: 1.5;
	}

	@media (max-width: 1200px) {
		.content {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr auto;
		}
	}
</style>
