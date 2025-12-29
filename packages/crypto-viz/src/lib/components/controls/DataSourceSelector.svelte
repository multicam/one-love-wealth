<script>
    import { settings } from '$lib/stores/settings.js';
    import { loadCryptoData } from '$lib/stores/crypto.js';
    import { DATA_SOURCES_LIST, getDefaultInterval } from '$lib/utils/constants.js';

    function selectSource(sourceId) {
        const defaultInterval = getDefaultInterval(sourceId, $settings.timeframe);
        settings.update(s => ({ ...s, dataSource: sourceId, interval: defaultInterval?.id || null }));
        loadCryptoData();
    }
</script>

<div class="flex flex-wrap items-center gap-2">
    {#each DATA_SOURCES_LIST as source}
        <button
            class="px-2 py-1 text-xs rounded transition-colors
                   {$settings.dataSource === source.id 
                       ? 'bg-accent text-white' 
                       : 'bg-surface-light text-text-secondary hover:text-text-primary'}"
            on:click={() => selectSource(source.id)}
            title="Use {source.name} API"
        >
            {source.name.split(' ')[0]}
        </button>
    {/each}
</div>
