import type { LegacyGraphDefinition, EnhancedGraphDefinition } from '../types/graph-definition';
import type { DataSourceConfig } from '../types/data-provider';

/**
 * Convert legacy graph definition to enhanced format
 */
export function convertToEnhanced(legacy: LegacyGraphDefinition): EnhancedGraphDefinition {
  const dataSources: DataSourceConfig[] = legacy.dataSources.map(ds => {
    if (ds.type === 'fred') {
      return {
        type: 'fred' as const,
        id: ds.id.toLowerCase(),
        name: ds.name,
        seriesId: ds.id,
        display: {
          color: ds.color,
          label: ds.label
        }
      };
    } else {
      return {
        type: 'coingecko' as const,
        id: ds.id.toLowerCase(),
        name: ds.name,
        coinId: ds.id,
        display: {
          color: ds.color,
          label: ds.label
        }
      };
    }
  });

  const enhanced: EnhancedGraphDefinition = {
    id: legacy.id,
    title: legacy.title,
    description: legacy.description,
    dataSources,
    chartConfig: {
      type: 'line',
      yAxisLog: legacy.chartConfig.yAxisLog,
      dualAxis: legacy.chartConfig.dualAxis
    }
  };

  // Convert timeShift to proper time alignment
  if (legacy.chartConfig.timeShift) {
    enhanced.timeAlignment = {
      shifts: [{
        seriesIndex: 1,
        months: legacy.chartConfig.timeShift,
        direction: 'lead'
      }]
    };
  }

  return enhanced;
}

/**
 * Validate that an enhanced graph definition is well-formed
 */
export function validateEnhancedGraph(graph: EnhancedGraphDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!graph.id) errors.push('Missing id');
  if (!graph.title) errors.push('Missing title');
  if (!graph.description) errors.push('Missing description');
  if (!graph.dataSources || graph.dataSources.length === 0) {
    errors.push('Must have at least one data source');
  }
  if (!graph.chartConfig) errors.push('Missing chartConfig');

  // Validate data sources
  graph.dataSources?.forEach((ds, i) => {
    if (!ds.id) errors.push(`Data source ${i}: missing id`);
    if (!ds.name) errors.push(`Data source ${i}: missing name`);
    if (!ds.type) errors.push(`Data source ${i}: missing type`);

    // Type-specific validation
    if (ds.type === 'fred' && !('seriesId' in ds)) {
      errors.push(`Data source ${i}: FRED source missing seriesId`);
    }
    if (ds.type === 'coingecko' && !('coinId' in ds)) {
      errors.push(`Data source ${i}: CoinGecko source missing coinId`);
    }
  });

  // Validate transforms if present
  if (graph.transforms) {
    graph.transforms.forEach((transform, i) => {
      if (!transform.operation) {
        errors.push(`Transform ${i}: missing operation`);
      }
      if (transform.seriesIndex !== undefined) {
        if (transform.seriesIndex < 0 || transform.seriesIndex >= (graph.dataSources?.length || 0)) {
          errors.push(`Transform ${i}: seriesIndex ${transform.seriesIndex} out of bounds`);
        }
      }
    });
  }

  // Validate time alignment if present
  if (graph.timeAlignment?.shifts) {
    graph.timeAlignment.shifts.forEach((shift, i) => {
      if (shift.seriesIndex === undefined) {
        errors.push(`Time shift ${i}: missing seriesIndex`);
      }
      if (shift.seriesIndex !== undefined && (shift.seriesIndex < 0 || shift.seriesIndex >= (graph.dataSources?.length || 0))) {
        errors.push(`Time shift ${i}: seriesIndex ${shift.seriesIndex} out of bounds`);
      }
      if (shift.months === undefined) {
        errors.push(`Time shift ${i}: missing months`);
      }
      if (!shift.direction || (shift.direction !== 'lead' && shift.direction !== 'lag')) {
        errors.push(`Time shift ${i}: direction must be 'lead' or 'lag'`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a graph definition is legacy or enhanced format
 */
export function isLegacyGraph(graph: any): graph is LegacyGraphDefinition {
  return (
    graph &&
    graph.dataSources &&
    Array.isArray(graph.dataSources) &&
    graph.dataSources.length > 0 &&
    graph.dataSources[0].id !== undefined &&
    graph.dataSources[0].type !== undefined &&
    !('seriesId' in graph.dataSources[0]) && // Enhanced graphs have seriesId at top level
    !('coinId' in graph.dataSources[0])      // Enhanced graphs have coinId at top level
  );
}
