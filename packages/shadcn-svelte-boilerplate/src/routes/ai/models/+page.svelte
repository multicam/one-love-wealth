<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
    import { Label } from '$lib/components/ui/label';
    import { Zap, Brain, Sparkles, Check } from '@lucide/svelte';

    let selectedModel = 'claude-opus';

    const models = [
        {
            id: 'claude-opus',
            name: 'Claude Opus 4.5',
            provider: 'Anthropic',
            description: 'Most capable model for complex reasoning and analysis',
            speed: 'Standard',
            context: '200K',
            cost: '$$$',
            badge: 'Recommended'
        },
        {
            id: 'claude-sonnet',
            name: 'Claude Sonnet 4',
            provider: 'Anthropic',
            description: 'Balanced performance and speed for everyday tasks',
            speed: 'Fast',
            context: '200K',
            cost: '$$',
            badge: null
        },
        {
            id: 'gpt-4o',
            name: 'GPT-4o',
            provider: 'OpenAI',
            description: 'Multimodal model with vision and audio capabilities',
            speed: 'Fast',
            context: '128K',
            cost: '$$',
            badge: null
        },
        {
            id: 'gemini-pro',
            name: 'Gemini 2.0 Pro',
            provider: 'Google',
            description: 'Advanced reasoning with long context support',
            speed: 'Fast',
            context: '1M',
            cost: '$$',
            badge: 'Long Context'
        },
        {
            id: 'llama-3',
            name: 'Llama 3.3 70B',
            provider: 'Meta',
            description: 'Open source model for privacy-focused deployments',
            speed: 'Fast',
            context: '128K',
            cost: '$',
            badge: 'Open Source'
        }
    ];
</script>

<DashboardLayout>
    <PageHeader title="Models" description="Select your preferred AI model" />

    <div class="space-y-3">
        <RadioGroup bind:value={selectedModel} class="space-y-3">
            {#each models as model}
                <Card class="cursor-pointer {selectedModel === model.id ? 'border-primary ring-2 ring-primary ring-offset-2' : ''}">
                    <CardContent class="p-4">
                        <div class="flex items-start gap-4">
                            <RadioGroupItem value={model.id} id={model.id} class="mt-1" />
                            <div class="flex-1 space-y-2">
                                <div class="flex items-center justify-between">
                                    <Label for={model.id} class="text-base font-semibold cursor-pointer">
                                        {model.name}
                                    </Label>
                                    {#if model.badge}
                                        <Badge variant="secondary" class="text-xs">{model.badge}</Badge>
                                    {/if}
                                </div>
                                <p class="text-sm text-muted-foreground">{model.provider}</p>
                                <p class="text-sm">{model.description}</p>
                                <div class="flex gap-4 text-xs text-muted-foreground pt-2">
									<span class="flex items-center gap-1">
										<Zap class="h-3 w-3" />
                                        {model.speed}
									</span>
                                    <span class="flex items-center gap-1">
										<Brain class="h-3 w-3" />
                                        {model.context}
									</span>
                                    <span class="flex items-center gap-1">
										<Sparkles class="h-3 w-3" />
                                        {model.cost}
									</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </RadioGroup>
        <Button class="w-full h-12 gap-2 mt-6">
            <Check class="h-5 w-5" />
            Apply Selection
        </Button>
    </div>
</DashboardLayout>