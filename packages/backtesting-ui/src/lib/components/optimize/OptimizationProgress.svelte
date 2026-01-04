<script lang="ts">
	import { optimization } from "$lib/stores/optimization.svelte";
	import {
		Loader2,
		CheckCircle,
		XCircle,
		Clock,
		Zap,
		TrendingUp,
		Target,
		Activity,
	} from "lucide-svelte";

	// Format time duration
	function formatDuration(ms: number): string {
		if (ms < 1000) return `${Math.round(ms)}ms`;
		const seconds = Math.floor(ms / 1000);
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return `${hours}h ${remainingMinutes}m`;
	}

	// Format params for display
	function formatParams(params: Record<string, number> | null): string {
		if (!params) return "—";
		return Object.entries(params)
			.map(([key, val]) => `${key}: ${val.toFixed(2)}`)
			.join(", ");
	}

	// Get phase icon and color
	function getPhaseStyle(phase: string): { color: string; bgColor: string } {
		switch (phase) {
			case "loading-data":
				return { color: "text-blue-400", bgColor: "bg-blue-500/10" };
			case "optimizing":
				return { color: "text-primary", bgColor: "bg-primary/10" };
			case "finalizing":
				return { color: "text-amber-400", bgColor: "bg-amber-500/10" };
			case "complete":
				return { color: "text-green-400", bgColor: "bg-green-500/10" };
			case "error":
				return { color: "text-red-400", bgColor: "bg-red-500/10" };
			case "cancelled":
				return { color: "text-orange-400", bgColor: "bg-orange-500/10" };
			default:
				return { color: "text-text-secondary", bgColor: "bg-surface" };
		}
	}

	// Reactive elapsed time (updates every second)
	let elapsedDisplay = $state("0s");
	let intervalId: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (optimization.isRunning && optimization.startTime > 0) {
			// Start interval to update elapsed time
			intervalId = setInterval(() => {
				elapsedDisplay = formatDuration(Date.now() - optimization.startTime);
			}, 1000);
		} else {
			// Clear interval when not running
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
			if (optimization.startTime > 0) {
				elapsedDisplay = formatDuration(Date.now() - optimization.startTime);
			}
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});

	const phaseStyle = $derived(getPhaseStyle(optimization.phase));
	const etaDisplay = $derived(
		optimization.estimatedTimeRemaining
			? formatDuration(optimization.estimatedTimeRemaining)
			: "Calculating..."
	);
	const speedDisplay = $derived(
		optimization.iterationsPerSecond > 0
			? `${optimization.iterationsPerSecond.toFixed(1)}/s`
			: "—"
	);
</script>

