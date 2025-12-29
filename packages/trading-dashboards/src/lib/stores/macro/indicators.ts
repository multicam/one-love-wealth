import { writable, derived } from 'svelte/store';
import { fearGreedAPI } from '$lib/services/api/fearGreedAPI';
import { coinGeckoAPI } from '$lib/services/api/coinGeckoAPI';

// Types
export interface MacroIndicator {
	value: number;
	change: number;
	changePercent: number;
	implication: string;
	status: 'bullish' | 'bearish' | 'neutral';
	history: Array<{ value: number; timestamp: Date }>;
	lastUpdate: Date | null;
}

interface RawIndicatorData {
	current: number;
	history: Array<{ value: number; timestamp: Date }>;
	lastUpdate: Date | null;
}

// Helper function to generate mock historical data
function generateMockHistory(
	currentValue: number,
	days: number = 30,
	volatility: number = 0.05
): Array<{ value: number; timestamp: Date }> {
	const history: Array<{ value: number; timestamp: Date }> = [];
	const now = new Date();

	for (let i = days; i >= 0; i--) {
		const timestamp = new Date(now);
		timestamp.setDate(now.getDate() - i);

		// Generate value with random walk
		const randomChange = (Math.random() - 0.5) * 2 * volatility * currentValue;
		const value = currentValue + randomChange * (i / days); // Trend toward current value

		history.push({ value, timestamp });
	}

	return history;
}

// Raw data stores with mock historical data
const fearGreedData = writable<RawIndicatorData>({
	current: 23,
	history: generateMockHistory(23, 30, 0.2),
	lastUpdate: null
});

const btcPriceData = writable<RawIndicatorData>({
	current: 86709,
	history: generateMockHistory(86709, 30, 0.03),
	lastUpdate: null
});

const sentimentData = writable<RawIndicatorData>({
	current: 53.6,
	history: generateMockHistory(53.6, 30, 0.05),
	lastUpdate: null
});

const manufacturingData = writable<RawIndicatorData>({
	current: 48.2,
	history: generateMockHistory(48.2, 30, 0.03),
	lastUpdate: null
});

const m2Data = writable<RawIndicatorData>({
	current: 4.6,
	history: generateMockHistory(4.6, 30, 0.1),
	lastUpdate: null
});

const sofrData = writable<RawIndicatorData>({
	current: 0.23,
	history: generateMockHistory(0.23, 30, 0.15),
	lastUpdate: null
});

const vixData = writable<RawIndicatorData>({
	current: 17.24,
	history: generateMockHistory(17.24, 30, 0.1),
	lastUpdate: null
});

const btcGoldData = writable<RawIndicatorData>({
	current: 14,
	history: generateMockHistory(14, 30, 0.08),
	lastUpdate: null
});

// Helper functions
function calculateChange(history: Array<{ value: number; timestamp: Date }>): number {
	if (history.length < 2) return 0;
	return history[0].value - history[1].value;
}

function calculateChangePercent(history: Array<{ value: number; timestamp: Date }>): number {
	if (history.length < 2 || history[1].value === 0) return 0;
	return ((history[0].value - history[1].value) / history[1].value) * 100;
}

function getImplication(indicator: string, value: number): string {
	const implications: Record<string, Record<string, string>> = {
		fearGreed: {
			low: 'Extreme fear - potential accumulation zone. Market panic creates opportunities.',
			mid: 'Neutral sentiment - market in balance.',
			high: 'Extreme greed - caution advised. Potential market top forming.'
		},
		btcPrice: {
			low: 'Below key support - watch for further downside.',
			mid: 'Trading in range - consolidation phase.',
			high: 'Near all-time highs - strong bullish momentum.'
		},
		sentiment: {
			low: 'Generational low - extreme pessimism.',
			mid: 'Neutral consumer outlook.',
			high: 'Optimistic consumers - economic strength.'
		},
		manufacturing: {
			low: 'Contraction - PMI below 50 signals recession risk.',
			mid: 'Neutral manufacturing activity.',
			high: 'Expansion - manufacturing sector growing.'
		},
		m2: {
			low: 'Declining money supply - liquidity tightening.',
			mid: 'Stable money supply growth.',
			high: 'Accelerating M2 - liquidity expansion supports risk assets.'
		},
		vix: {
			low: 'Low volatility - complacent market.',
			mid: 'Normal volatility levels.',
			high: 'Elevated fear - market uncertainty.'
		}
	};

	const ranges = {
		fearGreed: [25, 75],
		btcPrice: [80000, 90000],
		sentiment: [50, 60],
		manufacturing: [48, 52],
		m2: [3, 5],
		vix: [15, 20]
	};

	const range = ranges[indicator as keyof typeof ranges] || [0, 100];
	if (value < range[0]) return implications[indicator]?.low || '';
	if (value > range[1]) return implications[indicator]?.high || '';
	return implications[indicator]?.mid || '';
}

function getStatus(indicator: string, value: number): 'bullish' | 'bearish' | 'neutral' {
	// Fear & Greed: low = bearish sentiment but bullish opportunity
	if (indicator === 'fearGreed') {
		return value < 25 ? 'bearish' : value > 75 ? 'bullish' : 'neutral';
	}
	// Manufacturing PMI: below 50 = bearish
	if (indicator === 'manufacturing') {
		return value < 50 ? 'bearish' : value > 52 ? 'bullish' : 'neutral';
	}
	// VIX: high = bearish (fear)
	if (indicator === 'vix') {
		return value > 20 ? 'bearish' : value < 15 ? 'bullish' : 'neutral';
	}
	// Default: higher = better
	return 'neutral';
}

