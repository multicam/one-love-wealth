<script>
    export let label = '';
    export let value = 0;
    export let min = 0;
    export let max = 100;
    export let step = 1;
</script>

<label class="space-y-1 block">
    <div class="flex items-center justify-between">
        <span class="text-xs text-text-secondary">{label}</span>
        <span class="text-xs text-text-primary font-mono">{value}</span>
    </div>
    <input 
        type="range" 
        bind:value
        {min} 
        {max} 
        {step}
        class="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer
               [&::-webkit-slider-thumb]:appearance-none
               [&::-webkit-slider-thumb]:w-3
               [&::-webkit-slider-thumb]:h-3
               [&::-webkit-slider-thumb]:bg-accent
               [&::-webkit-slider-thumb]:rounded-full
               [&::-webkit-slider-thumb]:cursor-pointer"
    />
</label>
