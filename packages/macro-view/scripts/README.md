# Provider Template Generator

Interactive CLI tool to scaffold new data providers for the macro-view application.

## Usage

```bash
bun run create-provider
```

## What It Generates

The tool will create:

1. **Type Definitions** (`src/lib/types/providers/{name}.ts`)
   - TypeScript interfaces for provider configuration
   - Common constants for series IDs/symbols

2. **Provider Class** (`src/lib/data-providers/{name}.ts`)
   - Extends DataProvider base class
   - URL building logic
   - Response transformation
   - Mock data generation

3. **Proxy API Route** (`src/routes/api/proxy/{name}/+server.ts`)
   - SvelteKit server endpoint
   - CORS bypass
   - API key management
   - Error handling

4. **Auto-Updates:**
   - Adds import and registration to `registry.ts`
   - Adds type to discriminated union in `data-provider.ts`

## Interactive Prompts

The tool will ask for:

- **Provider name** (lowercase, e.g., "alphavantage")
- **Display name** (e.g., "Alpha Vantage")
- **API base URL** (e.g., "https://www.alphavantage.co/query")
- **Auth type** (none, apiKey, oauth)
- **Cache TTL** in minutes (default: 60)
- **Example symbol** (e.g., "AAPL")

## After Generation

1. Review generated files and customize based on actual API
2. Implement API-specific logic in provider class
3. Update proxy route with correct parameter names
4. Add API key to `.env` if needed (e.g., `ALPHAVANTAGE_API_KEY`)
5. Test in API Tester page (`/api-tester`)

## Example

```bash
$ bun run create-provider

📦 Provider Template Generator

This tool will generate:
  - Type definitions
  - Provider class
  - Proxy API route
  - Registry updates

Provider name (lowercase, e.g., "alphavantage"): myapi
Display name (e.g., "Alpha Vantage"): My API
API base URL: https://api.example.com/data
Auth type (none/apiKey/oauth) [none]: apiKey
Cache TTL in minutes [60]: 30
Example symbol/series ID (e.g., "AAPL"): EXAMPLE

📝 Generating files...

  ✓ Created src/lib/types/providers/myapi.ts
  ✓ Created src/lib/data-providers/myapi.ts
  ✓ Created src/routes/api/proxy/myapi/+server.ts
  ✓ Added import to registry.ts
  ✓ Added registration to registry.ts
  ✓ Added import to data-provider.ts
  ✓ Added to DataSourceConfig union in data-provider.ts

✅ Provider scaffolding complete!

Next steps:
  1. Review generated files in src/lib/types/providers/myapi.ts
  2. Implement API-specific logic in src/lib/data-providers/myapi.ts
  3. Test with: bun run dev and visit /api-tester
  4. Add MYAPI_API_KEY to your .env file
```

## Templates

Templates are located in `scripts/templates/`:

- `types.template.ts` - Type definition template
- `provider.template.ts` - Provider class template
- `proxy.template.ts` - Proxy route template

Customize these templates to change default scaffolding behavior.

## Placeholders

Templates use these placeholders:

- `{{NAME}}` - Provider name (lowercase)
- `{{NAME_UPPER}}` - Provider name (UPPERCASE)
- `{{NAME_PASCAL}}` - Provider name (PascalCase)
- `{{DISPLAY_NAME}}` - Human-readable name
- `{{BASE_URL}}` - API base URL
- `{{CACHE_TTL}}` - Cache TTL in milliseconds
- `{{AUTH_TYPE}}` - Authentication type
- `{{EXAMPLE_SYMBOL}}` - Example symbol/series ID
