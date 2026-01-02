<script lang="ts">
  import type { WalkForwardWindow } from '$lib/stores/walkforward.svelte';

  interface Props {
    windows: WalkForwardWindow[];
  }

  let { windows }: Props = $props();

  type SortField = 'window' | 'degradation' | 'inSharpe' | 'outSharpe' | 'totalReturn';
  type SortDirection = 'asc' | 'desc';

  let sortField = $state<SortField>('window');
  let sortDirection = $state<SortDirection>('asc');

  // Sorted windows
  const sortedWindows = $derived(() => {
    const sorted = [...windows];

    sorted.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortField) {
        case 'window':
          aVal = a.windowNumber;
          bVal = b.windowNumber;
          break;
        case 'degradation':
          aVal = a.degradationPercent;
          bVal = b.degradationPercent;
          break;
        case 'inSharpe':
          aVal = a.inSampleMetrics.sharpe;
          bVal = b.inSampleMetrics.sharpe;
          break;
        case 'outSharpe':
          aVal = a.outSampleMetrics.sharpe;
          bVal = b.outSampleMetrics.sharpe;
          break;
        case 'totalReturn':
          aVal = a.outSampleMetrics.totalReturn;
          bVal = b.outSampleMetrics.totalReturn;
          break;
        default:
          aVal = a.windowNumber;
          bVal = b.windowNumber;
      }

      if (sortDirection === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });

    return sorted;
  });

  // Handle sort
  function handleSort(field: SortField) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
  }

  // Get degradation color class
  function getDegradationColor(degradation: number): string {
    if (degradation < 10) return 'text-success';
    if (degradation < 20) return 'text-warning';
    return 'text-error';
  }

  // Format percentage
  function formatPercent(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  // Format degradation
  function formatDegradation(value: number): string {
    return `${value.toFixed(1)}%`;
  }
</script>

<div class="w-full">
  <h3 class="text-lg font-semibold mb-3 text-text-primary">Per-Window Results</h3>

  <div class="overflow-x-auto">
    <table class="min-w-full border-collapse">
      <thead>
        <tr class="border-b border-border">
          <th
            class="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-hover"
            onclick={() => handleSort('window')}
          >
            Window
            {#if sortField === 'window'}
              <span class="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </th>
          <th class="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
            Dates
          </th>
          <th
            class="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-hover"
            onclick={() => handleSort('inSharpe')}
          >
            In-Sample Sharpe
            {#if sortField === 'inSharpe'}
              <span class="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </th>
          <th
            class="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-hover"
            onclick={() => handleSort('outSharpe')}
          >
            Out-Sample Sharpe
            {#if sortField === 'outSharpe'}
              <span class="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </th>
          <th
            class="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-hover"
            onclick={() => handleSort('degradation')}
          >
            Degradation
            {#if sortField === 'degradation'}
              <span class="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </th>
          <th
            class="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-hover"
            onclick={() => handleSort('totalReturn')}
          >
            Out-Sample Return
            {#if sortField === 'totalReturn'}
              <span class="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each sortedWindows() as window}
          <tr class="border-b border-border hover:bg-surface-hover transition-colors">
            <td class="px-4 py-3 text-sm text-text-primary font-medium">
              {window.windowNumber}
            </td>
            <td class="px-4 py-3 text-xs text-text-secondary">
              <div>{window.inSampleStart} to {window.inSampleEnd}</div>
              <div class="text-text-tertiary">{window.outSampleStart} to {window.outSampleEnd}</div>
            </td>
            <td class="px-4 py-3 text-sm text-right text-text-primary">
              {window.inSampleMetrics.sharpe.toFixed(2)}
            </td>
            <td class="px-4 py-3 text-sm text-right text-text-primary">
              {window.outSampleMetrics.sharpe.toFixed(2)}
            </td>
            <td class="px-4 py-3 text-sm text-right font-semibold {getDegradationColor(window.degradationPercent)}">
              {formatDegradation(window.degradationPercent)}
            </td>
            <td class="px-4 py-3 text-sm text-right text-text-primary">
              {formatPercent(window.outSampleMetrics.totalReturn)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if windows.length === 0}
    <div class="py-12 text-center">
      <p class="text-sm text-text-secondary">No window results to display</p>
    </div>
  {/if}
</div>
