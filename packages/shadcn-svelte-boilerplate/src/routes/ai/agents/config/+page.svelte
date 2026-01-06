<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Switch } from '$lib/components/ui/switch';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Separator } from '$lib/components/ui/separator';
    import { Trash2 } from 'lucide-svelte';

    let temperature = [0.7];
    let maxTokens = [2048];
</script>

<DashboardLayout>
    <PageHeader title="Agent Config" description="Configure agent settings and parameters" />

    <div class="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="name">Name</Label>
                    <Input id="name" value="Code Assistant" class="h-12" />
                </div>
                <div class="space-y-2">
                    <Label for="description">Description</Label>
                    <Textarea id="description" value="Helps with coding tasks and debugging" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Model Parameters</CardTitle>
                <CardDescription>Fine-tune the agent's behavior</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="space-y-4">
                    <div class="flex justify-between">
                        <Label>Temperature</Label>
                        <span class="text-sm text-muted-foreground">{temperature[0]}</span>
                    </div>
                    <input type="range" bind:value={temperature[0]} min="0" max="2" step="0.1" class="w-full" />
                    <p class="text-xs text-muted-foreground">Higher = more creative, Lower = more focused</p>
                </div>

                <Separator />

                <div class="space-y-4">
                    <div class="flex justify-between">
                        <Label>Max Tokens</Label>
                        <span class="text-sm text-muted-foreground">{maxTokens[0]}</span>
                    </div>
                    <input type="range" bind:value={maxTokens[0]} min="256" max="8192" step="256" class="w-full" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Capabilities</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Web Search</Label>
                        <p class="text-sm text-muted-foreground">Allow agent to search the web</p>
                    </div>
                    <Switch />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Code Execution</Label>
                        <p class="text-sm text-muted-foreground">Run code in sandbox</p>
                    </div>
                    <Switch checked />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>File Upload</Label>
                        <p class="text-sm text-muted-foreground">Process uploaded files</p>
                    </div>
                    <Switch checked />
                </div>
            </CardContent>
        </Card>

        <Card class="border-destructive">
            <CardHeader>
                <CardTitle class="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="destructive" class="w-full h-12 gap-2">
                    <Trash2 class="h-4 w-4" />
                    Delete Agent
                </Button>
            </CardContent>
        </Card>
        <Button class="w-full h-14 text-base mt-4">Save Changes</Button>
    </div>
</DashboardLayout>