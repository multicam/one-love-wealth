<div class="landing">
	<div class="hero">
		<h1 class="title">Trading Dashboards</h1>
		<p class="subtitle">Real-time cryptocurrency order book and macro economic indicators</p>

		<div class="dashboard-grid">
			<a href="/orderbook" class="dashboard-card">
				<div class="card-icon">📊</div>
				<h2>Order Book</h2>
				<p>Real-time order book visualization with multi-exchange aggregation</p>
				<ul class="features">
					<li>Kraken, Coinbase, Bitstamp</li>
					<li>Price level clustering</li>
					<li>Depth charts</li>
					<li>Technical indicators</li>
				</ul>
			</a>

			<a href="/macro" class="dashboard-card">
				<div class="card-icon">📈</div>
				<h2>Macro Dashboard</h2>
				<p>Economic indicators and market sentiment tracking</p>
				<ul class="features">
					<li>Fear & Greed Index</li>
					<li>Economic data (PMI, M2, etc)</li>
					<li>VIX & market volatility</li>
					<li>BTC/Gold ratio</li>
				</ul>
			</a>
		</div>
	</div>
</div>

<style>
	.landing {
		min-height: calc(100vh - 80px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
	}

	.hero {
		max-width: 1000px;
		text-align: center;
	}

	.title {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: var(--spacing-md);
		background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-xl);
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-lg);
		margin-top: var(--spacing-xl);
	}

	.dashboard-card {
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		text-align: left;
		transition: all var(--transition-normal);
		cursor: pointer;
	}

	.dashboard-card:hover {
		transform: translateY(-4px);
		border-color: var(--accent-primary);
		box-shadow: var(--shadow-lg);
	}

	.card-icon {
		font-size: 3rem;
		margin-bottom: var(--spacing-md);
	}

	.dashboard-card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: var(--spacing-sm);
		color: var(--text-primary);
	}

	.dashboard-card p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-md);
		line-height: 1.6;
	}

	.features {
		list-style: none;
		padding: 0;
	}

	.features li {
		padding: var(--spacing-xs) 0;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.features li::before {
		content: "✓ ";
		color: var(--green);
		font-weight: bold;
		margin-right: var(--spacing-xs);
	}
</style>
