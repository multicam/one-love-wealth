/**
 * API Validation Test
 * Tests all FRED and CoinGecko series IDs used in graphs-config.ts
 * Run with: node tests/api-validation.test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
}

const FRED_API_KEY = process.env.FRED_API_KEY || 'demo';

// All unique FRED series IDs from graphs-config.ts (updated with valid replacements)
const FRED_SERIES = [
    'A091RC1Q027SBEA',  // Federal Government Interest Payments
    'CIVPART',          // Labor Force Participation Rate
    'DTWEXBGS',         // Trade Weighted Dollar Index
    'GDPC1',            // Real GDP
    'GFDEBTN',          // Federal Debt: Total Public Debt
    'GFDEGDQ188S',      // Federal Debt to GDP
    'GS10',             // 10-Year Treasury Constant Maturity Rate
    'IPMAN',            // Industrial Production: Manufacturing (ISM PMI proxy)
    'M2SL',             // M2 Money Stock
    'NASDAQ100',        // NASDAQ 100 Index
    'NFCI',             // Chicago Fed National Financial Conditions Index
    'OPHNFB',           // Nonfarm Business Sector: Output Per Hour
    'PPIACO',           // Producer Price Index: All Commodities (Gold proxy)
    'SP500',            // S&P 500
    'SPDYNCBRTINUSA',   // Birth Rate, Crude (per 1,000 people)
    'TDSP',             // Household Debt Service Payments
    'TOTDTEUSQ163N',    // Total Credit to Private Non-Financial Sector
    'UMCSENT',          // University of Michigan Consumer Sentiment
    'WPU10',            // PPI: Metals and Metal Products
];

// All unique CoinGecko IDs from graphs-config.ts
const COINGECKO_IDS = [
    'bitcoin',
    'ethereum',
];

async function testFredSeries(seriesId: string) {
    const url = `https://api.stlouisfed.org/fred/series?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error_code) {
            return { id: seriesId, status: 'FAIL', error: data.error_message };
        }
        return { id: seriesId, status: 'OK', title: data.seriess?.[0]?.title || 'Unknown' };
    } catch (e) {
        return { id: seriesId, status: 'ERROR', error: (e as Error).message };
    }
}

async function testCoinGeckoId(coinId: string) {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return { id: coinId, status: 'FAIL', error: `HTTP ${response.status}` };
        }
        const data = await response.json();
        return { id: coinId, status: 'OK', name: data.name };
    } catch (e) {
        return { id: coinId, status: 'ERROR', error: (e as Error).message };
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('API VALIDATION TEST');
    console.log('='.repeat(60));
    console.log(`FRED API Key: ${FRED_API_KEY === 'demo' ? 'demo (limited)' : 'configured'}`);
    console.log('');

    // Test FRED series
    console.log('FRED Series Tests:');
    console.log('-'.repeat(60));
    
    const fredResults = [];
    for (const seriesId of FRED_SERIES) {
        const result = await testFredSeries(seriesId);
        fredResults.push(result);
        const statusIcon = result.status === 'OK' ? '✓' : '✗';
        const detail = result.status === 'OK' ? result.title : result.error;
        console.log(`  ${statusIcon} ${seriesId.padEnd(20)} ${result.status.padEnd(6)} ${detail}`);
        // Rate limit protection
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('');
    console.log('CoinGecko Tests:');
    console.log('-'.repeat(60));
    
    const cgResults = [];
    for (const coinId of COINGECKO_IDS) {
        const result = await testCoinGeckoId(coinId);
        cgResults.push(result);
        const statusIcon = result.status === 'OK' ? '✓' : '✗';
        const detail = result.status === 'OK' ? result.name : result.error;
        console.log(`  ${statusIcon} ${coinId.padEnd(20)} ${result.status.padEnd(6)} ${detail}`);
        await new Promise(r => setTimeout(r, 500));
    }

    // Summary
    console.log('');
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    
    const fredFailed = fredResults.filter(r => r.status !== 'OK');
    const cgFailed = cgResults.filter(r => r.status !== 'OK');
    
    console.log(`FRED:      ${FRED_SERIES.length - fredFailed.length}/${FRED_SERIES.length} passed`);
    console.log(`CoinGecko: ${COINGECKO_IDS.length - cgFailed.length}/${COINGECKO_IDS.length} passed`);
    
    if (fredFailed.length > 0) {
        console.log('');
        console.log('Failed FRED series (need replacement):');
        fredFailed.forEach(r => console.log(`  - ${r.id}: ${r.error}`));
    }
    
    if (cgFailed.length > 0) {
        console.log('');
        console.log('Failed CoinGecko IDs:');
        cgFailed.forEach(r => console.log(`  - ${r.id}: ${r.error}`));
    }

    const totalFailed = fredFailed.length + cgFailed.length;
    console.log('');
    console.log(totalFailed === 0 ? '✓ All tests passed!' : `✗ ${totalFailed} test(s) failed`);
    
    process.exit(totalFailed > 0 ? 1 : 0);
}

runTests();
