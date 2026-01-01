# SplendidLabz Integration Guide

This document describes the integration of [SplendidLabz](https://splendidlabz.com/) libraries into the one-love-wealth monorepo.

## Packages Installed

| Package | Version | Location |
|---------|---------|----------|
| `@splendidlabz/utils` | 1.11.2 | `shared-ui`, `crypto-viz` |
| `@splendidlabz/styles` | 4.6.4 | `shared-ui`, `macro-view` |

## Available Utilities

### DOM Observers (from `@one-love-wealth/shared-ui`)

```ts
import { resizeObserver, intersectionObserver, mutationObserver } from '@one-love-wealth/shared-ui';
```

#### resizeObserver
Simplified wrapper for ResizeObserver API.

```ts
const obs = resizeObserver(element, {
  callback: ({ entry }) => {
    console.log('New size:', entry.contentRect);
  }
});

// Cleanup
obs.disconnect();
```

#### intersectionObserver
Simplified wrapper for IntersectionObserver API.

```ts
const obs = intersectionObserver(element, {
  rootMargin: '100px',
  threshold: 0.1,
  callback: ({ entry }) => {
    if (entry.isIntersecting) {
      console.log('Element is visible');
    }
  }
});

// Cleanup
obs.destroy();
```

### Components

#### LazyLoad
Intersection-based lazy loading wrapper component.

```svelte
<script>
  import { LazyLoad } from '@one-love-wealth/shared-ui';
</script>

<LazyLoad class="min-h-[300px]" rootMargin="100px" threshold={0.1}>
  <ExpensiveComponent />
</LazyLoad>
```

Props:
- `rootMargin` - Pre-load distance (default: `'100px'`)
- `threshold` - Visibility threshold (default: `0.1`)
- `placeholder` - Optional snippet for loading state
- `class` - CSS classes for the wrapper

## CSS Layout Utilities

Import in your CSS file:
```css
@import '@splendidlabz/styles/layouts';
```

### Shell Layouts

#### shell-grid
Full-page grid layout with header, sidebar, and content areas.

```svelte
<div class="shell-grid" style="--lsb-width: 16rem;">
  <header class="header">...</header>
  <aside class="left-sidebar">...</aside>
  <main class="content">...</main>
</div>
```

CSS Variables:
- `--lsb-width` - Left sidebar width
- `--rsb-width` - Right sidebar width
- `--content-width` - Content area width
- `--gap` - Gap between grid items

### Micro Layouts

#### vertical
Flex column layout with configurable gap.

```svelte
<div class="vertical" style="--gap: 2rem;">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

#### horizontal
Flex row layout with configurable gap.

```svelte
<div class="horizontal items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>
```

#### flow
Flex wrap layout for flowing content.

```svelte
<div class="flow" style="--gap: 1rem;">
  <div>Tag 1</div>
  <div>Tag 2</div>
  <div>Tag 3</div>
</div>
```

### Position Utilities

- `pos-overlay` - Absolute positioned overlay
- `pos-fixed` - Fixed positioning
- `pos-sticky` - Sticky positioning

## Usage Examples

### Chart with ResizeObserver

```svelte
<script>
  import { resizeObserver } from '@splendidlabz/utils/dom';
  
  let container;
  let resizeObs = null;
  
  $effect(() => {
    if (container) {
      resizeObs = resizeObserver(container, {
        callback: () => {
          chart.applyOptions({ width: container.clientWidth });
        }
      });
    }
    return () => resizeObs?.disconnect();
  });
</script>

<div bind:this={container}>
  <!-- Chart content -->
</div>
```

### Page Layout with Micro Layouts

```svelte
<div class="vertical" style="--gap: 2rem;">
  <div class="horizontal items-center justify-between">
    <div class="vertical" style="--gap: 0.5rem;">
      <h1>Page Title</h1>
      <p>Description</p>
    </div>
    <div>Actions</div>
  </div>
  
  <div class="grid grid-cols-3 gap-8">
    <LazyLoad>
      <Card />
    </LazyLoad>
  </div>
</div>
```

## Migration Notes

### Replacing Native ResizeObserver

Before:
```ts
let resizeObserver = new ResizeObserver(() => { ... });
resizeObserver.observe(element);
// cleanup: resizeObserver.disconnect();
```

After:
```ts
import { resizeObserver } from '@splendidlabz/utils/dom';

let resizeObs = resizeObserver(element, {
  callback: () => { ... }
});
// cleanup: resizeObs.disconnect();
```

### Replacing space-y-* with vertical

Before:
```svelte
<div class="space-y-8">
```

After:
```svelte
<div class="vertical" style="--gap: 2rem;">
```

### Replacing flex with horizontal

Before:
```svelte
<div class="flex items-center justify-between">
```

After:
```svelte
<div class="horizontal items-center justify-between">
```

## Files Modified

### crypto-viz
- `src/lib/components/charts/CandlestickChart.svelte`
- `src/lib/components/charts/IndicatorChart.svelte`
- `src/lib/components/charts/KalmanChart.svelte`

### macro-view
- `src/routes/layout.css`
- `src/routes/+layout.svelte`
- `src/routes/+page.svelte`
- `src/routes/graphs/+page.svelte`
- `src/routes/explorer/+page.svelte`
- `src/lib/components/layout/Header.svelte`

### shared-ui
- `src/index.ts`
- `src/components/index.ts`
- `src/components/LazyLoad.svelte` (new)
