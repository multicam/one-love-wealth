<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { Input } from '$lib/components/ui/input';
    import { Badge } from '$lib/components/ui/badge';
    import { Switch } from '$lib/components/ui/switch';
    import { Label } from '$lib/components/ui/label';
    import { Separator } from '$lib/components/ui/separator';
    import { Brain, Search, Trash2, Plus, Clock, Tag, Pin, Edit2 } from 'lucide-svelte';

    const memories = [
        { id: 1, content: 'User prefers TypeScript over JavaScript for all code examples', type: 'preference', pinned: true, created: '2 days ago' },
        { id: 2, content: 'Working on a SvelteKit e-commerce project called "ShopFlow"', type: 'context', pinned: true, created: '1 week ago' },
        { id: 3, content: 'User is a senior engineer with 8 years of experience', type: 'fact', pinned: false, created: '2 weeks ago' },
        { id: 4, content: 'Prefers concise responses without excessive explanation', type: 'preference', pinned: false, created: '3 weeks ago' },
        { id: 5, content: 'Uses Tailwind CSS for styling, avoid inline styles', type: 'preference', pinned: false, created: '1 month ago' }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Memory" description="Manage agent long-term memory" />
        <Button size="icon" variant="outline">
            <Plus class="h-5 w-5" />
        </Button>
    </div>

    <div class="relative mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search memories..." class="pl-10 h-10" />
    </div>

    <div class="space-y-4">
        <Card>
            <CardHeader class="pb-3">
                <CardTitle class="text-base flex items-center gap-2">
                    <Brain class="h-5 w-5" />
                    Memory Settings
                </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Auto-extract memories</Label>
                        <p class="text-sm text-muted-foreground">Learn from conversations</p>
                    </div>
                    <Switch checked />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Cross-conversation memory</Label>
                        <p class="text-sm text-muted-foreground">Remember across sessions</p>
                    </div>
                    <Switch checked />
                </div>
            </CardContent>
        </Card>

        <div class="flex items-center justify-between">
            <h2 class="font-semibold">Stored Memories</h2>
            <Badge variant="secondary">{memories.length} items</Badge>
        </div>

        <div class="space-y-3">
            {#each memories as memory}
                <Card class={memory.pinned ? 'border-primary/50' : ''}>
                    <CardContent class="p-4">
                        <div class="flex items-start gap-3">
                            {#if memory.pinned}
                                <Pin class="h-4 w-4 text-primary shrink-0 mt-1" />
                            {/if}
                            <div class="flex-1 min-w-0">
                                <p class="text-sm">{memory.content}</p>
                                <div class="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" class="text-xs">
                                        <Tag class="h-3 w-3 mr-1" />
                                        {memory.type}
                                    </Badge>
                                    <span class="text-xs text-muted-foreground flex items-center gap-1">
										<Clock class="h-3 w-3" />
                                        {memory.created}
									</span>
                                </div>
                            </div>
                            <div class="flex gap-1">
                                <Button variant="ghost" size="icon" class="h-8 w-8">
                                    <Edit2 class="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive">
                                    <Trash2 class="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>
        <Button variant="destructive" class="w-full h-12 gap-2 mt-4">
            <Trash2 class="h-5 w-5" />
            Clear All Memories
        </Button>
    </div>
</DashboardLayout>