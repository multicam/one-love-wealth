<script>
    import { detectedEvents } from '$lib/stores/events.js';
    import { TrendingUp, TrendingDown } from 'lucide-svelte';

    function formatTime(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
</script>

<div class="bg-surface rounded-lg overflow-hidden">
    <div class="px-3 py-2 border-b border-border flex items-center justify-between">
        <h3 class="text-sm font-medium text-text-primary">Detected Events</h3>
        <span class="text-xs text-text-secondary">
            {$detectedEvents.reduce((sum, e) => sum + e.timestamps.length, 0)} signals
        </span>
    </div>
    
    <div class="max-h-[300px] overflow-y-auto">
        {#if $detectedEvents.length === 0}
            <div class="p-4 text-center text-text-secondary text-sm">
                No events detected
            </div>
        {:else}
            {#each $detectedEvents as event}
                <div class="border-b border-border last:border-b-0">
                    <div class="px-3 py-2 flex items-center gap-2">
                        {#if event.signal === 'bullish'}
                            <TrendingUp size={14} class="text-success" />
                        {:else}
                            <TrendingDown size={14} class="text-danger" />
                        {/if}
                        <div class="flex-1 min-w-0">
                            <div class="text-xs font-medium text-text-primary truncate">
                                {event.indicator}: {event.name}
                            </div>
                            <div class="text-xs text-text-secondary">
                                {event.timestamps.length} occurrence{event.timestamps.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    
                    {#if event.timestamps.length > 0 && event.timestamps.length <= 5}
                        <div class="px-3 pb-2 flex flex-wrap gap-1">
                            {#each event.timestamps.slice(-5) as ts}
                                <span class="text-xs px-1.5 py-0.5 bg-surface-light rounded text-text-secondary">
                                    {formatTime(ts)}
                                </span>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        {/if}
    </div>
</div>
