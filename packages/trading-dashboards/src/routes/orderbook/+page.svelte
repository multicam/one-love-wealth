<div class="orderbook-dashboard">
	<div class="dashboard-header">
		<h1 class="dashboard-title">Order Book Dashboard</h1>
		<p class="dashboard-subtitle">Real-time order book visualization (Coming Soon)</p>
	</div>

	<div class="coming-soon">
		<div class="icon">📊</div>
		<h2>Order Book Dashboard</h2>
		<p>Multi-exchange order book aggregation with real-time WebSocket streaming</p>

		<div class="features-list">
			<h3>Features:</h3>
			<ul>
				<li>✓ Kraken, Coinbase, Bitstamp integration</li>
				<li>✓ Price level clustering (0.15% precision)</li>
				<li>✓ Depth charts with cumulative volume</li>
				<li>✓ TradingView Lightweight Charts</li>
				<li>✓ Technical indicators (EMA, BB, etc.)</li>
				<li>✓ Order flow analytics</li>
				<li>✓ Real-time price streaming</li>
			</ul>
		</div>

		<div class="status">
			<strong>Status:</strong> In development - core algorithms preserved from original codebase
		</div>
	</div>
</div>

<style>
	.orderbook-dashboard {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--spacing-xl);
	}

	.dashboard-header {
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid var(--border-color);
	}

	.dashboard-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		margin-bottom: var(--spacing-xs);
	}

	.dashboard-subtitle {
		font-size: 1rem;
		color: var(--text-secondary);
		margin: 0;
	}

	.coming-soon {
		text-align: center;
		padding: var(--spacing-xl) * 3;
	}

	.icon {
		font-size: 5rem;
		margin-bottom: var(--spacing-lg);
	}

	.coming-soon h2 {
		font-size: 2rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--spacing-md);
	}

	.coming-soon p {
		font-size: 1.125rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-xl);
	}

	.features-list {
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		max-width: 600px;
		margin: 0 auto var(--spacing-xl);
		text-align: left;
	}

	.features-list h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 var(--spacing-md) 0;
	}

	.features-list ul {
		list-style: none;
		padding: 0;
	}

	.features-list li {
		padding: var(--spacing-sm) 0;
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.status {
		color: var(--text-muted);
		font-size: 0.875rem;
	}
</style>
