<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { Switch } from '$lib/components/ui/switch';
    import { Label } from '$lib/components/ui/label';
    import { Input } from '$lib/components/ui/input';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Badge } from '$lib/components/ui/badge';
    import { ArrowRight, Plus, Users, MessageSquare, Zap, Settings } from '@lucide/svelte';

    const handoffRules = [
        { id: 1, trigger: 'Intent: billing_question', target: 'Billing Assistant', priority: 'high' },
        { id: 2, trigger: 'Sentiment: frustrated', target: 'Human Agent', priority: 'urgent' },
        { id: 3, trigger: 'Topic: technical_support', target: 'Tech Support Bot', priority: 'normal' },
        { id: 4, trigger: 'Keyword: refund', target: 'Refund Specialist', priority: 'high' }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Handoff Rules" description="Configure agent handoff triggers" />
        <Button size="icon" variant="outline">
            <Plus class="h-5 w-5" />
        </Button>
    </div>

    <div class="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle class="text-base">Handoff Settings</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Enable Auto-Handoff</Label>
                        <p class="text-sm text-muted-foreground">Automatically transfer conversations</p>
                    </div>
                    <Switch checked />
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Preserve Context</Label>
                        <p class="text-sm text-muted-foreground">Send conversation history to target</p>
                    </div>
                    <Switch checked />
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Notify User</Label>
                        <p class="text-sm text-muted-foreground">Inform user about the transfer</p>
                    </div>
                    <Switch checked />
                </div>
            </CardContent>
        </Card>

        <div class="flex items-center justify-between">
            <h2 class="font-semibold">Active Rules</h2>
            <Badge variant="secondary">{handoffRules.length} rules</Badge>
        </div>

        <div class="space-y-3">
            {#each handoffRules as rule}
                <Card>
                    <CardContent class="p-4">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Zap class="h-5 w-5 text-blue-600" />
                            </div>
                            <ArrowRight class="h-4 w-4 text-muted-foreground" />
                            <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Users class="h-5 w-5 text-green-600" />
                            </div>
                        </div>

                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <p class="font-medium text-sm">{rule.trigger}</p>
                                <Badge variant={rule.priority === 'urgent' ? 'destructive' : rule.priority === 'high' ? 'default' : 'secondary'}>
                                    {rule.priority}
                                </Badge>
                            </div>
                            <p class="text-sm text-muted-foreground">→ Transfer to: {rule.target}</p>
                        </div>

                        <div class="flex gap-2 mt-3">
                            <Button variant="outline" size="sm" class="flex-1">
                                <Settings class="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                            <Button variant="ghost" size="sm" class="text-destructive">Remove</Button>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>

        <Card class="border-dashed">
            <CardContent class="p-6">
                <h3 class="font-medium mb-4">Create New Rule</h3>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label>Trigger Condition</Label>
                        <select class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">Select trigger type</option>
                            <option value="intent">User Intent</option>
                            <option value="sentiment">Sentiment Score</option>
                            <option value="keyword">Keyword Match</option>
                            <option value="topic">Topic Detection</option>
                            <option value="confidence">Low Confidence</option>
                        </select>
                    </div>

                    <div class="space-y-2">
                        <Label>Condition Value</Label>
                        <Input placeholder="e.g., billing_question, frustrated, refund" />
                    </div>

                    <div class="space-y-2">
                        <Label>Target Agent</Label>
                        <select class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">Select target</option>
                            <option value="billing">Billing Assistant</option>
                            <option value="tech">Tech Support Bot</option>
                            <option value="human">Human Agent</option>
                            <option value="refund">Refund Specialist</option>
                        </select>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Button class="w-full h-12 mt-4">Save Rules</Button>
    </div>
</DashboardLayout>