{#if optimization.isRunning || optimization.phase === "complete" || optimization.phase === "error" || optimization.phase === "cancelled"}
	<div class="space-y-4">
		<!-- Phase Header -->
		<div
			class="flex items-center gap-3 p-3 rounded-lg {phaseStyle.bgColor}"
		>
			{#if optimization.phase === "loading-data" || optimization.phase === "optimizing" || optimization.phase === "finalizing"}
				<Loader2 size={20} class="{phaseStyle.color} animate-spin" />
			{:else if optimization.phase === "complete"}
				<CheckCircle size={20} class={phaseStyle.color} />
			{:else if optimization.phase === "error"}
				<XCircle size={20} class={phaseStyle.color} />
			{:else if optimization.phase === "cancelled"}
				<XCircle size={20} class={phaseStyle.color} />
			{:else}
				<Activity size={20} class={phaseStyle.color} />
			{/if}
			<div class="flex-1">
				<div class="text-sm font-medium {phaseStyle.color}">
					{optimization.phaseMessage || "Initializing..."}
				</div>
				{#if optimization.method}
					<div class="text-xs text-text-secondary mt-0.5">
						{optimization.method === "grid"
							? "Grid Search"
							: optimization.method === "random"
								? "Random Search"
								: "Genetic Algorithm"}
						• Optimizing {optimization.objective}
					</div>
				{/if}
			</div>
		</div>

		<!-- Progress Bar -->
		{#if optimization.isRunning || optimization.phase === "complete"}
			<div class="space-y-2">
				<div class="flex justify-between text-xs">
					<span class="text-text-secondary">Progress</span>
					<span class="text-text-primary font-medium">
						{optimization.currentIteration.toLocaleString()} / {optimization.totalIterations.toLocaleString()}
						<span class="text-text-secondary ml-1">
							({optimization.progressPercent}%)
						</span>
					</span>
				</div>
				<div class="w-full bg-background rounded-full h-2.5 overflow-hidden">
					<div
						class="h-full rounded-full transition-all duration-300 {optimization.phase === 'complete'
							? 'bg-green-500'
							: optimization.phase === 'error'
								? 'bg-red-500'
								: 'bg-primary'}"
						style="width: {optimization.progress}%"
					></div>
				</div>
			</div>
		{/if}

		<!-- Stats Grid -->
		{#if optimization.isRunning}
			<div class="grid grid-cols-2 gap-3">
				<!-- Elapsed Time -->
				<div class="bg-surface/50 rounded-lg p-3 border border-border/50">
					<div class="flex items-center gap-2 text-text-secondary mb-1">
						<Clock size={14} />
						<span class="text-xs">Elapsed</span>
					</div>
					<div class="text-sm font-medium text-text-primary">
						{elapsedDisplay}
					</div>
				</div>

				<!-- ETA -->
				<div class="bg-surface/50 rounded-lg p-3 border border-border/50">
					<div class="flex items-center gap-2 text-text-secondary mb-1">
						<Target size={14} />
						<span class="text-xs">ETA</span>
					</div>
					<div class="text-sm font-medium text-text-primary">
						{etaDisplay}
					</div>
				</div>

				<!-- Speed -->
				<div class="bg-surface/50 rounded-lg p-3 border border-border/50">
					<div class="flex items-center gap-2 text-text-secondary mb-1">
						<Zap size={14} />
						<span class="text-xs">Speed</span>
					</div>
					<div class="text-sm font-medium text-text-primary">
						{speedDisplay}
					</div>
				</div>

				<!-- Current Best -->
				<div class="bg-surface/50 rounded-lg p-3 border border-border/50">
					<div class="flex items-center gap-2 text-text-secondary mb-1">
						<TrendingUp size={14} />
						<span class="text-xs">Best So Far</span>
					</div>
					<div class="text-sm font-medium text-primary">
						{optimization.currentBestValue !== null
							? optimization.currentBestValue.toFixed(2)
							: "—"}
					</div>
				</div>
			</div>
		{/if}

		<!-- Current Best Parameters -->
		{#if optimization.currentBestParams && (optimization.isRunning || optimization.phase === "complete")}
			<div class="bg-primary/5 border border-primary/20 rounded-lg p-3">
				<div class="text-xs font-medium text-primary mb-1">
					{optimization.phase === "complete" ? "Best Parameters" : "Current Best Parameters"}
				</div>
				<div class="text-xs text-text-secondary font-mono">
					{formatParams(optimization.currentBestParams)}
				</div>
			</div>
		{/if}

		<!-- Completion Summary -->
		{#if optimization.phase === "complete"}
			<div class="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
				<div class="flex items-center gap-2 text-green-400 mb-2">
					<CheckCircle size={16} />
					<span class="text-sm font-medium">Optimization Complete</span>
				</div>
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div>
						<span class="text-text-secondary">Total Time:</span>
						<span class="text-text-primary ml-1">{elapsedDisplay}</span>
					</div>
					<div>
						<span class="text-text-secondary">Combinations:</span>
						<span class="text-text-primary ml-1">
							{optimization.totalIterations.toLocaleString()}
						</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Error Display -->
		{#if optimization.phase === "error" && optimization.error}
			<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
				<div class="flex items-center gap-2 text-red-400 mb-1">
					<XCircle size={16} />
					<span class="text-sm font-medium">Optimization Failed</span>
				</div>
				<div class="text-xs text-text-secondary">
					{optimization.error}
				</div>
			</div>
		{/if}

		<!-- Cancelled Display -->
		{#if optimization.phase === "cancelled"}
			<div class="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
				<div class="flex items-center gap-2 text-orange-400">
					<XCircle size={16} />
					<span class="text-sm font-medium">Optimization Cancelled</span>
				</div>
				<div class="text-xs text-text-secondary mt-1">
					Completed {optimization.currentIteration.toLocaleString()} of {optimization.totalIterations.toLocaleString()} iterations
				</div>
			</div>
		{/if}
	</div>
{/if}
