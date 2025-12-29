import type { DataPoint } from './data-point';
export interface DataSeries {
    id: string;
    source: string;
    lastUpdated: number;
    data: DataPoint[];
    meta?: Record<string, unknown>;
}
export interface FetchResult {
    series: DataSeries;
    fromCache: boolean;
    fromStaleCache?: boolean;
    isMock?: boolean;
    fetchDuration?: number;
}
//# sourceMappingURL=series.d.ts.map