<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Plus, Play, ArrowRight, Bot, FileText, Send, Database, MoreVertical } from '@lucide/svelte';

    const nodes = [
        { id: 1, type: 'trigger', icon: FileText, title: 'Document Upload', subtitle: 'When file is uploaded' },
        { id: 2, type: 'agent', icon: Bot, title: 'Data Extractor', subtitle: 'Extract key information' },
        { id: 3, type: 'agent', icon: Bot, title: 'Summarizer', subtitle: 'Generate summary' },
        { id: 4, type: 'action', icon: Database, title: 'Save to DB', subtitle: 'Store results' },
        { id: 5, type: 'action', icon: Send, title: 'Send Email', subtitle: 'Notify team' }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <div>
            <PageHeader title="Workflows" description="Automate multi-step AI processes" />
            <Badge variant="secondary">Draft</Badge>
        </div>
        <div class="flex gap-2">
            <Button variant="outline" size="icon">
                <MoreVertical class="h-5 w-5" />
            </Button>
            <Button class="gap-2">
                <Play class="h-4 w-4" />
                Run
            </Button>
        </div>
    </div>

    <div class="space-y-4">
        <div class="space-y-3">
            {#each nodes as node, i}
                <Card class="relative {node.type === 'trigger' ? 'border-blue-500' : node.type === 'agent' ? 'border-purple-500' : 'border-green-500'}">
                    <CardContent class="flex items-center gap-4 p-4">
                        <div class="h-12 w-12 rounded-lg flex items-center justify-center shrink-0 {node.type === 'trigger' ? 'bg-blue-100 text-blue-600' : node.type === 'agent' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}">
                            <svelte:component this={node.icon} class="h-6 w-6" />
                        </div>
                        <div class="flex-1">
                            <p class="font-medium">{node.title}</p>
                            <p class="text-sm text-muted-foreground">{node.subtitle}</p>
                        </div>
                        <Badge variant="outline">{node.type}</Badge>
                    </CardContent>
                </Card>
                {#if i < nodes.length - 1}
                    <div class="flex justify-center py-1">
                        <ArrowRight class="h-5 w-5 text-muted-foreground rotate-90" />
                    </div>
                {/if}
            {/each}

            <Button variant="outline" class="w-full h-16 border-2 border-dashed gap-2">
                <Plus class="h-5 w-5" />
                Add Step
            </Button>
        </div>
        <div class="flex gap-2 overflow-x-auto pt-4">
            <Button variant="outline" class="shrink-0 gap-2">
                <FileText class="h-4 w-4" />
                Trigger
            </Button>
            <Button variant="outline" class="shrink-0 gap-2">
                <Bot class="h-4 w-4" />
                Agent
            </Button>
            <Button variant="outline" class="shrink-0 gap-2">
                <Database class="h-4 w-4" />
                Action
            </Button>
            <Button variant="outline" class="shrink-0 gap-2">
                <ArrowRight class="h-4 w-4" />
                Condition
            </Button>
        </div>
    </div>
</DashboardLayout>