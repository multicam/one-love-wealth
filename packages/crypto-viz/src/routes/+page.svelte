<script>
    import { browser } from '$app/environment';
    import ThreeColumnLayout from '$lib/components/layout/ThreeColumnLayout.svelte';
    import { loadCryptoData } from '$lib/stores/crypto.js';
    import { toastStore } from '@one-love-wealth/shared-ui';

    // Svelte 5: use $effect for side effects
    $effect(() => {
        if (browser) {
            loadCryptoData();
            
            // Show welcome toast on app load
            toastStore.info('Crypto Viz loaded successfully!');
        }
    });
</script>

<ThreeColumnLayout />
