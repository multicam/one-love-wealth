<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Label } from '$lib/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
    import { Plus, Key, Eye, EyeOff, Copy, Trash2 } from '@lucide/svelte';

    const keys = [
        { name: 'Production Key', key: 'sk-...abc123', created: 'Dec 15, 2025', lastUsed: '2 hours ago', status: 'active' },
        { name: 'Development', key: 'sk-...def456', created: 'Nov 20, 2025', lastUsed: 'Yesterday', status: 'active' },
        { name: 'Testing', key: 'sk-...ghi789', created: 'Oct 5, 2025', lastUsed: '30 days ago', status: 'inactive' }
    ];

    let showKey = false;
</script>

<DashboardLayout>
    <PageHeader title="API Keys" description="Manage your API authentication keys" />

    <div class="space-y-4">
        <Card class="bg-muted/50">
            <CardContent class="p-4">
                <p class="text-sm text-muted-foreground">
                    API keys are used to authenticate requests to the API. Keep them secret and never share them publicly.
                </p>
            </CardContent>
        </Card>

        <div class="space-y-3">
            {#each keys as apiKey}
                <Card>
                    <CardContent class="p-4 space-y-4">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-3">
                                <div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Key class="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p class="font-medium">{apiKey.name}</p>
                                    <p class="text-xs text-muted-foreground">Created {apiKey.created}</p>
                                </div>
                            </div>
                            <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                                {apiKey.status}
                            </Badge>
                        </div>

                        <div class="flex items-center gap-2">
                            <Input
                                    value={showKey ? 'sk-1234567890abcdefghijklmnop' : apiKey.key}
                                    readonly
                                    class="font-mono text-sm"
                            />
                            <Button variant="ghost" size="icon" onclick={() => showKey = !showKey}>
                                {#if showKey}
                                    <EyeOff class="h-4 w-4" />
                                {:else}
                                    <Eye class="h-4 w-4" />
                                {/if}
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Copy class="h-4 w-4" />
                            </Button>
                        </div>

                        <div class="flex items-center justify-between text-sm">
                            <span class="text-muted-foreground">Last used: {apiKey.lastUsed}</span>
                            <Button variant="ghost" size="sm" class="text-destructive h-8">
                                <Trash2 class="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>
        <Dialog>
            <DialogTrigger>
                <Button class="w-full h-12 gap-2">
                    <Plus class="h-5 w-5" />
                    Create New Key
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                </DialogHeader>
                <div class="space-y-4 py-4">
                    <div class="space-y-2">
                        <Label for="keyName">Key Name</Label>
                        <Input id="keyName" placeholder="e.g., Production" class="h-12" />
                    </div>
                    <Button class="w-full h-12">Generate Key</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</DashboardLayout>