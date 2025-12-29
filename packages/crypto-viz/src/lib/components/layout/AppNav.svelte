<script>
    import { BarChart3, Settings, Download, Upload } from 'lucide-svelte';
    import { activePanel } from '$lib/stores/ui.js';
    import { downloadState, importFromFile } from '$lib/services/exportService.js';

    /** @type {HTMLInputElement} */
    let fileInput;

    const navItems = [
        { id: 'charts', icon: BarChart3, label: 'Charts' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    /** @param {string} id */
    function handleClick(id) {
        activePanel.set(id);
    }

    function handleExport() {
        downloadState();
    }

    /** @param {Event & { currentTarget: HTMLInputElement }} event */
    async function handleImport(event) {
        const file = event.currentTarget.files?.[0];
        if (file) {
            const result = await importFromFile(file);
            if (!result.success) {
                alert('Import failed: ' + result.error);
            } else {
                alert('State imported successfully!');
                window.location.reload();
            }
        }
        fileInput.value = '';
    }
</script>

<nav class="w-[60px] bg-surface border-r border-border flex flex-col items-center py-4 gap-2">
    {#each navItems as item}
        <button
            class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors
                   {$activePanel === item.id 
                       ? 'bg-accent text-white' 
                       : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'}"
            on:click={() => handleClick(item.id)}
            title={item.label}
        >
            <svelte:component this={item.icon} size={20} />
        </button>
    {/each}
    
    <div class="flex-1"></div>
    
    <button
        class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors
               text-text-secondary hover:bg-surface-light hover:text-text-primary"
        on:click={handleExport}
        title="Export State"
    >
        <Download size={20} />
    </button>
    
    <button
        class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors
               text-text-secondary hover:bg-surface-light hover:text-text-primary"
        on:click={() => fileInput.click()}
        title="Import State"
    >
        <Upload size={20} />
    </button>
    
    <input
        bind:this={fileInput}
        type="file"
        accept=".json"
        class="hidden"
        on:change={handleImport}
    />
</nav>
