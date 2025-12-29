# @one-love-wealth/shared-ui

Shared UI components for the one-love-wealth monorepo.

## Installation

This package is part of the monorepo and is automatically available to other packages.

```json
{
  "dependencies": {
    "@one-love-wealth/shared-ui": "workspace:*"
  }
}
```

## Components

### Toast

A toast notification component with support for info, success, warning, and error messages.

```svelte
<script>
  import { Toast, toastStore } from '@one-love-wealth/shared-ui';

  function showNotification() {
    toastStore.success('Operation completed!');
    toastStore.error('Something went wrong');
    toastStore.warning('Please check your input');
    toastStore.info('New data available');
  }
</script>

<!-- Add Toast container to your layout -->
<Toast position="bottom-right" />
```

#### Toast Store API

- `toastStore.show(message, type?, duration?)` - Show a toast
- `toastStore.info(message, duration?)` - Show info toast
- `toastStore.success(message, duration?)` - Show success toast
- `toastStore.warning(message, duration?)` - Show warning toast
- `toastStore.error(message, duration?)` - Show error toast
- `toastStore.dismiss(id)` - Dismiss a specific toast
- `toastStore.clear()` - Clear all toasts

### FinancialChart

A Chart.js wrapper optimized for financial data visualization.

```svelte
<script>
  import { FinancialChart } from '@one-love-wealth/shared-ui';

  const labels = ['2024-01', '2024-02', '2024-03'];
  const datasets = [
    {
      label: 'Price',
      data: [100, 120, 115],
      borderColor: '#3b82f6',
      tension: 0.4,
      pointRadius: 0
    }
  ];
</script>

<FinancialChart 
  {labels} 
  {datasets}
  title="Stock Price"
  yAxisLog={false}
  dualAxis={false}
  height="400px"
/>
```

#### FinancialChart Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| labels | string[] | required | X-axis labels |
| datasets | ChartDataset[] | required | Chart.js datasets |
| title | string | '' | Chart title |
| yAxisLog | boolean | false | Use logarithmic Y axis |
| dualAxis | boolean | false | Enable dual Y axes |
| height | string | '100%' | Chart height |
| theme | object | {} | Theme color overrides |

## Development

```bash
# Type check
bun run check

# Watch mode
bun run check:watch
```
