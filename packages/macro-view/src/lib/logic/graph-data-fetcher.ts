import type { EnhancedGraphDefinition } from '../types/graph-definition';
import type { DataPoint } from '../db';
import { dataProviderRegistry } from '../data-providers';
import { applyTransforms } from '../transforms';

/**
 * Graph data with fetched and transformed series
 */
export interface GraphData {
  graphId: string;
  series: Array<{
    name: string;
    label: string;
    color: string;
    data: DataPoint[];
  }>;
  fromCache: boolean[];
}

/**
 * Fetch and transform data for an enhanced graph definition
 *
 * @param graph - Enhanced graph definition
 * @returns Graph data with all series fetched and transformed
 */
export async function fetchGraphData(graph: EnhancedGraphDefinition): Promise<GraphData> {
  // Fetch all data sources in parallel
  const results = await dataProviderRegistry.fetchAll(graph.dataSources);

  // Extract data arrays
  let dataArrays = results.map(r => r.series.data);

  // Apply transforms if any
  if (graph.transforms?.length) {
    dataArrays = applyTransforms(dataArrays, graph.transforms);
  }

  // Apply time alignment if specified
  if (graph.timeAlignment?.shifts) {
    dataArrays = applyTimeShifts(dataArrays, graph.timeAlignment.shifts);
  }

  // Filter by date range if specified
  if (graph.timeAlignment?.dateRange) {
    dataArrays = filterByDateRange(dataArrays, graph.timeAlignment.dateRange);
  }

  // Limit to recent points if specified
  if (graph.timeAlignment?.recentPoints) {
    const limit = graph.timeAlignment.recentPoints;
    dataArrays = dataArrays.map(series => series.slice(-limit));
  }

  return {
    graphId: graph.id,
    series: graph.dataSources.map((ds, i) => ({
      name: ds.name,
      label: ds.display?.label || ds.name,
      color: ds.display?.color || '#3b82f6',
      data: dataArrays[i] || []
    })),
    fromCache: results.map(r => r.fromCache)
  };
}

/**
 * Apply time shifts to series (lead/lag)
 *
 * @param dataArrays - Array of data series
 * @param shifts - Time shift configurations
 * @returns Shifted data arrays
 */
function applyTimeShifts(
  dataArrays: DataPoint[][],
  shifts: NonNullable<EnhancedGraphDefinition['timeAlignment']>['shifts']
): DataPoint[][] {
  if (!shifts) return dataArrays;

  return dataArrays.map((series, i) => {
    const shift = shifts.find(s => s.seriesIndex === i);
    if (!shift) return series;

    // Shift times by specified months
    return series.map(point => {
      const d = new Date(point.time);
      if (shift.direction === 'lead') {
        d.setMonth(d.getMonth() + shift.months);
      } else {
        d.setMonth(d.getMonth() - shift.months);
      }
      return { ...point, time: d.getTime() };
    });
  });
}

/**
 * Filter data arrays by date range
 *
 * @param dataArrays - Array of data series
 * @param dateRange - Date range filter
 * @returns Filtered data arrays
 */
function filterByDateRange(
  dataArrays: DataPoint[][],
  dateRange: { start?: string; end?: string }
): DataPoint[][] {
  const startTime = dateRange.start ? new Date(dateRange.start).getTime() : undefined;
  const endTime = dateRange.end ? new Date(dateRange.end).getTime() : undefined;
  return dataArrays.map(series =>
    series.filter(point => {
      if (startTime && point.time < startTime) return false;
      if (endTime && point.time > endTime) return false;
      return true;
    })
  );
}
