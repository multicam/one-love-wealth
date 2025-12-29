// Fear & Greed Index API
// Free API from alternative.me - no key required
const API_URL = 'https://api.alternative.me/fng/';

export interface FearGreedData {
	value: number;
	classification: string;
	timestamp: Date;
}

export const fearGreedAPI = {
	async getCurrent(): Promise<FearGreedData> {
		try {
			const response = await fetch(`${API_URL}?limit=1`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return {
				value: parseInt(data.data[0].value),
				classification: data.data[0].value_classification,
				timestamp: new Date(parseInt(data.data[0].timestamp) * 1000)
			};
		} catch (error) {
			console.error('Failed to fetch Fear & Greed Index:', error);
			throw error;
		}
	},

	async getHistory(days: number = 30): Promise<FearGreedData[]> {
		try {
			const response = await fetch(`${API_URL}?limit=${days}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data.data.map((d: any) => ({
				value: parseInt(d.value),
				classification: d.value_classification,
				timestamp: new Date(parseInt(d.timestamp) * 1000)
			}));
		} catch (error) {
			console.error('Failed to fetch Fear & Greed history:', error);
			throw error;
		}
	}
};
