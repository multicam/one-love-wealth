<script>
    import CryptoSelector from '$lib/components/controls/CryptoSelector.svelte';
    import TickerInfo from '$lib/components/controls/TickerInfo.svelte';
    import ChartContainer from '$lib/components/charts/ChartContainer.svelte';
    import EventList from '$lib/components/strategy/EventList.svelte';
</script>

<main class="flex-1 flex flex-col overflow-hidden bg-background">
    <header class="h-[50px] border-b border-border flex items-center px-4">
        <CryptoSelector />
    </header>
    
    <TickerInfo />
    
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <ChartContainer />
        <EventList />
    </div>
</main>
