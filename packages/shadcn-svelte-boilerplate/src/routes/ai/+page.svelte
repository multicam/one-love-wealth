<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
    import { Plus, Bot, MessageSquare } from 'lucide-svelte';

    const agents = [
        { name: 'Code Assistant', status: 'active', messages: 1420, icon: '💻' },
        { name: 'Data Analyst', status: 'active', messages: 856, icon: '📊' },
        { name: 'Content Writer', status: 'idle', messages: 2103, icon: '✍️' },
        { name: 'Research Bot', status: 'active', messages: 445, icon: '🔬' },
        { name: 'Customer Support', status: 'paused', messages: 3201, icon: '🎧' }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="My Agents" description="Manage your AI agents" />
        <Button size="icon" variant="outline">
            <Plus class="h-5 w-5" />
        </Button>
    </div>

    <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
            <Card class="bg-primary text-primary-foreground">
                <CardContent class="p-4">
                    <Bot class="h-8 w-8 mb-2" />
                    <p class="text-3xl font-bold">5</p>
                    <p class="text-sm opacity-90">Active Agents</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent class="p-4">
                    <MessageSquare class="h-8 w-8 mb-2 text-muted-foreground" />
                    <p class="text-3xl font-bold">8,025</p>
                    <p class="text-sm text-muted-foreground">Total Messages</p>
                </CardContent>
            </Card>
        </div>

        <div class="space-y-3">
            <h2 class="font-semibold text-lg">All Agents</h2>
            {#each agents as agent}
                <Card class="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent class="flex items-center gap-4 p-4">
                        <Avatar class="h-12 w-12">
                            <AvatarFallback class="text-2xl">{agent.icon}</AvatarFallback>
                        </Avatar>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium truncate">{agent.name}</p>
                            <p class="text-sm text-muted-foreground">{agent.messages.toLocaleString()} messages</p>
                        </div>
                        <Badge variant={agent.status === 'active' ? 'default' : agent.status === 'idle' ? 'secondary' : 'outline'}>
                            {agent.status}
                        </Badge>
                    </CardContent>
                </Card>
            {/each}
        </div>
    </div>
</DashboardLayout>