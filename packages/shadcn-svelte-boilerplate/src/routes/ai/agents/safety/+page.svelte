<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { Switch } from '$lib/components/ui/switch';
    import { Label } from '$lib/components/ui/label';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Badge } from '$lib/components/ui/badge';
    import { Separator } from '$lib/components/ui/separator';
    import { Shield, AlertTriangle, Ban, Eye, FileWarning, Lock } from 'lucide-svelte';

    let toxicityThreshold = [0.7];
    let piiDetection = true;
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Safety & Guardrails" description="Content moderation settings" />
        <Badge variant="default" class="gap-1">
            <Shield class="h-3 w-3" />
            Protected
        </Badge>
    </div>

    <div class="space-y-4">
        <Card class="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent class="flex gap-3 p-4">
                <Shield class="h-5 w-5 text-green-600 shrink-0" />
                <div>
                    <p class="font-medium text-green-800 dark:text-green-200">Safety Status: Good</p>
                    <p class="text-sm text-green-700 dark:text-green-300">All guardrails active and functioning</p>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Ban class="h-5 w-5" />
                    Content Filtering
                </CardTitle>
                <CardDescription>Block harmful or inappropriate content</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Block Harmful Content</Label>
                        <p class="text-sm text-muted-foreground">Violence, self-harm, illegal activities</p>
                    </div>
                    <Switch checked />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Block Adult Content</Label>
                        <p class="text-sm text-muted-foreground">Explicit or NSFW material</p>
                    </div>
                    <Switch checked />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Block Hate Speech</Label>
                        <p class="text-sm text-muted-foreground">Discriminatory or hateful language</p>
                    </div>
                    <Switch checked />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <AlertTriangle class="h-5 w-5" />
                    Toxicity Detection
                </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <Label>Sensitivity Threshold</Label>
                        <span class="text-sm text-muted-foreground">{toxicityThreshold[0]}</span>
                    </div>
                    <input type="range" bind:value={toxicityThreshold[0]} min="0" max="1" step="0.1" class="w-full" />
                    <p class="text-xs text-muted-foreground">
                        Higher = more strict filtering (may have false positives)
                    </p>
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Flag for Review</Label>
                        <p class="text-sm text-muted-foreground">Queue borderline content for human review</p>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Eye class="h-5 w-5" />
                    PII Protection
                </CardTitle>
                <CardDescription>Detect and redact personal information</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Enable PII Detection</Label>
                        <p class="text-sm text-muted-foreground">Auto-detect personal data</p>
                    </div>
                    <Switch bind:checked={piiDetection} />
                </div>

                {#if piiDetection}
                    <div class="space-y-2 pl-4 border-l-2">
                        {#each ['Email addresses', 'Phone numbers', 'Credit cards', 'SSN / ID numbers', 'Physical addresses'] as item}
                            <div class="flex items-center justify-between">
                                <Label class="font-normal">{item}</Label>
                                <Switch checked />
                            </div>
                        {/each}
                    </div>
                {/if}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Lock class="h-5 w-5" />
                    Topic Restrictions
                </CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
                <Label>Blocked Topics</Label>
                <Textarea
                        placeholder="Enter topics to block, one per line:&#10;medical advice&#10;legal guidance&#10;financial recommendations"
                        class="min-h-24"
                />
                <p class="text-xs text-muted-foreground">
                    Agent will decline to discuss these topics and suggest appropriate resources
                </p>
            </CardContent>
        </Card>
        <Button class="w-full h-12 mt-4">Save Safety Settings</Button>
    </div>
</DashboardLayout>