<script>
    import SettingsSection from '$lib/components/controls/SettingsSection.svelte';
    import TimeframeSelector from '$lib/components/controls/TimeframeSelector.svelte';
    import DataSourceSelector from '$lib/components/controls/DataSourceSelector.svelte';
    import SettingsSlider from '$lib/components/controls/SettingsSlider.svelte';
    import { settings } from '$lib/stores/settings.js';
</script>

<aside class="w-[280px] bg-surface border-l border-border flex flex-col overflow-hidden">
    <header class="h-[50px] border-b border-border flex items-center px-4">
        <h2 class="text-sm font-semibold text-text-primary">Settings</h2>
    </header>
    
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <SettingsSection title="Data Source">
            <DataSourceSelector />
        </SettingsSection>

        <SettingsSection title="Timeframe">
            <TimeframeSelector />
        </SettingsSection>

        <SettingsSection title="Stochastic">
            <div class="space-y-3">
                <label class="flex items-center gap-2 text-sm text-text-secondary">
                    <input 
                        type="checkbox" 
                        bind:checked={$settings.indicators.stochastic.enabled}
                        class="rounded border-border bg-surface-light"
                    />
                    Enabled
                </label>
                {#if $settings.indicators.stochastic.enabled}
                    <SettingsSlider 
                        label="K Period" 
                        bind:value={$settings.indicators.stochastic.kPeriod}
                        min={1} max={50}
                    />
                    <SettingsSlider 
                        label="D Period" 
                        bind:value={$settings.indicators.stochastic.dPeriod}
                        min={1} max={20}
                    />
                    <SettingsSlider 
                        label="Smooth" 
                        bind:value={$settings.indicators.stochastic.smooth}
                        min={1} max={10}
                    />
                {/if}
            </div>
        </SettingsSection>

        <SettingsSection title="Stochastic RSI">
            <div class="space-y-3">
                <label class="flex items-center gap-2 text-sm text-text-secondary">
                    <input 
                        type="checkbox" 
                        bind:checked={$settings.indicators.stochasticRSI.enabled}
                        class="rounded border-border bg-surface-light"
                    />
                    Enabled
                </label>
                {#if $settings.indicators.stochasticRSI.enabled}
                    <SettingsSlider 
                        label="RSI Period" 
                        bind:value={$settings.indicators.stochasticRSI.rsiPeriod}
                        min={1} max={50}
                    />
                    <SettingsSlider 
                        label="Stoch Period" 
                        bind:value={$settings.indicators.stochasticRSI.stochPeriod}
                        min={1} max={50}
                    />
                    <SettingsSlider 
                        label="K Period" 
                        bind:value={$settings.indicators.stochasticRSI.kPeriod}
                        min={1} max={20}
                    />
                    <SettingsSlider 
                        label="D Period" 
                        bind:value={$settings.indicators.stochasticRSI.dPeriod}
                        min={1} max={20}
                    />
                {/if}
            </div>
        </SettingsSection>

        {#if $settings.indicators?.kalman}
        <SettingsSection title="Kalman Filter">
            <div class="space-y-3">
                <label class="flex items-center gap-2 text-sm text-text-secondary">
                    <input 
                        type="checkbox" 
                        bind:checked={$settings.indicators.kalman.enabled}
                        class="rounded border-border bg-surface-light"
                    />
                    Enabled
                </label>
                {#if $settings.indicators.kalman.enabled}
                    <SettingsSlider 
                        label="Process Noise" 
                        bind:value={$settings.indicators.kalman.processNoise}
                        min={0.001} max={0.1} step={0.001}
                    />
                    <SettingsSlider 
                        label="Measurement Noise" 
                        bind:value={$settings.indicators.kalman.measurementNoise}
                        min={0.01} max={1} step={0.01}
                    />
                {/if}
            </div>
        </SettingsSection>
        {/if}
    </div>
</aside>
