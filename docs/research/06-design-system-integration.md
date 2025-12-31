# Design System Integration
## Comprehensive Research Report (2024-2025)

**Research Date:** December 31, 2025
**Focus Areas:** Token-Based Theming, Component Documentation, Figma-to-Code Workflows

---

## Executive Summary

The design system landscape has matured significantly with the W3C Design Tokens specification reaching its first stable version in October 2025. Recharts powers most solutions, shadcn/ui and Tremor lead the component space.

---

## 1. Token-Based Theming

### CSS light-dark() Function (2024 Breakthrough)

Native dark mode without JavaScript:

```css
:root {
  --chart-background: light-dark(#ffffff, #0a0a0a);
  --chart-grid: light-dark(#e5e5e5, #333333);
  --chart-positive: light-dark(#10b981, #34d399);
  --chart-negative: light-dark(#ef4444, #f87171);
}
```

### Three-Layer Token Strategy

1. **Reference Tokens**: Direct values (`color.scale.green.500`)
2. **System Tokens**: Semantic meaning (`color.background.primary`)
3. **Component Tokens**: Context-specific (`chart.line.positive`)

### W3C Design Tokens Specification (October 2025)

First stable version providing:
- Production-ready specification
- Standardized theming support
- Modern color spaces (P3, Rec2020)
- Cross-tool interoperability

```json
{
  "chart": {
    "color": {
      "positive": {
        "$type": "color",
        "$value": "{color.success.500}"
      }
    }
  }
}
```

---

## 2. Component Documentation with Storybook

### Storybook 8.0 (2024) Features

- 2-4x faster test builds
- 25-50% faster React docgen
- Auto-generated documentation pages
- MDX support for interactive docs
- Built-in accessibility checks

### Documentation Pattern

```typescript
// Chart.stories.tsx
export default {
  title: 'Charts/LineChart',
  component: LineChart,
  parameters: {
    docs: {
      description: {
        component: 'Financial line chart with time-series support'
      }
    }
  },
  argTypes: {
    data: { control: 'object' },
    theme: { control: 'select', options: ['light', 'dark'] },
    showGrid: { control: 'boolean' }
  }
}
```

### Resources

- [React Financial Charts Showcase](https://storybook.js.org/showcase/react-financial-charts)
- [Future of Storybook 2024](https://storybook.js.org/blog/future-of-storybook-2024/)

---

## 3. Figma-to-Code Workflows

### Essential Tools

**Design Tokens Plugin**
- Exports styles to Style Dictionary-compatible JSON
- GitHub sync capabilities

**Tokens Studio for Figma**
- No-code token management
- Multi-theme support
- External repository sync

**Style Dictionary**
- Industry-standard token transformation
- Platform-specific output (CSS, Swift, Kotlin)

### Modern Workflow (2025)

1. **Design**: Create tokens in Figma using Tokens Studio
2. **Export**: Push JSON to GitHub repository
3. **Transform**: Style Dictionary with `@tokens-studio/sd-transforms`
4. **Output**: CSS variables, SCSS, JS constants

```javascript
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      buildPath: 'dist/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    }
  }
}
```

---

## 4. shadcn/ui & Radix Integration

### Foundation Stack

- **Radix UI**: Unstyled, accessible primitives
- **shadcn/ui**: Pre-styled Radix components
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Chart rendering engine

### Financial Dashboard Implementation

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"

export function FinancialChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## 5. Tremor - Tailwind Chart Components

### Features (2024-2025)

- 35+ open-source dashboard components
- Built on React, Tailwind CSS, Radix UI
- Uses Recharts internally
- Version 3.18.7 (January 2025)

```typescript
import { Card, LineChart } from "@tremor/react"

export function TremorChart({ data }) {
  return (
    <Card>
      <LineChart
        data={data}
        index="date"
        categories={["revenue", "expenses"]}
        colors={["emerald", "red"]}
        valueFormatter={(v) => `$${v.toLocaleString()}`}
      />
    </Card>
  )
}
```

---

## 6. Recommended Stack

```
Design Layer:     Figma + Tokens Studio
Token Pipeline:   Style Dictionary
UI Framework:     shadcn/ui + Radix UI
Styling:          Tailwind CSS
Charts:           Tremor (or shadcn/ui charts)
Documentation:    Storybook
Type Safety:      TypeScript + React
Theming:          CSS Custom Properties + light-dark()
Standards:        W3C Design Tokens 2025.10
```

---

## 7. Production Design Systems

### Stripe Design System

- Vibrant mesh gradients
- Dynamic motion graphics
- Interactive elements
- 21% revenue growth in 2024

### Plaid Design System

- API-first design approach
- 12,000+ financial institution integrations
- 500M+ connected accounts

---

## Key Takeaways

1. **Theming Standard**: CSS custom properties with `light-dark()` is 2025 standard
2. **Chart Library**: Recharts dominates (used by shadcn/ui, Tremor)
3. **Token Pipeline**: Figma → Tokens Studio → Style Dictionary → CSS Variables
4. **UI Framework**: shadcn/ui + Radix + Tailwind is leading combination
5. **Documentation**: Storybook with TypeScript prop definitions is industry standard
6. **Standards**: W3C Design Tokens spec provides vendor-neutral foundation

---

## Sources

- [W3C Design Tokens Specification](https://www.w3.org/community/design-tokens/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tremor](https://www.tremor.so/)
- [Tokens Studio](https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Storybook](https://storybook.js.org/)
- [CSS light-dark()](https://12daysofweb.dev/2024/css-light-dark/)
