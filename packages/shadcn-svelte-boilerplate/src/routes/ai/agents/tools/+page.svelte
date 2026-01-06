<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Switch } from '$lib/components/ui/switch';
    import { Badge } from '$lib/components/ui/badge';
    import { Input } from '$lib/components/ui/input';
    import { Search, Plus, Settings, Check, Globe, Code, Database, FileText, Calculator, Image, Terminal } from 'lucide-svelte';

    const tools = [
        { name: 'Web Search', description: 'Search the internet for information', icon: Globe, enabled: true, category: 'Search' },
        { name: 'Code Interpreter', description: 'Execute Python code in sandbox', icon: Terminal, enabled: true, category: 'Code' },
        { name: 'SQL Query', description: 'Run queries against databases', icon: Database, enabled: false, category: 'Data' },
        { name: 'Document Reader', description: 'Parse and extract from documents', icon: FileText, enabled: true, category: 'Files' },
        { name: 'Calculator', description: 'Perform mathematical calculations', icon: Calculator, enabled: true, category: 'Utilities' },
        { name: 'Image Generation', description: 'Create images with DALL-E', icon: Image, enabled: false, category: 'Creative' },
        { name: 'API Caller', description: 'Make HTTP requests to APIs', icon: Code, enabled: false, category: 'Integration' }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Tools" description="Configure available agent tools" />
        <Button variant="outline" size="icon">
            <Plus class="h-5 w-5" />
        </Button>
    </div>

    <div class="relative mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tools..." class="pl-10 h-10" />
    </div>

    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">{tools.filter(t => t.enabled).length} of {tools.length} enabled</p>
            <Button variant="ghost" size="sm">Enable All</Button>
        </div>

        {#each tools as tool}
            <Card class={tool.enabled ? 'border-primary/50' : ''}>
                <CardContent class="p-4">
                    <div class="flex items-start gap-4">
                        <div class="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <svelte:component this={tool.icon} class="h-6 w-6 {tool.enabled ? 'text-primary' : 'text-muted-foreground'}" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <p class="font-medium">{tool.name}</p>
                                <Badge variant="outline" class="text-xs">{tool.category}</Badge>
                            </div>
                            <p class="text-sm text-muted-foreground mt-1">{tool.description}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <Button variant="ghost" size="icon" class="h-8 w-8">
                                <Settings class="h-4 w-4" />
                            </Button>
                            <Switch checked={tool.enabled} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        {/each}

        <Card class="border-dashed">
            <CardContent class="p-6 text-center">
                <div class="h-12 w-12 mx-auto rounded-lg bg-muted flex items-center justify-center mb-3">
                    <Plus class="h-6 w-6 text-muted-foreground" />
                </div>
                <p class="font-medium">Create Custom Tool</p>
                <p class="text-sm text-muted-foreground mt-1">Define your own function for the agent</p>
                <Button variant="outline" class="mt-4">Get Started</Button>
            </CardContent>
        </Card>
    </div>
</DashboardLayout>