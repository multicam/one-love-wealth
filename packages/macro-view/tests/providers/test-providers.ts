/**
 * Provider Test Suite
 * Run with: npx tsx tests/providers/test-providers.ts
 * 
 * Tests each data provider individually to verify:
 * 1. Proxy route exists and responds
 * 2. Response format is correct
 * 3. Data transformation works
 * 
 * Note: Some providers may fail due to:
 * - Missing API keys (FRED, Alpha Vantage, BLS)
 * - Rate limits (Alpha Vantage: 5/min, CoinGecko: 10-30/min)
 * - Network issues
 */

const BASE_URL = 'http://localhost:6003';

interface TestResult {
	provider: string;
	success: boolean;
	dataPoints?: number;
	error?: string;
	duration?: number;
}

async function testProvider(
	name: string,
	url: string,
	validateResponse: (data: unknown) => boolean
): Promise<TestResult> {
	const start = Date.now();
	try {
		const response = await fetch(`${BASE_URL}${url}`);
		const duration = Date.now() - start;

		if (!response.ok) {
			const text = await response.text();
			return {
				provider: name,
				success: false,
				error: `HTTP ${response.status}: ${text.slice(0, 200)}`,
				duration,
			};
		}

		const data = await response.json();
		const isValid = validateResponse(data);

		if (!isValid) {
			return {
				provider: name,
				success: false,
				error: 'Invalid response format',
				duration,
			};
		}

		// Count data points if array
		let dataPoints = 0;
		if (Array.isArray(data)) {
			dataPoints = data.length;
		} else if (data?.observations) {
			dataPoints = data.observations.length;
		} else if (data?.dataSets?.[0]?.observations) {
			dataPoints = Object.keys(data.dataSets[0].observations).length;
		} else if (data?.prices) {
			dataPoints = data.prices.length;
		}

		return {
			provider: name,
			success: true,
			dataPoints,
			duration,
		};
	} catch (err: any) {
		return {
			provider: name,
			success: false,
			error: err.message,
			duration: Date.now() - start,
		};
	}
}

// Provider test configurations
const tests = [
	{
		name: 'FRED',
		url: '/api/proxy/fred?series_id=GDP',
		validate: (data: any) => data?.observations && Array.isArray(data.observations),
	},
	{
		name: 'Yahoo',
		url: '/api/proxy/yahoo?symbol=AAPL&start=2024-01-01',
		validate: (data: any) => Array.isArray(data) && data.length > 0,
	},
	{
		name: 'CoinGecko',
		url: '/api/proxy/coingecko?coin_id=bitcoin&vs_currency=usd&days=30',
		validate: (data: any) => data?.prices && Array.isArray(data.prices),
	},
	{
		name: 'WorldBank',
		url: '/api/proxy/worldbank?indicator=NY.GDP.MKTP.CD&country=USA',
		validate: (data: any) => Array.isArray(data) && data.length >= 2,
	},
	{
		name: 'Treasury',
		url: '/api/proxy/treasury?dataset=avg_interest_rates',
		validate: (data: any) => data?.data && Array.isArray(data.data),
	},
	{
		name: 'BLS',
		url: '/api/proxy/bls?seriesId=LNS14000000&startYear=2023&endYear=2024',
		validate: (data: any) => data?.Results?.series?.[0]?.data,
	},
	{
		name: 'Alpha Vantage',
		url: '/api/proxy/alphavantage?function=TIME_SERIES_DAILY&symbol=IBM',
		// Alpha Vantage returns rate limit message as "Note" or error as "Error Message"
		validate: (data: any) => {
			if (data?.Note) return false; // Rate limited
			if (data?.['Error Message']) return false;
			// Check for time series data
			return data?.['Time Series (Daily)'] || data?.['Meta Data'];
		},
	},
	{
		name: 'OECD (CLI)',
		url: '/api/proxy/oecd?dataset=CLI&location=USA&frequency=M&start=2020-01',
		validate: (data: any) => data?.dataSets && (data?.structures || data?.structure),
	},
	{
		name: 'IMF',
		url: '/api/proxy/imf?indicator=NGDP_RPCH&country=USA',
		validate: (data: any) => data?.values?.NGDP_RPCH !== undefined,
	},
	{
		name: 'Quandl (requires API key)',
		url: '/api/proxy/quandl?database=FRED&dataset=GDP',
		validate: (data: any) => data?.dataset?.data || data?.dataset_data?.data,
	},
	{
		name: 'Hyperliquid',
		url: '/api/proxy/hyperliquid?coin=BTC&dataType=candles&interval=1d',
		validate: (data: any) => Array.isArray(data),
	},
];

async function runTests() {
	console.log('='.repeat(60));
	console.log('Provider Test Suite');
	console.log('='.repeat(60));
	console.log(`Testing against: ${BASE_URL}`);
	console.log('');

	const results: TestResult[] = [];

	for (const test of tests) {
		process.stdout.write(`Testing ${test.name}... `);
		const result = await testProvider(test.name, test.url, test.validate);
		results.push(result);

		if (result.success) {
			console.log(`✅ OK (${result.dataPoints} points, ${result.duration}ms)`);
		} else {
			console.log(`❌ FAILED`);
			console.log(`   Error: ${result.error}`);
		}

		// Rate limit protection - wait between requests
		await new Promise((r) => setTimeout(r, 500));
	}

	console.log('');
	console.log('='.repeat(60));
	console.log('Summary');
	console.log('='.repeat(60));

	const passed = results.filter((r) => r.success).length;
	const failed = results.filter((r) => !r.success).length;

	console.log(`Passed: ${passed}/${results.length}`);
	console.log(`Failed: ${failed}/${results.length}`);

	if (failed > 0) {
		console.log('');
		console.log('Failed providers:');
		results
			.filter((r) => !r.success)
			.forEach((r) => {
				console.log(`  - ${r.provider}: ${r.error}`);
			});
	}

	console.log('');
	console.log('Notes:');
	console.log('  - FRED requires FRED_API_KEY environment variable');
	console.log('  - BLS requires BLS_API_KEY for v2 API features');
	console.log('  - Alpha Vantage has 5 requests/minute limit (free tier)');
	console.log('  - CoinGecko has 10-30 requests/minute limit');
	console.log('  - Quandl requires QUANDL_API_KEY for some datasets');
}

runTests().catch(console.error);
