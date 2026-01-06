<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardFooter } from '$lib/components/ui/card';
    import { Input } from '$lib/components/ui/input';
    import { Badge } from '$lib/components/ui/badge';
    import { Search, ArrowRight, Sparkles, Users, Clock } from 'lucide-svelte';

    const categories = ['All', 'Productivity', 'Development', 'Writing', 'Research', 'Business', 'Creative'];

    const templates = [
        { name: 'Code Reviewer', icon: '🔍', description: 'Automated code review with best practices suggestions', category: 'Development', users: '12K', time: '5 min' },
        { name: 'Meeting Notes', icon: '📝', description: 'Transform meeting transcripts into actionable notes', category: 'Productivity', users: '28K', time: '3 min' },
        { name: 'Blog Writer', icon: '✍️', description: 'Generate SEO-optimized blog posts from outlines', category: 'Writing', users: '15K', time: '10 min' },
        { name: 'Data Extractor', icon: '📊', description: 'Pull structured data from unstructured documents', category: 'Business', users: '8K', time: '2 min' },
        { name: 'Research Assistant', icon: '🔬', description: 'Summarize papers and find related research', category: 'Research', users: '19K', time: '15 min' },
        { name: 'Email Drafter', icon: '📧', description: 'Professional emails from brief descriptions', category: 'Productivity', users: '32K', time: '2 min' },
        { name: 'SQL Generator', icon: '🗃️', description: 'Natural language to SQL query conversion', category: 'Development', users: '11K', time: '1 min' },
        { name: 'Image Describer', icon: '🖼️', description: 'Detailed descriptions and alt-text for images', category: 'Creative', users: '7K', time: '1 min' }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Templates" description="Pre-built agent templates" />
        <Badge variant="secondary" class="gap-1">
            <Sparkles class="h-3 w-3" />
            {templates.length} available
        </Badge>
    </div>

    <div class="relative mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates..." class="pl-10 h-12" />
    </div>

    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        {#each categories as cat, i}
            <Button variant={i === 0 ? 'default' : 'outline'} size="sm" class="rounded-full shrink-0">
                {cat}
            </Button>
        {/each}
    </div>

    <div class="space-y-4">
        <div class="grid gap-4">
            {#each templates as template}
                <Card class="overflow-hidden">
                    <CardContent class="p-4">
                        <div class="flex gap-4">
                            <div class="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">
                                {template.icon}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 class="font-semibold">{template.name}</h3>
                                        <Badge variant="outline" class="mt-1 text-xs">{template.category}</Badge>
                                    </div>
                                </div>
                                <p class="text-sm text-muted-foreground mt-2 line-clamp-2">{template.description}</p>
                                <div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
									<span class="flex items-center gap-1">
										<Users class="h-3 w-3" />
                                        {template.users}
									</span>
                                    <span class="flex items-center gap-1">
										<Clock class="h-3 w-3" />
                                        {template.time} setup
									</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter class="p-4 pt-0">
                        <Button class="w-full gap-2">
                            Use Template
                            <ArrowRight class="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            {/each}
        </div>
    </div>
</DashboardLayout>