<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
    import { Badge } from '$lib/components/ui/badge';
    import { Search, Filter, MessageSquare } from '@lucide/svelte';

    const conversations = [
        { id: 1, agent: 'Code Assistant', icon: '💻', preview: 'Help me refactor this React component...', time: '2 min ago', messages: 12 },
        { id: 2, agent: 'Data Analyst', icon: '📊', preview: 'Analyze the Q4 sales data and...', time: '1 hour ago', messages: 28 },
        { id: 3, agent: 'Content Writer', icon: '✍️', preview: 'Write a blog post about AI trends...', time: '3 hours ago', messages: 8 },
        { id: 4, agent: 'Research Bot', icon: '🔬', preview: 'Find papers on transformer architecture...', time: 'Yesterday', messages: 45 },
        { id: 5, agent: 'Code Assistant', icon: '💻', preview: 'Debug this Python script that...', time: 'Yesterday', messages: 23 },
        { id: 6, agent: 'Customer Support', icon: '🎧', preview: 'Draft a response for the refund request...', time: '2 days ago', messages: 6 }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="History" description="Browse your conversation history" />
        <Button variant="ghost" size="icon">
            <Filter class="h-5 w-5" />
        </Button>
    </div>

    <div class="relative mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search conversations..." class="pl-10 h-12" />
    </div>

    <div class="space-y-3">
        {#each conversations as conv}
            <Card class="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent class="p-4">
                    <div class="flex items-start gap-3">
                        <Avatar class="h-12 w-12 shrink-0">
                            <AvatarFallback class="text-xl">{conv.icon}</AvatarFallback>
                        </Avatar>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-2">
                                <p class="font-medium truncate">{conv.agent}</p>
                                <span class="text-xs text-muted-foreground shrink-0">{conv.time}</span>
                            </div>
                            <p class="text-sm text-muted-foreground truncate mt-1">{conv.preview}</p>
                            <div class="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" class="gap-1">
                                    <MessageSquare class="h-3 w-3" />
                                    {conv.messages}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        {/each}
    </div>
</DashboardLayout>