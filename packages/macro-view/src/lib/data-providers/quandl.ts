import { DataProvider } from './base';
import type { QuandlDataSourceConfig } from '../types/providers/quandl';
import type { DataPoint } from '../db';
import {
	QuandlProvider as SharedQuandlProvider,
	type QuandlConfig as SharedQuandlConfig,
	MemoryAdapter,
	ProxyRequestAdapter,
	type DataPoint as SharedDataPoint,
} from '@one-love-wealth/data-layer';

// Create shared provider instance for reusing transformation logic
const sharedCache = new MemoryAdapter();
const sharedRequest = new ProxyRequestAdapter('/api/proxy');
const sharedProvider = new SharedQuandlProvider(sharedCache, sharedRequest);

/**
 * Convert macro-view config to shared data-layer config
 */
function toSharedConfig(config: QuandlDataSourceConfig): SharedQuandlConfig {
	return {
		databaseCode: config.databaseCode,
		datasetCode: config.datasetCode,
		column: config.column,
		startDate: config.startDate,
		endDate: config.endDate,
		collapse: config.collapse,
		transform: config.transform,
		rows: config.rows,
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

/**
 * Quandl (Nasdaq Data Link) data provider
 * Alternative economic time series, commodities, and financial data
 */
export class QuandlProvider extends DataProvider<QuandlDataSourceConfig> {
	readonly name = 'Quandl';
	readonly cachePrefix = 'QUANDL';
	protected defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

	protected buildUrl(config: QuandlDataSourceConfig): string {
		const params = new URLSearchParams();

		params.set('database', config.databaseCode);
		params.set('dataset', config.datasetCode);

		if (config.column !== undefined) {
			params.set('column_index', config.column.toString());
		}

		if (config.startDate) {
			params.set('start_date', config.startDate);
		}

		if (config.endDate) {
			params.set('end_date', config.endDate);
		}

		if (config.collapse && config.collapse !== 'none') {
			params.set('collapse', config.collapse);
		}

		if (config.transform && config.transform !== 'none') {
			params.set('transform', config.transform);
		}

		if (config.rows) {
			params.set('rows', config.rows.toString());
		}

		return `/api/proxy/quandl?${params.toString()}`;
	}

	protected transformResponse(json: unknown, config: QuandlDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).transformResponse(json, sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}

	protected generateMockData(config: QuandlDataSourceConfig): DataPoint[] {
		const sharedConfig = toSharedConfig(config);
		const sharedPoints = (sharedProvider as any).generateMockData(sharedConfig) as SharedDataPoint[];
		return sharedPoints.map(toMacroViewDataPoint);
	}
}
