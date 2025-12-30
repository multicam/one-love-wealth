# Data Layer Testing Guide

Comprehensive testing system for data providers with CLI tools, quality validation, and CI/CD integration.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [CLI Usage](#cli-usage)
3. [Quality Checks](#quality-checks)
4. [CI/CD Integration](#cicd-integration)
5. [Test Configurations](#test-configurations)
6. [Writing Provider Tests](#writing-provider-tests)

---

## Quick Start

```bash
# Test a single provider (mock mode)
bun run test:provider fred

# Test with verbose output and quality checks
bun run test:provider fred -v -q

# Test against live API
bun run test:provider fred --live

# Test all providers
bun run test:providers:all

# CI/CD mode (all providers with quality checks)
bun run test:providers:ci
```

---

## CLI Usage

### Basic Commands

**Test single provider:**
```bash
bun run test:provider <provider-name> [options]
```

**Test all providers:**
```bash
bun run test:providers:all [options]
```

**CI/CD testing:**
```bash
bun run test:providers:ci
# Equivalent to: bun run test:provider --all --quality
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--verbose` | `-v` | Detailed output with config and timing |
| `--quality` | `-q` | Run data quality checks (freshness, completeness, format) |
| `--live` | `-l` | Use live API instead of mock mode |
| `--all` | `-a` | Test all providers |
| `--json` | `-j` | Output quality report as JSON (use with `--quality`) |
| `--help` | `-h` | Show help message |

### Available Providers

- `fred` - Federal Reserve Economic Data
- `coingecko` - Cryptocurrency prices
- `yahoo` - Stock market data
- `worldbank` - Global economic indicators
- `bls` - US Bureau of Labor Statistics
- `treasury` - US fiscal data
- `hyperliquid` - Crypto derivatives
- `alphavantage` - Stock & economic data
- `quandl` - Alternative economic data
- `imf` - International Monetary Fund
- `oecd` - Development statistics

---

## Quality Checks

The testing system includes three quality validation checks:

### 1. Freshness Check

Validates that data is not stale based on provider-specific expectations.

**Parameters:**
- `maxAgeMs` - Maximum acceptable age in milliseconds

**Checks:**
- Last data point timestamp
- Age vs maximum acceptable age
- Marks as stale if age > maxAgeMs

**Example output:**
```
Freshness: ✅ Fresh (Data is fresh)
```

### 2. Completeness Check

Validates data series has no gaps and meets minimum point requirements.

**Parameters:**
- `expectedMinPoints` - Minimum expected data points (optional)

**Checks:**
- Number of data points vs expected
- Missing values (handles both `value` and OHLC data)
- Gap detection in time series

**Example output:**
```
Completeness: ✅ Complete (Complete data)
```

### 3. Format Validation

Validates data structure conforms to `DataPoint` interface.

**Checks:**
- Required `time` field (Unix timestamp in ms)
- At least one value field (`value`, `close`, or `open`)
- Values are valid numbers (not NaN or Infinity)
- Timestamps are in valid range

**Example output:**
```
Format: ✅ Valid (101/101 valid)
```

### Max Age by Provider

| Provider | Max Age | Reason |
|----------|---------|--------|
| CoinGecko | 5 minutes | Real-time crypto prices |
| Hyperliquid | 5 minutes | Real-time derivatives |
| FRED | 2 days | Daily economic updates |
| Yahoo | 2 days | Daily stock market |
| Treasury | 2 days | Daily fiscal data |
| Alpha Vantage | 2 days | Daily market data |
| Quandl | 2 days | Daily commodities |
| BLS | 60 days | Monthly labor statistics |
| World Bank | 60 days | Annual indicators |
| IMF | 60 days | Quarterly/annual data |
| OECD | 60 days | Quarterly/annual data |

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Data Provider Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # Run daily at 6 AM UTC
    - cron: '0 6 * * *'

jobs:
  test-providers:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Test all providers (mock mode)
        run: cd packages/data-layer && bun run test:providers:ci

      - name: Generate quality report
        if: always()
        run: |
          cd packages/data-layer
          bun run test:provider --all --quality --json > quality-report.json

      - name: Upload quality report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: quality-report
          path: packages/data-layer/quality-report.json
```

### Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

Use exit codes to fail CI builds:
```bash
bun run test:providers:ci || exit 1
```

---

## Test Configurations

Provider test configurations are defined in `src/testing/provider-configs.ts`.

### Configuration Structure

```typescript
interface ProviderTestConfig {
  name: string;                 // Display name
  configBuilder: () => any;     // Function that builds test config
  maxAgeMs: number;             // Max acceptable age (ms)
  expectedMinPoints?: number;   // Minimum expected data points
}
```

### Example: FRED Configuration

```typescript
{
  name: 'FRED',
  configBuilder: () => ({
    seriesId: 'M2SL',  // M2 Money Supply
    limit: 100,
  }),
  maxAgeMs: 2 * 24 * 60 * 60 * 1000,  // 2 days
  expectedMinPoints: 50,
}
```

### Customizing Test Configs

To modify test behavior, edit the config in `provider-configs.ts`:

```typescript
export const PROVIDER_TEST_CONFIGS: Record<string, ProviderTestConfig> = {
  fred: {
    name: 'FRED',
    configBuilder: () => ({
      seriesId: 'GDPC1',  // Changed to GDP instead of M2
      units: 'pc1',        // Year-over-year percentage change
      limit: 200,          // Increased limit
    }),
    maxAgeMs: getMaxAgeForProvider('fred'),
    expectedMinPoints: 100,  // Increased expectation
  },
  // ... other providers
};
```

---

## Writing Provider Tests

### Unit Tests (Bun Test)

Standard unit tests go in `*.test.ts` files:

```typescript
import { test, expect, describe } from 'bun:test';
import { FREDProvider } from './fred';
import { MemoryAdapter } from '../cache/memory-adapter';
import { ProxyRequestAdapter } from '../types/request';

describe('FREDProvider', () => {
  const cache = new MemoryAdapter();
  const request = new ProxyRequestAdapter('/api/proxy');
  const provider = new FREDProvider(cache, request);

  test('generates mock data', async () => {
    const config = {
      seriesId: 'M2SL',
      mockMode: true,
    };

    const result = await provider.fetch(config);

    expect(result.isMock).toBe(true);
    expect(result.series.data.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests (CLI)

Use the CLI for integration testing:

```typescript
// Run from test script
import { testProvider } from '@one-love-wealth/data-layer/testing';

const result = await testProvider('fred', {
  verbose: false,
  quality: true,
  live: false,
});

if (result.status === 'fail') {
  throw new Error(`Provider test failed: ${result.errors?.join(', ')}`);
}
```

### Custom Quality Checks

Add custom quality checks:

```typescript
import { runQualityChecks } from '@one-love-wealth/data-layer/testing';

const series = await provider.fetch(config);

const qualityReport = runQualityChecks(
  series.series,
  24 * 60 * 60 * 1000,  // 24 hours max age
  50                     // Minimum 50 points
);

if (qualityReport.freshness.isStale) {
  console.warn('Data is stale!');
}
```

---

## Examples

### Test Specific Provider

```bash
# Test FRED in mock mode
bun run test:provider fred

# Test FRED with live API
bun run test:provider fred --live

# Test FRED with verbose output
bun run test:provider fred -v

# Test FRED with quality checks
bun run test:provider fred -q

# All options combined
bun run test:provider fred -v -q -l
```

### Test All Providers

```bash
# Test all (mock mode)
bun run test:providers:all

# Test all with quality checks
bun run test:providers:ci

# Test all and output JSON
bun run test:provider --all --quality --json > report.json
```

### Debugging Failed Tests

```bash
# Run verbose to see detailed output
bun run test:provider yahoo -v -q

# Check specific quality issue
bun run test:provider worldbank -v -q
```

### Parse JSON Output

```bash
# Generate report
bun run test:provider --all -q -j > report.json

# Extract failed providers
jq '.providers[] | select(.status == "fail") | .provider' report.json

# Extract quality issues
jq '.providers[] | select(.quality.freshness.isStale) | .provider' report.json
```

---

## Troubleshooting

### Common Issues

**Issue: Provider test fails with "Unknown provider"**
- Check provider name spelling (case-insensitive)
- Ensure provider is registered in `provider-configs.ts`

**Issue: Quality check fails for freshness**
- Data may be genuinely stale
- Check `maxAgeMs` configuration
- Run with `--live` to fetch fresh data

**Issue: Quality check fails for completeness**
- Mock data may not generate enough points
- Adjust `expectedMinPoints` in config
- Check for actual gaps in live data

**Issue: Format validation fails**
- Check `DataPoint` structure
- Look for NaN or null values
- Verify timestamp format (Unix ms)

---

## Best Practices

1. **Use Mock Mode for Development**: Default behavior, fast and no API limits
2. **Use Live Mode Sparingly**: Only when debugging API issues
3. **Run Quality Checks in CI**: Catch data quality regressions early
4. **Monitor JSON Reports**: Track quality trends over time
5. **Adjust Expectations**: Tune `expectedMinPoints` and `maxAgeMs` per provider
6. **Test Before Deploy**: Always run `test:providers:ci` before releasing

---

## Next Steps

- **[Provider Reference](./PROVIDERS.md)** - Detailed provider documentation
- **[Data Sources Comparison](./DATA_SOURCES_COMPARISON.md)** - Provider overlap analysis
- **[Cache System](../src/cache/README.md)** - Caching strategies
- **[Error Recovery](../src/types/errors.ts)** - Error handling patterns
