<script>
    import { ChevronDown, ChevronRight } from 'lucide-svelte';
    
    export let title = '';
    let expanded = true;
</script>

<div class="border border-border rounded-lg overflow-hidden">
    <button 
        class="w-full px-3 py-2 flex items-center justify-between bg-surface-light hover:bg-surface-light/80 transition-colors"
        on:click={() => expanded = !expanded}
    >
        <span class="text-sm font-medium text-text-primary">{title}</span>
        {#if expanded}
            <ChevronDown size={16} class="text-text-secondary" />
        {:else}
            <ChevronRight size={16} class="text-text-secondary" />
        {/if}
    </button>
    
    {#if expanded}
        <div class="p-3 bg-surface">
            <slot />
        </div>
    {/if}
</div>
