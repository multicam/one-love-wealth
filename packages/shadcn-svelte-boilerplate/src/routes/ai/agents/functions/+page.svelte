<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Switch } from '$lib/components/ui/switch';
    import { Plus, Code, ChevronDown, ChevronUp } from '@lucide/svelte';

    const functions = [
        {
            name: 'search_database',
            description: 'Search the product database for items matching a query',
            parameters: [
                { name: 'query', type: 'string', required: true, description: 'Search query string' },
                { name: 'limit', type: 'number', required: false, description: 'Max results to return' }
            ],
            enabled: true
        },
        {
            name: 'send_email',
            description: 'Send an email to a specified recipient',
            parameters: [
                { name: 'to', type: 'string', required: true, description: 'Recipient email' },
                { name: 'subject', type: 'string', required: true, description: 'Email subject' },
                { name: 'body', type: 'string', required: true, description: 'Email body content' }
            ],
            enabled: true
        },
        {
            name: 'get_weather',
            description: 'Get current weather for a location',
            parameters: [
                { name: 'location', type: 'string', required: true, description: 'City or coordinates' }
            ],
            enabled: false
        }
    ];

    let expandedFunction: string | null = null;
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Functions" description="Define callable functions for agents" />
        <Button size="icon" variant="outline">
            <Plus class="h-5 w-5" />
        </Button>
    </div>

    <div class="space-y-3">
        <Card class="bg-muted/50">
            <CardContent class="p-4">
                <p class="text-sm">
                    Define functions that the agent can call. The model will decide when to use them based on the conversation.
                </p>
            </CardContent>
        </Card>

        {#each functions as fn}
            <Card class={fn.enabled ? '' : 'opacity-60'}>
                <CardContent class="p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Code class="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <code class="font-semibold">{fn.name}</code>
                                    <Badge variant="outline" class="text-xs">{fn.parameters.length} params</Badge>
                                </div>
                                <p class="text-sm text-muted-foreground">{fn.description}</p>
                            </div>
                        </div>
                        <Switch checked={fn.enabled} />
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        class="w-full mt-3 justify-between"
                        onclick={() => expandedFunction = expandedFunction === fn.name ? null : fn.name}
                    >
                        <span>Parameters</span>
                        {#if expandedFunction === fn.name}
                            <ChevronUp class="h-4 w-4" />
                        {:else}
                            <ChevronDown class="h-4 w-4" />
                        {/if}
                    </Button>

                    {#if expandedFunction === fn.name}
                        <div class="mt-3 space-y-2 border-t pt-3">
                            {#each fn.parameters as param}
                                <div class="flex items-center justify-between text-sm">
                                    <div class="flex items-center gap-2">
                                        <code class="text-xs bg-muted px-1 rounded">{param.name}</code>
                                        <span class="text-muted-foreground">{param.type}</span>
                                        {#if param.required}
                                            <Badge variant="destructive" class="text-xs">required</Badge>
                                        {/if}
                                    </div>
                                </div>
                                <p class="text-xs text-muted-foreground pl-2">{param.description}</p>
                            {/each}
                        </div>
                    {/if}
                </CardContent>
            </Card>
        {/each}
        <Button class="w-full h-12 gap-2 mt-4">
            <Plus class="h-5 w-5" />
            Add Function
        </Button>
    </div>
</DashboardLayout>
