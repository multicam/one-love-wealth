<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Badge } from '$lib/components/ui/badge';
    import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
    import { Label } from '$lib/components/ui/label';
    import { ThumbsUp, ThumbsDown, Flag, Send } from '@lucide/svelte';

    let rating = '';
    let feedbackType = '';
</script>

<DashboardLayout>
    <PageHeader title="Rate Response" description="Provide feedback on AI responses" />

    <div class="space-y-6 pb-32">
        <Card class="bg-muted/50">
            <CardContent class="p-4">
                <p class="text-sm font-medium mb-2">Agent Response</p>
                <p class="text-sm text-muted-foreground">
                    "Here's a TypeScript function that validates email addresses using a regex pattern..."
                </p>
                <Badge variant="secondary" class="mt-2">Code Assistant</Badge>
            </CardContent>
        </Card>

        <div class="space-y-3">
            <Label class="text-base">How was this response?</Label>
            <div class="grid grid-cols-2 gap-4">
                <Button
                        variant={rating === 'good' ? 'default' : 'outline'}
                        class="h-20 flex-col gap-2"
                        onclick={() => rating = 'good'}
                >
                    <ThumbsUp class="h-6 w-6" />
                    <span>Helpful</span>
                </Button>
                <Button
                        variant={rating === 'bad' ? 'destructive' : 'outline'}
                        class="h-20 flex-col gap-2"
                        onclick={() => rating = 'bad'}
                >
                    <ThumbsDown class="h-6 w-6" />
                    <span>Not Helpful</span>
                </Button>
            </div>
        </div>

        {#if rating}
            <div class="space-y-3">
                <Label class="text-base">What went {rating === 'good' ? 'well' : 'wrong'}?</Label>
                <RadioGroup bind:value={feedbackType} class="space-y-2">
                    {#each rating === 'good'
                        ? ['Accurate information', 'Clear explanation', 'Good code quality', 'Fast response', 'Other']
                        : ['Incorrect information', 'Unclear explanation', 'Code didn\'t work', 'Too slow', 'Off-topic', 'Other']
                            as option}
                        <div class="flex items-center space-x-3 p-3 rounded-lg border">
                            <RadioGroupItem value={option} id={option} />
                            <Label for={option} class="flex-1 cursor-pointer">{option}</Label>
                        </div>
                    {/each}
                </RadioGroup>
            </div>

            <div class="space-y-2">
                <Label for="details">Additional details (optional)</Label>
                <Textarea
                        id="details"
                        placeholder="Tell us more about your experience..."
                        class="min-h-24"
                />
            </div>
        {/if}
        <div class="flex gap-3 pt-6">
            <Button class="flex-1 h-12 gap-2" disabled={!rating}>
                <Send class="h-4 w-4" />
                Submit Feedback
            </Button>
            <Button variant="ghost" class="gap-2 text-muted-foreground">
                <Flag class="h-4 w-4" />
                Report
            </Button>
        </div>
    </div>
</DashboardLayout>