<script>
    import { browser } from '$app/environment';
    import ThreeColumnLayout from '$lib/components/layout/ThreeColumnLayout.svelte';
    import { loadCryptoData } from '$lib/stores/crypto.js';

    // Svelte 5: use $effect for side effects
    $effect(() => {
        if (browser) {
            console.log('+page.svelte $effect running, loading data...');
            loadCryptoData();
        }
    });
</script>

<ThreeColumnLayout />
