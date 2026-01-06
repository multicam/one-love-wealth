<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
    import { Send, RotateCcw, ThumbsUp, Check } from '@lucide/svelte';

    let prompt = '';

    const agents = [
        { id: 1, name: 'Claude Opus', icon: '🟣', response: 'Here\'s a comprehensive solution using TypeScript with proper error handling and type safety...', time: '2.3s', tokens: 245 },
        { id: 2, name: 'GPT-4o', icon: '🟢', response: 'I\'ll help you with that. Here\'s an implementation that covers the main use cases...', time: '1.8s', tokens: 198 },
        { id: 3, name: 'Gemini Pro', icon: '🔵', response: 'Based on your requirements, here\'s an optimized approach that balances performance...', time: '1.5s', tokens: 212 }
    ];

    let selectedWinner: number | null = null;
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Compare Models" description="Side-by-side model comparison" />
        <Button variant="outline" size="sm" class="gap-2">
            <RotateCcw class="h-4 w-4" />
            Reset
        </Button>
    </div>

    <div class="space-y-4">
            <Card class="bg-muted/50">
                <CardContent class="p-4">
                    <p class="text-sm font-medium mb-2">Prompt</p>
                    <p class="text-sm">"Write a TypeScript function to validate and parse ISO date strings"</p>
                </CardContent>
            </Card>

            <div class="grid gap-4 md:grid-cols-3">
                {#each agents as agent}
                    <Card class="{selectedWinner === agent.id ? 'border-primary ring-2 ring-primary' : ''} relative">
                        {#if selectedWinner === agent.id}
                            <div class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                <Check class="h-4 w-4 text-primary-foreground" />
                            </div>
                        {/if}
                        <CardHeader class="pb-3">
                            <div class="flex items-center gap-3">
                                <Avatar class="h-10 w-10">
                                    <AvatarFallback class="text-lg">{agent.icon}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle class="text-base">{agent.name}</CardTitle>
                                    <div class="flex gap-2 mt-1">
                                        <Badge variant="secondary" class="text-xs">{agent.time}</Badge>
                                        <Badge variant="outline" class="text-xs">{agent.tokens} tokens</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <p class="text-sm text-muted-foreground line-clamp-6">{agent.response}</p>
                            <Button
                                    variant={selectedWinner === agent.id ? 'default' : 'outline'}
                                    class="w-full gap-2"
                                    onclick={() => selectedWinner = agent.id}
                            >
                                <ThumbsUp class="h-4 w-4" />
                                {selectedWinner === agent.id ? 'Selected' : 'Pick Winner'}
                            </Button>
                        </CardContent>
                    </Card>
                {/each}
            </div>

            {#if selectedWinner}
                <Card class="bg-green-50 dark:bg-green-950 border-green-200">
                    <CardContent class="p-4 text-center">
                        <p class="text-sm text-green-800 dark:text-green-200">
                            Thanks for your feedback! This helps us improve model recommendations.
                        </p>
                    </CardContent>
                </Card>
            {/if}
        <div class="flex gap-2 pt-4">
            <Textarea
                bind:value={prompt}
                placeholder="Enter a new prompt to compare..."
                class="min-h-12 max-h-32 resize-none"
            />
            <Button size="icon" class="h-12 w-12 shrink-0">
                <Send class="h-5 w-5" />
            </Button>
        </div>
    </div>
</DashboardLayout>