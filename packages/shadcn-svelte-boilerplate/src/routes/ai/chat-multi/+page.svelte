<script lang="ts">
    import { DashboardLayout } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
    import { Badge } from '$lib/components/ui/badge';
    import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '$lib/components/ui/sheet';
    import { Send, Users, Plus, X } from 'lucide-svelte';

    const activeAgents = [
        { id: 1, name: 'Code Assistant', icon: '💻', color: 'bg-blue-500' },
        { id: 2, name: 'Data Analyst', icon: '📊', color: 'bg-green-500' },
        { id: 3, name: 'Research Bot', icon: '🔬', color: 'bg-purple-500' }
    ];

    const messages = [
        { agent: 'Code Assistant', icon: '💻', content: 'I can help structure the API endpoints for this project.' },
        { agent: 'Data Analyst', icon: '📊', content: 'Based on the data patterns, I suggest implementing pagination with a limit of 50 items per request.' },
        { agent: 'Research Bot', icon: '🔬', content: 'I found several papers on REST API best practices. The consensus suggests using cursor-based pagination for large datasets.' },
        { agent: 'user', content: 'Great insights! Can you work together to create a comprehensive API design?' },
        { agent: 'Code Assistant', icon: '💻', content: 'Absolutely! Here\'s my proposal combining everyone\'s suggestions...' }
    ];
</script>

<DashboardLayout noPadding>
<div class="flex h-full flex-col">
    <header class="flex items-center justify-between border-b bg-background p-4">
        <div>
            <h1 class="font-semibold">Multi-Agent Chat</h1>
            <p class="text-xs text-muted-foreground">{activeAgents.length} agents active</p>
        </div>
        <Sheet>
            <SheetTrigger>
                <Button variant="outline" size="sm" class="gap-2">
                    <Users class="h-4 w-4" />
                    Agents
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Active Agents</SheetTitle>
                </SheetHeader>
                <div class="mt-4 space-y-3">
                    {#each activeAgents as agent}
                        <div class="flex items-center justify-between p-3 rounded-lg border">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">{agent.icon}</span>
                                <span class="font-medium">{agent.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" class="h-8 w-8">
                                <X class="h-4 w-4" />
                            </Button>
                        </div>
                    {/each}
                    <Button variant="outline" class="w-full gap-2">
                        <Plus class="h-4 w-4" />
                        Add Agent
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    </header>

    <div class="flex gap-2 overflow-x-auto p-2 border-b">
        {#each activeAgents as agent}
            <Badge variant="secondary" class="gap-1 shrink-0 py-1 px-2">
                <span>{agent.icon}</span>
                <span class="text-xs">{agent.name}</span>
            </Badge>
        {/each}
    </div>

    <div class="flex-1 p-4 overflow-auto">
        <div class="space-y-4">
            {#each messages as msg}
                <div class="flex gap-3 {msg.agent === 'user' ? 'flex-row-reverse' : ''}">
                    {#if msg.agent !== 'user'}
                        <Avatar class="h-8 w-8 shrink-0">
                            <AvatarFallback>{msg.icon}</AvatarFallback>
                        </Avatar>
                    {/if}
                    <div class="max-w-[80%]">
                        {#if msg.agent !== 'user'}
                            <p class="text-xs text-muted-foreground mb-1">{msg.agent}</p>
                        {/if}
                        <div class="rounded-2xl px-4 py-2 {msg.agent === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}">
                            <p class="text-sm">{msg.content}</p>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="border-t bg-background p-4">
        <div class="flex items-center gap-2">
            <Input placeholder="Message all agents..." class="h-12 flex-1 rounded-full" />
            <Button size="icon" class="h-12 w-12 shrink-0 rounded-full">
                <Send class="h-5 w-5" />
            </Button>
        </div>
    </div>
</div>
</DashboardLayout>