<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Progress } from '$lib/components/ui/progress';
    import { Eye, FileText, MessageSquare, Wrench, Brain, AlertTriangle } from '@lucide/svelte';

    const contextBlocks = [
        { type: 'system', label: 'System Prompt', tokens: 1250, color: 'bg-blue-500' },
        { type: 'memory', label: 'Long-term Memory', tokens: 800, color: 'bg-purple-500' },
        { type: 'knowledge', label: 'Knowledge Base', tokens: 3200, color: 'bg-green-500' },
        { type: 'tools', label: 'Tool Definitions', tokens: 450, color: 'bg-orange-500' },
        { type: 'history', label: 'Conversation History', tokens: 8500, color: 'bg-gray-500' },
        { type: 'current', label: 'Current Message', tokens: 320, color: 'bg-primary' }
    ];

    const totalTokens = contextBlocks.reduce((sum, b) => sum + b.tokens, 0);
    const maxTokens = 200000;
    const usagePercent = (totalTokens / maxTokens) * 100;
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Context Debug" description="Debug & visualize context window" />
        <Button variant="outline" size="sm" class="gap-1">
            <Eye class="h-4 w-4" />
            Raw
        </Button>
    </div>

    <div class="space-y-6">
        <Card>
            <CardHeader class="pb-2">
                <div class="flex items-center justify-between">
                    <CardTitle class="text-base">Token Usage</CardTitle>
                    <Badge variant={usagePercent > 80 ? 'destructive' : 'secondary'}>
                        {totalTokens.toLocaleString()} / {maxTokens.toLocaleString()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent class="space-y-4">
                <Progress value={usagePercent} class="h-4" />

                <div class="flex h-8 rounded-lg overflow-hidden">
                    {#each contextBlocks as block}
                        <div
                                class="{block.color} transition-all"
                                style="width: {(block.tokens / totalTokens) * 100}%"
                                title="{block.label}: {block.tokens} tokens"
                        ></div>
                    {/each}
                </div>

                <div class="grid grid-cols-2 gap-2">
                    {#each contextBlocks as block}
                        <div class="flex items-center gap-2 text-sm">
                            <div class="h-3 w-3 rounded {block.color}"></div>
                            <span class="text-muted-foreground">{block.label}</span>
                            <span class="ml-auto font-mono text-xs">{block.tokens}</span>
                        </div>
                    {/each}
                </div>
            </CardContent>
        </Card>

        {#if usagePercent > 80}
            <Card class="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <CardContent class="flex gap-3 p-4">
                    <AlertTriangle class="h-5 w-5 text-yellow-600 shrink-0" />
                    <div>
                        <p class="font-medium text-yellow-800 dark:text-yellow-200">High context usage</p>
                        <p class="text-sm text-yellow-700 dark:text-yellow-300">Consider summarizing history or reducing knowledge base context.</p>
                    </div>
                </CardContent>
            </Card>
        {/if}

        <div class="space-y-3">
            <h2 class="font-semibold">Context Breakdown</h2>

            {#each contextBlocks as block}
                <Card>
                    <CardContent class="p-4">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <div class="h-10 w-10 rounded-lg {block.color} bg-opacity-20 flex items-center justify-center">
                                    {#if block.type === 'system'}
                                        <FileText class="h-5 w-5" />
                                    {:else if block.type === 'memory'}
                                        <Brain class="h-5 w-5" />
                                    {:else if block.type === 'tools'}
                                        <Wrench class="h-5 w-5" />
                                    {:else}
                                        <MessageSquare class="h-5 w-5" />
                                    {/if}
                                </div>
                                <div>
                                    <p class="font-medium">{block.label}</p>
                                    <p class="text-sm text-muted-foreground">{block.tokens.toLocaleString()} tokens</p>
                                </div>
                            </div>
                            <Badge variant="outline">{((block.tokens / totalTokens) * 100).toFixed(1)}%</Badge>
                        </div>
                        <Button variant="outline" size="sm" class="w-full">View Content</Button>
                    </CardContent>
                </Card>
            {/each}
        </div>
    </div>
</DashboardLayout>