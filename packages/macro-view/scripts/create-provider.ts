#!/usr/bin/env bun

/**
 * Provider Template Generator
 *
 * Interactive CLI tool to scaffold new data providers
 * Usage: bun run create-provider
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

interface ProviderConfig {
	name: string; // e.g., "alphavantage"
	displayName: string; // e.g., "Alpha Vantage"
	baseUrl: string; // e.g., "https://www.alphavantage.co/query"
	authType: 'none' | 'apiKey' | 'oauth';
	cacheTTL: number; // milliseconds
	exampleSymbol: string; // e.g., "AAPL"
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function question(prompt: string): Promise<string> {
	return new Promise((resolve) => {
		rl.question(prompt, (answer) => {
			resolve(answer.trim());
		});
	});
}

async function main() {
	console.log('\n📦 Provider Template Generator\n');
	console.log('This tool will generate:');
	console.log('  - Type definitions');
	console.log('  - Provider class');
	console.log('  - Proxy API route');
	console.log('  - Registry updates\n');

	// Collect provider configuration
	const config: ProviderConfig = {
		name: '',
		displayName: '',
		baseUrl: '',
		authType: 'none',
		cacheTTL: 0,
		exampleSymbol: ''
	};

	// Provider name (lowercase, no spaces)
	config.name = await question('Provider name (lowercase, e.g., "alphavantage"): ');
	if (!config.name || !/^[a-z][a-z0-9]*$/.test(config.name)) {
		console.error('❌ Invalid provider name. Must be lowercase letters/numbers only.');
		process.exit(1);
	}

	// Display name
	config.displayName = await question(`Display name (e.g., "Alpha Vantage"): `);
	if (!config.displayName) {
		console.error('❌ Display name is required.');
		process.exit(1);
	}

	// Base URL
	config.baseUrl = await question('API base URL: ');
	if (!config.baseUrl || !config.baseUrl.startsWith('http')) {
		console.error('❌ Invalid base URL. Must start with http:// or https://');
		process.exit(1);
	}

	// Auth type
	const authInput = await question('Auth type (none/apiKey/oauth) [none]: ') || 'none';
	if (!['none', 'apiKey', 'oauth'].includes(authInput)) {
		console.error('❌ Invalid auth type. Must be: none, apiKey, or oauth');
		process.exit(1);
	}
	config.authType = authInput as 'none' | 'apiKey' | 'oauth';

	// Cache TTL
	const ttlInput = await question('Cache TTL in minutes [60]: ') || '60';
	const ttlMinutes = parseInt(ttlInput);
	if (isNaN(ttlMinutes) || ttlMinutes < 0) {
		console.error('❌ Invalid TTL. Must be a positive number.');
		process.exit(1);
	}
	config.cacheTTL = ttlMinutes * 60 * 1000;

	// Example symbol
	config.exampleSymbol = await question('Example symbol/series ID (e.g., "AAPL"): ');
	if (!config.exampleSymbol) {
		console.error('❌ Example symbol is required.');
		process.exit(1);
	}

	rl.close();

	console.log('\n📝 Generating files...\n');

	// Generate files
	generateTypeDefinitions(config);
	generateProviderClass(config);
	generateProxyRoute(config);
	updateRegistry(config);
	updateDiscriminatedUnion(config);

	console.log('\n✅ Provider scaffolding complete!\n');
	console.log('Next steps:');
	console.log(`  1. Review generated files in src/lib/types/providers/${config.name}.ts`);
	console.log(`  2. Implement API-specific logic in src/lib/data-providers/${config.name}.ts`);
	console.log(`  3. Test with: bun run dev and visit /api-tester`);
	if (config.authType === 'apiKey') {
		console.log(`  4. Add ${config.name.toUpperCase()}_API_KEY to your .env file`);
	}
	console.log('');
}

function generateTypeDefinitions(config: ProviderConfig) {
	const template = readFileSync(
		join(__dirname, 'templates/types.template.ts'),
		'utf-8'
	);

	const content = template
		.replace(/{{NAME}}/g, config.name)
		.replace(/{{DISPLAY_NAME}}/g, config.displayName)
		.replace(/{{NAME_UPPER}}/g, config.name.toUpperCase())
		.replace(/{{NAME_PASCAL}}/g, toPascalCase(config.name))
		.replace(/{{EXAMPLE_SYMBOL}}/g, config.exampleSymbol);

	const outputPath = join(__dirname, `../src/lib/types/providers/${config.name}.ts`);
	writeFileSync(outputPath, content);
	console.log(`  ✓ Created ${outputPath}`);
}

function generateProviderClass(config: ProviderConfig) {
	const template = readFileSync(
		join(__dirname, 'templates/provider.template.ts'),
		'utf-8'
	);

	const content = template
		.replace(/{{NAME}}/g, config.name)
		.replace(/{{DISPLAY_NAME}}/g, config.displayName)
		.replace(/{{NAME_PASCAL}}/g, toPascalCase(config.name))
		.replace(/{{BASE_URL}}/g, config.baseUrl)
		.replace(/{{CACHE_TTL}}/g, config.cacheTTL.toString())
		.replace(/{{AUTH_TYPE}}/g, config.authType);

	const outputPath = join(__dirname, `../src/lib/data-providers/${config.name}.ts`);
	writeFileSync(outputPath, content);
	console.log(`  ✓ Created ${outputPath}`);
}

function generateProxyRoute(config: ProviderConfig) {
	const template = readFileSync(
		join(__dirname, 'templates/proxy.template.ts'),
		'utf-8'
	);

	const content = template
		.replace(/{{NAME}}/g, config.name)
		.replace(/{{DISPLAY_NAME}}/g, config.displayName)
		.replace(/{{NAME_UPPER}}/g, config.name.toUpperCase())
		.replace(/{{BASE_URL}}/g, config.baseUrl)
		.replace(/{{AUTH_TYPE}}/g, config.authType);

	const outputDir = join(__dirname, `../src/routes/api/proxy/${config.name}`);
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	const outputPath = join(outputDir, '+server.ts');
	writeFileSync(outputPath, content);
	console.log(`  ✓ Created ${outputPath}`);
}

function updateRegistry(config: ProviderConfig) {
	const registryPath = join(__dirname, '../src/lib/data-providers/registry.ts');
	let content = readFileSync(registryPath, 'utf-8');

	// Add import
	const importLine = `import { ${toPascalCase(config.name)}Provider } from './${config.name}';`;
	const importSection = content.indexOf('import');
	const lastImport = content.lastIndexOf('import');
	const endOfLastImport = content.indexOf('\n', lastImport);

	if (!content.includes(importLine)) {
		content = content.slice(0, endOfLastImport + 1) + importLine + '\n' + content.slice(endOfLastImport + 1);
		console.log(`  ✓ Added import to registry.ts`);
	}

	// Add registration
	const registrationLine = `\t\tthis.register('${config.name}', new ${toPascalCase(config.name)}Provider());`;

	if (!content.includes(registrationLine)) {
		// Find the constructor and add registration
		const constructorMatch = content.match(/constructor\(\) \{[^}]*\}/);
		if (constructorMatch) {
			const constructorEnd = content.indexOf('}', content.indexOf('constructor()'));
			content = content.slice(0, constructorEnd) + registrationLine + '\n' + content.slice(constructorEnd);
			console.log(`  ✓ Added registration to registry.ts`);
		}
	}

	writeFileSync(registryPath, content);
}

function updateDiscriminatedUnion(config: ProviderConfig) {
	const typesPath = join(__dirname, '../src/lib/types/data-provider.ts');
	let content = readFileSync(typesPath, 'utf-8');

	// Add import
	const importLine = `import type { ${toPascalCase(config.name)}DataSourceConfig } from './providers/${config.name}';`;

	if (!content.includes(importLine)) {
		// Add after other provider imports
		const lastProviderImport = content.lastIndexOf("from './providers/");
		const endOfLine = content.indexOf('\n', lastProviderImport);
		content = content.slice(0, endOfLine + 1) + importLine + '\n' + content.slice(endOfLine + 1);
		console.log(`  ✓ Added import to data-provider.ts`);
	}

	// Add to discriminated union
	const unionAddition = `\t| ${toPascalCase(config.name)}DataSourceConfig`;

	if (!content.includes(unionAddition)) {
		// Find DataSourceConfig and add new type
		const unionMatch = content.match(/export type DataSourceConfig =[^;]+;/s);
		if (unionMatch) {
			const unionEnd = content.indexOf(';', content.indexOf('export type DataSourceConfig'));
			content = content.slice(0, unionEnd) + '\n' + unionAddition + content.slice(unionEnd);
			console.log(`  ✓ Added to DataSourceConfig union in data-provider.ts`);
		}
	}

	writeFileSync(typesPath, content);
}

function toPascalCase(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

main().catch((error) => {
	console.error('❌ Error:', error.message);
	process.exit(1);
});
