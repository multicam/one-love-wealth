<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Badge } from '$lib/components/ui/badge';
    import { Label } from '$lib/components/ui/label';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Separator } from '$lib/components/ui/separator';
    import { Play, Save, History, Wand2, Copy, RotateCcw, Sparkles, Zap } from '@lucide/svelte';

    let systemPrompt = `You are a helpful coding assistant. You:
- Write clean, well-documented code
- Explain your reasoning step by step
- Use TypeScript by default
- Follow best practices`;

    let userPrompt = 'Create a function to validate email addresses';
    let temperature = [0.7];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Prompt Studio" description="Design and test your prompts" />
        <div class="flex gap-2">
            <Button variant="outline" size="sm" class="gap-1">
                <History class="h-4 w-4" />
                History
            </Button>
            <Button variant="outline" size="sm" class="gap-1">
                <Save class="h-4 w-4" />
                Save
            </Button>
        </div>
    </div>

    <div class="space-y-4">
        <Tabs value="system">
            <TabsList class="w-full">
                <TabsTrigger value="system" class="flex-1">System</TabsTrigger>
                <TabsTrigger value="user" class="flex-1">User</TabsTrigger>
                <TabsTrigger value="params" class="flex-1">Params</TabsTrigger>
            </TabsList>

            <TabsContent value="system" class="mt-4 space-y-4">
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <Label>System Prompt</Label>
                        <Button variant="ghost" size="sm" class="gap-1 h-7">
                            <Wand2 class="h-3 w-3" />
                            Enhance
                        </Button>
                    </div>
                    <Textarea
                            bind:value={systemPrompt}
                            class="min-h-48 font-mono text-sm"
                            placeholder="You are a helpful assistant..."
                    />
                    <div class="flex justify-between text-xs text-muted-foreground">
                        <span>{systemPrompt.split(' ').length} words</span>
                        <span>~{Math.ceil(systemPrompt.length / 4)} tokens</span>
                    </div>
                </div>

                <Card class="bg-muted/50">
                    <CardContent class="p-3">
                        <p class="text-sm font-medium mb-2">Quick Templates</p>
                        <div class="flex flex-wrap gap-2">
                            {#each ['Coding', 'Writing', 'Analysis', 'Creative', 'Concise'] as template}
                                <Button variant="outline" size="sm">{template}</Button>
                            {/each}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="user" class="mt-4 space-y-4">
                <div class="space-y-2">
                    <Label>User Message</Label>
                    <Textarea
                            bind:value={userPrompt}
                            class="min-h-32 font-mono text-sm"
                            placeholder="Enter your test prompt..."
                    />
                </div>

                <div class="space-y-2">
                    <Label>Variables</Label>
                    <Card>
                        <CardContent class="p-3 space-y-2">
                            <p class="text-xs text-muted-foreground">Use {'{{variable}}'} syntax in your prompts</p>
                            <div class="flex gap-2">
                                <Badge variant="secondary">{'{{language}}'}</Badge>
                                <Badge variant="secondary">{'{{context}}'}</Badge>
                                <Button variant="ghost" size="sm">+ Add</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="params" class="mt-4 space-y-6">
                <div class="space-y-4">
                    <div class="flex justify-between">
                        <Label>Temperature</Label>
                        <span class="text-sm text-muted-foreground">{temperature[0]}</span>
                    </div>
                    <input type="range" bind:value={temperature[0]} min="0" max="2" step="0.1" class="w-full" />
                    <p class="text-xs text-muted-foreground">
                        Lower = focused & deterministic, Higher = creative & varied
                    </p>
                </div>

                <Separator />

                <div class="space-y-3">
                    <Label>Presets</Label>
                    <div class="grid grid-cols-2 gap-3">
                        <Button variant="outline" class="h-auto py-3 flex-col">
                            <Zap class="h-5 w-5 mb-1" />
                            <span class="text-xs">Precise</span>
                            <span class="text-xs text-muted-foreground">temp: 0.2</span>
                        </Button>
                        <Button variant="outline" class="h-auto py-3 flex-col">
                            <Sparkles class="h-5 w-5 mb-1" />
                            <span class="text-xs">Creative</span>
                            <span class="text-xs text-muted-foreground">temp: 1.2</span>
                        </Button>
                    </div>
                </div>
            </TabsContent>
        </Tabs>

        <Card>
            <CardHeader class="pb-2">
                <CardTitle class="text-base">Response Preview</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="bg-muted rounded-lg p-4 min-h-32">
                    <p class="text-sm text-muted-foreground italic">Run the prompt to see the response...</p>
                </div>
                <div class="flex justify-between mt-3">
                    <div class="flex gap-4 text-xs text-muted-foreground">
                        <span>Latency: --</span>
                        <span>Tokens: --</span>
                    </div>
                    <Button variant="ghost" size="sm" class="gap-1">
                        <Copy class="h-3 w-3" />
                        Copy
                    </Button>
                </div>
            </CardContent>
        </Card>
        <div class="flex gap-3 pt-4">
            <Button variant="outline" class="gap-2">
                <RotateCcw class="h-4 w-4" />
                Reset
            </Button>
            <Button class="flex-1 h-12 gap-2">
                <Play class="h-5 w-5" />
                Run Prompt
            </Button>
        </div>
    </div>
</DashboardLayout>