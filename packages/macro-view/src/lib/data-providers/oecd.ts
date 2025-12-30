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

// OECD SDMX JSON 2.0 response format
interface OECDTimePeriod {
	id: string;
	start?: string;
	end?: string;
}

interface OECDDimension {
	id: string;
	values: OECDTimePeriod[];
}

interface OECDSeries {
	attributes?: unknown[];
	annotations?: unknown[];
	observations?: Record<string, [number, ...unknown[]]>;
}

interface OECDProxyResponse {
	dataSets?: Array<{
		series?: Record<string, OECDSeries>;
		observations?: Record<string, (number | null)[]>;
	}>;
	structures?: Array<{
		dimensions?: {
			series?: OECDDimension[];
			observation?: OECDDimension[];
		};
	}>;
	// Legacy format support
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
	 * Transform OECD SDMX JSON 2.0 response to DataPoint[]
	 * New format has structures[0].dimensions.observation for time periods
	 * and dataSets[0].series with observations keyed by time index
	 */
	protected transformResponse(json: unknown, _config: OECDDataSourceConfig): DataPoint[] {
		const response = json as OECDProxyResponse;

		if (!response.dataSets?.length) {
			throw new Error('Invalid OECD response: no dataSets');
		}

		const dataset = response.dataSets[0];
		
		// Get time dimension from structures (new format) or structure (legacy)
		const structure = response.structures?.[0] || response.structure;
		const timeDimension = structure?.dimensions?.observation?.find(
			(d) => d.id === 'TIME_PERIOD' || d.id === 'TIME'
		);

		if (!timeDimension?.values?.length) {
			throw new Error('No time dimension found in OECD response');
		}

		const points: DataPoint[] = [];

		// New format: series with observations
		if (dataset.series) {
			// Find the CLI series (MEASURE=LI, ADJUSTMENT=AA for amplitude adjusted)
			// Series key format: REF_AREA:FREQ:MEASURE:UNIT_MEASURE:ACTIVITY:ADJUSTMENT:TRANSFORMATION:TIME_HORIZ:METHODOLOGY
			// We want LI (index 1 in MEASURE) and AA (index 1 in ADJUSTMENT)
			for (const [_seriesKey, series] of Object.entries(dataset.series)) {
				if (!series.observations) continue;
				
				for (const [timeIndex, obsValues] of Object.entries(series.observations)) {
					const idx = parseInt(timeIndex);
					const timePeriod = timeDimension.values[idx];
					const value = obsValues[0];

					if (timePeriod && typeof value === 'number') {
						const time = this.parseTimePeriod(timePeriod.id);
						if (time) {
							points.push({ time, value });
						}
					}
				}
			}
		}
		// Legacy format: flat observations
		else if (dataset.observations) {
			for (const [key, values] of Object.entries(dataset.observations)) {
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
		}

		// Deduplicate by time (keep first occurrence)
		const seen = new Set<number>();
		const uniquePoints = points.filter((p) => {
			if (seen.has(p.time)) return false;
			seen.add(p.time);
			return true;
		});

		return uniquePoints.sort((a, b) => a.time - b.time);
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
