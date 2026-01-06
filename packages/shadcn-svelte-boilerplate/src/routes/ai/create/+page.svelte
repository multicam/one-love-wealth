<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Sparkles } from 'lucide-svelte';

    const models = ['Claude Opus 4.5', 'Claude Sonnet 4', 'GPT-4o', 'Gemini Pro'];
    const templates = [
        { icon: '💻', name: 'Coding Assistant' },
        { icon: '✍️', name: 'Content Writer' },
        { icon: '📊', name: 'Data Analyst' },
        { icon: '🎨', name: 'Creative Partner' },
        { icon: '📚', name: 'Research Helper' },
        { icon: '🤝', name: 'Customer Support' }
    ];
</script>

<DashboardLayout>
    <PageHeader title="Create Agent" description="Configure a new AI agent" />

    <div class="space-y-6">
        <div class="space-y-2">
            <Label class="text-base">Start from template</Label>
            <div class="grid grid-cols-3 gap-3">
                {#each templates as template}
                    <Card class="cursor-pointer hover:border-primary transition-colors">
                        <CardContent class="flex flex-col items-center p-4 text-center">
                            <span class="text-3xl mb-2">{template.icon}</span>
                            <span class="text-xs">{template.name}</span>
                        </CardContent>
                    </Card>
                {/each}
            </div>
        </div>

        <div class="space-y-2">
            <Label for="name">Agent Name</Label>
            <Input id="name" placeholder="My awesome agent" class="h-12" />
        </div>

        <div class="space-y-2">
            <Label for="model">Model</Label>
            <select class="h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select a model</option>
                {#each models as model}
                    <option value={model}>{model}</option>
                {/each}
            </select>
        </div>

        <div class="space-y-2">
            <Label for="instructions">System Instructions</Label>
            <Textarea
                    id="instructions"
                    placeholder="You are a helpful assistant that..."
                    class="min-h-32 resize-none"
            />
        </div>

        <div class="space-y-2">
            <Label for="greeting">Welcome Message</Label>
            <Input
                    id="greeting"
                    placeholder="Hello! How can I help you today?"
                    class="h-12"
            />
        </div>
        <Button class="w-full h-14 text-base gap-2 mt-8">
            <Sparkles class="h-5 w-5" />
            Create Agent
        </Button>
    </div>
</DashboardLayout>