<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Progress } from '$lib/components/ui/progress';
    import { Badge } from '$lib/components/ui/badge';
    import { Upload, FileText, Database, Globe, Trash2, RefreshCw, Plus } from 'lucide-svelte';

    const sources = [
        { name: 'Product Documentation', type: 'files', items: 45, size: '12.3 MB', status: 'synced', icon: FileText },
        { name: 'Company Wiki', type: 'notion', items: 128, size: '8.7 MB', status: 'syncing', icon: Database },
        { name: 'Support Articles', type: 'web', items: 89, size: '4.2 MB', status: 'synced', icon: Globe },
        { name: 'API Reference', type: 'files', items: 23, size: '2.1 MB', status: 'synced', icon: FileText }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Knowledge Base" description="Manage your agent's knowledge sources" />
        <Button size="icon" variant="outline">
            <Plus class="h-5 w-5" />
        </Button>
    </div>

    <div class="space-y-6">
        <Card>
            <CardContent class="p-6">
                <div class="text-center space-y-4">
                    <div class="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Upload class="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p class="font-medium">Upload Documents</p>
                        <p class="text-sm text-muted-foreground">PDF, TXT, MD, DOCX supported</p>
                    </div>
                    <Button class="w-full h-12">Choose Files</Button>
                </div>
            </CardContent>
        </Card>

        <div>
            <div class="flex items-center justify-between mb-4">
                <h2 class="font-semibold text-lg">Connected Sources</h2>
                <p class="text-sm text-muted-foreground">285 documents</p>
            </div>

            <div class="space-y-3">
                {#each sources as source}
                    <Card>
                        <CardContent class="p-4">
                            <div class="flex items-start gap-4">
                                <div class="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    <svelte:component this={source.icon} class="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <p class="font-medium">{source.name}</p>
                                        <Badge variant={source.status === 'synced' ? 'default' : 'secondary'}>
                                            {#if source.status === 'syncing'}
                                                <RefreshCw class="h-3 w-3 mr-1 animate-spin" />
                                            {/if}
                                            {source.status}
                                        </Badge>
                                    </div>
                                    <p class="text-sm text-muted-foreground">{source.items} items · {source.size}</p>
                                    {#if source.status === 'syncing'}
                                        <Progress value={65} class="mt-2 h-1" />
                                    {/if}
                                </div>
                            </div>
                            <div class="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" class="flex-1">
                                    <RefreshCw class="h-4 w-4 mr-1" />
                                    Sync
                                </Button>
                                <Button variant="outline" size="sm" class="text-destructive">
                                    <Trash2 class="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                {/each}
            </div>
        </div>
        <div class="flex gap-3 pt-4">
            <Button variant="outline" class="flex-1 h-12">Connect Notion</Button>
            <Button variant="outline" class="flex-1 h-12">Add Website</Button>
        </div>
    </div>
</DashboardLayout>