// Derived stores with calculations
export const fearGreed = derived(fearGreedData, ($data): MacroIndicator => ({
	value: $data.current,
	change: calculateChange($data.history),
	changePercent: calculateChangePercent($data.history),
	implication: getImplication('fearGreed', $data.current),
	status: getStatus('fearGreed', $data.current),
	history: $data.history,
	lastUpdate: $data.lastUpdate
}));

export const btcPrice = derived(btcPriceData, ($data): MacroIndicator => ({
	value: $data.current,
	change: calculateChange($data.history),
	changePercent: calculateChangePercent($data.history),
	implication: getImplication('btcPrice', $data.current),
	status: getStatus('btcPrice', $data.current),
	history: $data.history,
	lastUpdate: $data.lastUpdate
}));

export const sentiment = derived(sentimentData, ($data): MacroIndicator => ({
	value: $data.current,
	change: calculateChange($data.history),
	changePercent: calculateChangePercent($data.history),
	implication: getImplication('sentiment', $data.current),
	status: getStatus('sentiment', $data.current),
	history: $data.history,
	lastUpdate: $data.lastUpdate
}));

export const manufacturing = derived(manufacturingData, ($data): MacroIndicator => ({
	value: $data.current,
	change: calculateChange($data.history),
	changePercent: calculateChangePercent($data.history),
	implication: getImplication('manufacturing', $data.current),
	status: getStatus('manufacturing', $data.current),
	history: $data.history,
	lastUpdate: $data.lastUpdate
}));

export const m2Growth = derived(m2Data, ($data): MacroIndicator => ({
	value: $data.current,
	change: calculateChange($data.history),
	changePercent: calculateChangePercent($data.history),
	implication: getImplication('m2', $data.current),
	status: getStatus('m2', $data.current),
	history: $data.history,
	lastUpdate: $data.lastUpdate
}));

export const sofrSpread = derived(sofrData, ($data): MacroIndicator => ({
	value: $data.current,
	change: calculateChange($data.history),
	changePercent: calculateChangePercent($data.history),
	implication: 'SOFR-EFFR spread indicates money market conditions.',
	status: 'neutral',
	history: $data.history,
	lastUpdate: $data.lastUpdate
}));

export const vix = derived(vixData, ($data): MacroIndicator => ({
	value: $data.current,
	change: calculateChange($data.history),
	changePercent: calculateChangePercent($data.history),
	implication: getImplication('vix', $data.current),
	status: getStatus('vix', $data.current),
	history: $data.history,
	lastUpdate: $data.lastUpdate
}));

export const btcGoldRatio = derived(btcGoldData, ($data): MacroIndicator => ({
	value: $data.current,
	change: calculateChange($data.history),
	changePercent: calculateChangePercent($data.history),
	implication: 'BTC/Gold ratio in accumulation zone - digital gold narrative.',
	status: 'neutral',
	history: $data.history,
	lastUpdate: $data.lastUpdate
}));

// Data fetching
export async function fetchMacroData() {
	try {
		// Fetch real-time data from free APIs
		const [fearGreedResult, btcPrice, btcGoldRatio, btcHistory, btcGoldHistory] = await Promise.all([
			fearGreedAPI.getCurrent(),
			coinGeckoAPI.getBTCPrice(),
			coinGeckoAPI.getBTCGoldRatio(),
			coinGeckoAPI.getBTCHistoricalPrices(30),
			coinGeckoAPI.getBTCGoldRatioHistory(30)
		]);

		// Update Fear & Greed Index
		fearGreedData.update((d) => ({
			current: fearGreedResult.value,
			history: [
				{ value: fearGreedResult.value, timestamp: fearGreedResult.timestamp },
				...d.history.slice(0, 29)
			],
			lastUpdate: new Date()
		}));

		// Update BTC Price with real data
		btcPriceData.set({
			current: btcPrice.current,
			history: btcHistory,
			lastUpdate: btcPrice.lastUpdate
		});

		// Update BTC/Gold Ratio with real data
		btcGoldData.set({
			current: btcGoldRatio.current,
			history: btcGoldHistory,
			lastUpdate: btcGoldRatio.lastUpdate
		});

		// Economic indicators still use mock data
		// To integrate real data, sign up for FRED API (free): https://fred.stlouisfed.org/docs/api/api_key.html
		// Then fetch:
		// - Michigan Consumer Sentiment: UMCSENT
		// - ISM Manufacturing PMI: MANEMP (or similar)
		// - M2 Money Supply: M2SL
		// - VIX: Available from CBOE or Yahoo Finance
		// - SOFR: SOFR rate from FRED

		console.log('Macro data fetched successfully');
		console.log('Real data: BTC Price, BTC/Gold Ratio, Fear & Greed Index');
		console.log('Mock data: Economic indicators (need FRED API key for real data)');
	} catch (error) {
		console.error('Failed to fetch macro data:', error);
	}
}

// Last update timestamp
export const lastUpdate = derived(
	[fearGreedData, btcPriceData, sentimentData],
	([$fg, $btc, $sent]) => {
		const dates = [$fg.lastUpdate, $btc.lastUpdate, $sent.lastUpdate].filter(Boolean) as Date[];
		if (dates.length === 0) return null;
		return new Date(Math.max(...dates.map((d) => d.getTime())));
	}
);
