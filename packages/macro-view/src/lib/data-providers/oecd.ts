import { DataProvider } from './base';
import type { OECDDataSourceConfig } from '../types/providers/oecd';
import type { DataPoint } from '../db';
import {
	OECDProvider as SharedOECDProvider,
	type OECDConfig as SharedOECDConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedOECDProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: OECDDataSourceConfig): SharedOECDConfig {
	return {
		dataset: config.dataset,
		indicator: config.indicator,
		location: config.location,
		frequency: config.frequency,
		startTime: config.startTime,
		endTime: config.endTime,
	};
}

/**
 * Convert shared DataPoint to macro-view DataPoint
 */
function toMacroViewDataPoint(point: SharedDataPoint): DataPoint {
	return {
		time: point.time,
		value: point.value ?? 0,
	};
}

// OECD SDMX response format (after proxy strips outer wrapper)
interface OECDTimePeriod {
	id: string;
}

interface OECDDimension {
	id: string;
	values: OECDTimePeriod[];
}

interface OECDProxyResponse {
	dataSets?: Array<{
		observations?: Record<string, (number | null)[]>;
	}>;
	structure?: {
		dimensions?: {
			observation?: OECDDimension[];
		};
	};
}

/**
 * OECD (Organisation for Economic Co-operation and Development) data provider
 * Development statistics and economic indicators
 */
export class OECDProvider extends DataProvider<OECDDataSourceConfig> {
	readonly name = 'OECD';
	readonly cachePrefix = 'OECD';
	protected defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days (OECD data updates infrequently)

	protected buildUrl(config: OECDDataSourceConfig): string {
		const params = new URLSearchParams();

		params.set('dataset', config.dataset);
		params.set('indicator', config.indicator);
		params.set('location', config.location);

		if (config.frequency) {
			params.set('frequency', config.frequency);
		}

		if (config.startTime) {
			params.set('start', config.startTime);
		}

		if (config.endTime) {
			params.set('end', config.endTime);
		}

		return `/api/proxy/oecd?${params.toString()}`;
	}

	/**
	 * Transform OECD SDMX response to DataPoint[]
	 * The proxy returns { dataSets, structure } after stripping outer wrapper
	 */
	protected transformResponse(json: unknown, _config: OECDDataSourceConfig): DataPoint[] {
		const response = json as OECDProxyResponse;

		if (!response.dataSets || !response.structure) {
			throw new Error('Invalid OECD response format');
		}

		const dataset = response.dataSets[0];
		if (!dataset?.observations) {
			throw new Error('No OECD data found');
		}

		// Find time dimension
		const timeDimension = response.structure.dimensions?.observation?.find(
			(d) => d.id === 'TIME_PERIOD' || d.id === 'TIME'
		);

		if (!timeDimension) {
			throw new Error('No time dimension found in OECD response');
		}

		const points: DataPoint[] = [];
		const observations = dataset.observations;

		for (const [key, values] of Object.entries(observations)) {
			const indices = key.split(':').map(Number);
			const timeIndex = indices[indices.length - 1];
			const timePeriod = timeDimension.values[timeIndex];

			if (timePeriod && values[0] !== null) {
				const time = this.parseTimePeriod(timePeriod.id);
				if (time) {
					points.push({ time, value: values[0] });
				}
			}
		}

		return points.sort((a, b) => a.time - b.time);
	}

	private parseTimePeriod(period: string): number | null {
		try {
			// Handle formats: 2024-Q1, 2024-01, 2024
			let time: number;
			if (period.includes('-Q')) {
				const [year, quarter] = period.split('-Q');
				const month = (parseInt(quarter) - 1) * 3;
				time = new Date(parseInt(year), month, 1).getTime();
			} else if (period.includes('-')) {
				time = new Date(period + '-01').getTime();
			} else {
				time = new Date(parseInt(period), 0, 1).getTime();
			}
			return Number.isFinite(time) ? time : null;
		} catch {
			return null;
		}
	}

	protected generateMockData(config: OECDDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}
