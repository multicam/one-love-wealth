<script>
    import { selectedCrypto, loadCryptoData } from '$lib/stores/crypto.js';
    import { SUPPORTED_CRYPTOS } from '$lib/utils/constants.js';

    /** @param {string} id */
    function selectCrypto(id) {
        selectedCrypto.set(id);
        loadCryptoData();
    }
</script>

<div class="flex items-center gap-1">
    {#each SUPPORTED_CRYPTOS as crypto}
        <button
            class="px-3 py-1.5 text-sm rounded-md transition-colors
                   {$selectedCrypto === crypto.id 
                       ? 'bg-accent text-white' 
                       : 'bg-surface-light text-text-secondary hover:text-text-primary'}"
            on:click={() => selectCrypto(crypto.id)}
        >
            {crypto.symbol}
        </button>
    {/each}
</div>
