<script lang="ts">
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import { optimization } from "$lib/stores/optimization";

	let container = $state<HTMLDivElement>();
	let xParam = $state<string>("");
	let yParam = $state<string>("");

	// Get available parameters
	const availableParams = $derived.by(() => {
		if (!optimization.result || optimization.result.allResults.length === 0)
			return [];
		const firstResult = optimization.result.allResults[0];
		return Object.keys(firstResult.params);
	});

	// Initialize selected params
	$effect(() => {
		const params = availableParams;
		if (params.length >= 2 && !xParam) {
			xParam = params[0];
			yParam = params[1];
		} else if (params.length === 1 && !xParam) {
			xParam = params[0];
			yParam = params[0]; // Same param on both axes
		}
	});

	// Render heatmap when params change or results change
	$effect(() => {
		if (
			!optimization.result ||
			!xParam ||
			!yParam ||
			!container ||
			optimization.result.allResults.length === 0
		) {
			return;
		}

		renderHeatmap();
	});

	function renderHeatmap() {
		if (!container || !optimization.result) return;

		// Clear existing
		d3.select(container).selectAll("*").remove();

		const results = optimization.result.allResults;

		// Dimensions
		const margin = { top: 40, right: 100, bottom: 60, left: 60 };
		const width = container.clientWidth - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		// Create SVG
		const svg = d3
			.select(container)
			.append("svg")
			.attr("width", container.clientWidth)
			.attr("height", 400)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// Get unique values for x and y params
		const xValues = Array.from(
			new Set(results.map((r) => r.params[xParam] as number)),
		).sort((a, b) => a - b);
		const yValues = Array.from(
			new Set(results.map((r) => r.params[yParam] as number)),
		).sort((a, b) => a - b);

		// Create scales
		const xScale = d3
			.scaleBand()
			.domain(xValues.map(String))
			.range([0, width])
			.padding(0.05);
		const yScale = d3
			.scaleBand()
			.domain(yValues.map(String))
			.range([height, 0])
			.padding(0.05);

		// Color scale
		const objectiveValues = results.map((r) => r.objectiveValue);
		const colorScale = d3
			.scaleSequential()
			.domain([
				Math.min(...objectiveValues),
				Math.max(...objectiveValues),
			])
			.interpolator(d3.interpolateRdYlGn);

		// Create data map for quick lookup
		const dataMap = new Map<string, number>();
		results.forEach((r) => {
			const key = `${r.params[xParam]}-${r.params[yParam]}`;
			dataMap.set(key, r.objectiveValue);
		});

		// Create cells
		xValues.forEach((xVal) => {
			yValues.forEach((yVal) => {
				const key = `${xVal}-${yVal}`;
				const value = dataMap.get(key);

				if (value !== undefined) {
					svg.append("rect")
						.attr("x", xScale(String(xVal))!)
						.attr("y", yScale(String(yVal))!)
						.attr("width", xScale.bandwidth())
						.attr("height", yScale.bandwidth())
						.attr("fill", colorScale(value))
						.attr("stroke", "#2a2e39")
						.attr("stroke-width", 1)
						.append("title")
						.text(
							`${xParam}: ${xVal}\n${yParam}: ${yVal}\nObjective: ${value.toFixed(2)}`,
						);
				}
			});
		});

		// X axis
		svg.append("g")
			.attr("transform", `translate(0,${height})`)
			.call(
				d3
					.axisBottom(xScale)
					.tickValues(
						xValues
							.filter(
								(_, i) =>
									i % 2 === 0 || i === xValues.length - 1,
							)
							.map(String),
					),
			)
			.selectAll("text")
			.attr("fill", "#9ca3af")
			.style("font-size", "10px");

		svg.append("text")
			.attr("x", width / 2)
			.attr("y", height + 40)
			.attr("fill", "#9ca3af")
			.attr("text-anchor", "middle")
			.style("font-size", "12px")
			.text(xParam);

		// Y axis
		svg.append("g")
			.call(
				d3
					.axisLeft(yScale)
					.tickValues(
						yValues
							.filter(
								(_, i) =>
									i % 2 === 0 || i === yValues.length - 1,
							)
							.map(String),
					),
			)
			.selectAll("text")
			.attr("fill", "#9ca3af")
			.style("font-size", "10px");

		svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -height / 2)
			.attr("y", -45)
			.attr("fill", "#9ca3af")
			.attr("text-anchor", "middle")
			.style("font-size", "12px")
			.text(yParam);

		// Color legend
		const legendWidth = 20;
		const legendHeight = height;

		const legendScale = d3
			.scaleLinear()
			.domain(colorScale.domain())
			.range([legendHeight, 0]);

		const legendAxis = d3
			.axisRight(legendScale)
			.ticks(5)
			.tickFormat(d3.format(".2f") as any);

		const legendG = svg
			.append("g")
			.attr("transform", `translate(${width + 20}, 0)`)
			.attr("class", "legend");

		// Create gradient
		const defs = svg.append("defs");
		const gradient = defs
			.append("linearGradient")
			.attr("id", "legend-gradient")
			.attr("x1", "0%")
			.attr("x2", "0%")
			.attr("y1", "100%")
			.attr("y2", "0%");

		const tickData = d3.range(0, 1.1, 0.1).map((t) => ({
			offset: `${t * 100}%`,
			color: colorScale(
				colorScale.domain()[0] +
					t * (colorScale.domain()[1] - colorScale.domain()[0]),
			),
		}));

		gradient
			.selectAll("stop")
			.data(tickData)
			.enter()
			.append("stop")
			.attr("offset", (d: any) => d.offset)
			.attr("stop-color", (d: any) => d.color);

		legendG
			.append("rect")
			.attr("width", legendWidth)
			.attr("height", legendHeight)
			.style("fill", "url(#legend-gradient)");

		legendG
			.append("g")
			.attr("transform", `translate(${legendWidth}, 0)`)
			.call(legendAxis as any)
			.selectAll("text")
			.attr("fill", "#9ca3af")
			.style("font-size", "10px");

		legendG
			.append("text")
			.attr("x", legendWidth / 2)
			.attr("y", -10)
			.attr("fill", "#9ca3af")
			.attr("text-anchor", "middle")
			.style("font-size", "11px")
			.text("Objective");
	}
