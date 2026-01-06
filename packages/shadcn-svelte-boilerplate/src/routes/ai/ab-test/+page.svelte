<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Badge } from '$lib/components/ui/badge';
    import { Progress } from '$lib/components/ui/progress';
    import { Label } from '$lib/components/ui/label';
    import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
    import { Play, ThumbsUp, BarChart, RefreshCw, Shuffle } from '@lucide/svelte';

    let selectedVariant = '';

    const variants = [
        {
            id: 'A',
            name: 'Concise',
            prompt: 'Be brief and to the point. No unnecessary explanations.',
            response: 'Here\'s a TypeScript email validator:\n\n```ts\nconst isValidEmail = (email: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);\n```',
            votes: 156,
            avgRating: 4.2
        },
        {
            id: 'B',
            name: 'Detailed',
            prompt: 'Provide comprehensive explanations with examples and edge cases.',
            response: 'I\'ll create a robust email validation function with detailed explanation:\n\n```ts\n/**\n * Validates email addresses using RFC 5322 pattern\n * @param email - The email string to validate\n * @returns boolean indicating validity\n */\nfunction validateEmail(email: string): boolean {\n  // Pattern breakdown:\n  // - Local part: letters, numbers, dots, hyphens\n  // - @ symbol\n  // - Domain: letters, numbers, dots\n  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;\n  return pattern.test(email.trim().toLowerCase());\n}\n```\n\nThis handles common edge cases like...',
            votes: 142,
            avgRating: 4.5
        }
    ];

    const totalVotes = variants.reduce((sum, v) => sum + v.votes, 0);
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="A/B Testing" description="Compare prompt variations" />
        <Button variant="outline" size="icon">
            <BarChart class="h-5 w-5" />
        </Button>
    </div>

    <div class="space-y-4">
        <Card class="bg-muted/50">
            <CardContent class="p-4">
                <Label class="text-sm font-medium">Test Prompt</Label>
                <p class="text-sm mt-1">"Create a function to validate email addresses in TypeScript"</p>
            </CardContent>
        </Card>

        <div class="grid grid-cols-2 gap-3">
            <Card>
                <CardContent class="p-3 text-center">
                    <p class="text-2xl font-bold">{totalVotes}</p>
                    <p class="text-xs text-muted-foreground">Total Votes</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent class="p-3 text-center">
                    <p class="text-2xl font-bold">52%</p>
                    <p class="text-xs text-muted-foreground">Variant A Wins</p>
                </CardContent>
            </Card>
        </div>

        <RadioGroup bind:value={selectedVariant} class="space-y-4">
            {#each variants as variant}
                <Card class={selectedVariant === variant.id ? 'border-primary ring-2 ring-primary' : ''}>
                    <CardHeader class="pb-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <RadioGroupItem value={variant.id} id={variant.id} />
                                <div>
                                    <Label for={variant.id} class="text-base font-semibold cursor-pointer">
                                        Variant {variant.id}: {variant.name}
                                    </Label>
                                    <p class="text-sm text-muted-foreground">{variant.prompt}</p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <div class="bg-muted rounded-lg p-3 max-h-40 overflow-auto">
                            <pre class="text-xs whitespace-pre-wrap">{variant.response}</pre>
                        </div>

                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span>{variant.votes} votes ({((variant.votes / totalVotes) * 100).toFixed(1)}%)</span>
                                <span>★ {variant.avgRating}</span>
                            </div>
                            <Progress value={(variant.votes / totalVotes) * 100} class="h-2" />
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </RadioGroup>

        <Card class="border-dashed">
            <CardContent class="p-4 text-center">
                <Shuffle class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p class="font-medium">Add Variant C</p>
                <p class="text-sm text-muted-foreground">Test another prompt variation</p>
                <Button variant="outline" class="mt-3">Create Variant</Button>
            </CardContent>
        </Card>
        <div class="flex gap-3 pt-4">
            <Button variant="outline" class="gap-2">
                <RefreshCw class="h-4 w-4" />
                New Test
            </Button>
            <Button class="flex-1 h-12 gap-2" disabled={!selectedVariant}>
                <ThumbsUp class="h-5 w-5" />
                Vote for {selectedVariant || '...'}
            </Button>
        </div>
    </div>
</DashboardLayout>