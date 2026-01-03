# One Love Wealth - Development Guide

## Project Structure

This is a monorepo workspace with the following packages:
- `backtesting` - Backtesting engine
- `backtesting-ui` - SvelteKit UI for backtesting
- `crypto-viz` - Cryptocurrency visualization dashboard
- `data-layer` - Shared data access layer
- `macro-view` - Macro economics visualization
- `shared-ui` - Shared UI components
- `trading-dashboards` - Trading analytics dashboards

## Bun Usage

Default to using Bun instead of Node.js:

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun install` instead of `npm install`
- Use `bun run <script>` instead of `npm run <script>`
- Use `bunx <package>` instead of `npx <package>`
- Bun automatically loads .env files

## Tech Stack

- **Frontend**: SvelteKit 2.x with Svelte 5.x
- **Build Tool**: Vite 6.x/7.x
- **Styling**: Tailwind CSS 4.x with `@tailwindcss/vite`
- **Charts**: lightweight-charts, d3, chart.js
- **Testing**: Vitest for unit tests, Playwright for E2E
- **Database**: Dexie (IndexedDB wrapper)
- **Package Manager**: Bun with workspaces

## Development Commands

### Root Level
- `bun install` - Install all dependencies
- `bun run test:e2e` - Run all E2E tests
- `bun run test:e2e:crypto-viz` - Run crypto-viz E2E tests
- `bun run test:e2e:macro-view` - Run macro-view E2E tests
- `bun run test:e2e:trading-dashboards` - Run trading-dashboards E2E tests
- `bun run playwright:install` - Install Playwright browsers

### Package Level (in packages/*)
- `bun run dev` - Start dev server (ports defined in workspace.config.ts)
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run test` - Run unit tests with Vitest
- `bun run test:e2e` - Run E2E tests for package

### Data Layer Specific
- `bun run populate-db` - Populate database
- `bun run build` - Build TypeScript to dist/
- `bun run dev` - Watch mode for TypeScript
- `bun run test:provider` - Test data provider

## Workspace Configuration

Dev server ports are centralized in `workspace.config.ts`:
- backtesting-ui: 6036 (dev), 6136 (preview)
- crypto-viz: 6006 (dev), 6106 (preview)
- macro-view: 6003 (dev), 6103 (preview)
- trading-dashboards: 6009 (dev), 6109 (preview)

## Testing Strategy

- **Unit tests**: Use Vitest with `bun test` or `vitest`
- **E2E tests**: Use Playwright from root or package level
- **Browser tests**: macro-view uses `@vitest/browser-playwright`

## Frontend Development

### SvelteKit Structure
All UI packages use SvelteKit with:
- `src/routes/` - Page routes
- `src/lib/` - Reusable components and utilities
- `src/app.html` - HTML template
- `vite.config.js` - Vite configuration
- `svelte.config.js` - SvelteKit configuration

### Shared Dependencies
Packages reference each other using workspace protocol:
```json
"@one-love-wealth/shared-ui": "workspace:*"
"@one-love-wealth/data-layer": "workspace:*"
```

### Vite Configuration Pattern
Packages use centralized port configuration:
```js
import { packages } from '../../workspace.config';
const pkg = packages['package-name'];

export default defineConfig({
  server: { port: pkg.devPort },
  preview: { port: pkg.previewPort }
});
```