</script>

{#if optimization.hasResult && availableParams.length >= 2}
	<div class="space-y-4">
		<!-- Parameter Selectors -->
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label
					for="x-param"
					class="text-xs font-medium text-text-secondary mb-1 block"
				>
					X Axis
				</label>
				<select
					id="x-param"
					bind:value={xParam}
					class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
				>
					{#each availableParams as param}
						<option value={param}>{param}</option>
					{/each}
				</select>
			</div>
			<div>
				<label
					for="y-param"
					class="text-xs font-medium text-text-secondary mb-1 block"
				>
					Y Axis
				</label>
				<select
					id="y-param"
					bind:value={yParam}
					class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
				>
					{#each availableParams as param}
						<option value={param}>{param}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Heatmap Container -->
		<div
			bind:this={container}
			class="bg-surface rounded-lg border border-border p-4"
		></div>

		<!-- Help Text -->
		<div class="text-xs text-text-secondary">
			<strong>How to read:</strong> Each cell represents a parameter combination.
			Brighter colors indicate better objective values. Hover over cells to
			see exact values.
		</div>
	</div>
{:else if optimization.hasResult}
	<div class="p-4 rounded-lg bg-surface/50 border border-border text-center">
		<p class="text-sm text-text-secondary">
			Heatmap requires at least 2 numeric parameters. Selected strategy
			has only 1 or none.
		</p>
	</div>
{:else}
	<div class="p-4 rounded-lg bg-surface/50 border border-border text-center">
		<p class="text-sm text-text-secondary">
			Run an optimization to visualize parameter space
		</p>
	</div>
{/if}
