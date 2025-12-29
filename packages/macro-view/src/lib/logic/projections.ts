import * as ss from 'simple-statistics';
import type { DataPoint } from '../db';

export interface ForecastResult {
	date: string;
	base: number;
	bull: number;
	bear: number;
}

export interface ScenarioAssumptions {
	liquidityGrowthYoY: number; // e.g., 0.08 for 8%
	horizonMonths: number;
}

export function generateBtcForecast(
	m2Data: DataPoint[],
	btcData: DataPoint[],
	assumptions: ScenarioAssumptions
): ForecastResult[] {
	if (m2Data.length < 12 || btcData.length < 12) {
		return [];
	}

	// 1. Prepare historical correlation data
	// Align M2 and BTC (BTC is often daily, M2 is monthly)
	// We'll use M2 dates as the anchor
	const regressionPoints: number[][] = [];
	
	m2Data.forEach(mPoint => {
		const bPoint = btcData.find(b => b.time === mPoint.time);
		if (bPoint && mPoint.value !== undefined && bPoint.value !== undefined) {
			// Using Log of Price and Log of M2 often shows better linear correlation
			regressionPoints.push([Math.log(mPoint.value), Math.log(bPoint.value)]);
		}
	});

	if (regressionPoints.length < 5) return [];

	// 2. Perform Linear Regression
	const model = ss.linearRegression(regressionPoints);
	const fit = ss.linearRegressionLine(model);

	// 3. Project M2 into the future
	const lastM2 = m2Data[m2Data.length - 1];
	const results: ForecastResult[] = [];
	const lastDate = new Date(lastM2.time);
	const lastM2Value = lastM2.value ?? 0;

	for (let i = 1; i <= assumptions.horizonMonths; i++) {
		const forecastDate = new Date(lastDate);
		forecastDate.setMonth(lastDate.getMonth() + i);
		
		// Monthly growth rate from YoY assumption
		// (1 + g)^(1/12)
		const monthlyGrowth = Math.pow(1 + assumptions.liquidityGrowthYoY, 1/12);
		const projectedM2 = lastM2Value * Math.pow(monthlyGrowth, i);
		
		// 4. Calculate BTC Base Price from Regression
		const logBtcBase = fit(Math.log(projectedM2));
		const btcBase = Math.exp(logBtcBase);

		// 5. Add Confidence Bands (Bull/Bear)
		// For MVP, we'll use a simple +/- 20% volatility band
		// In a real app, this would use standard error of the regression
		results.push({
			date: forecastDate.toISOString().split('T')[0],
			base: btcBase,
			bull: btcBase * 1.5, // 50% upside volatility
			bear: btcBase * 0.7  // 30% downside volatility
		});
	}

	return results;
}
