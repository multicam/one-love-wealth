<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Search, Plus, Copy, Star, Folder, MoreVertical } from '@lucide/svelte';

    const folders = ['All Prompts', 'Favorites', 'Coding', 'Writing', 'Analysis'];
    const prompts = [
        { title: 'Code Review', content: 'Review this code for bugs, security issues, and best practices...', tags: ['coding', 'review'], starred: true },
        { title: 'Blog Post Outline', content: 'Create a detailed outline for a blog post about...', tags: ['writing', 'content'], starred: false },
        { title: 'SQL Query Generator', content: 'Generate a SQL query that...', tags: ['coding', 'database'], starred: true },
        { title: 'Meeting Summary', content: 'Summarize the key points and action items from...', tags: ['productivity'], starred: false },
        { title: 'Bug Report Template', content: 'Create a detailed bug report including steps to reproduce...', tags: ['coding', 'qa'], starred: false }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Prompts" description="Manage your prompt library" />
        <Button size="icon">
            <Plus class="h-5 w-5" />
        </Button>
    </div>

    <div class="relative mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search prompts..." class="pl-10 h-12" />
    </div>

    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        {#each folders as folder, i}
            <Button variant={i === 0 ? 'secondary' : 'ghost'} class="shrink-0 gap-2">
                <Folder class="h-4 w-4" />
                {folder}
            </Button>
        {/each}
    </div>

    <div class="space-y-3">
            {#each prompts as prompt}
                <Card>
                    <CardHeader class="pb-2">
                        <div class="flex items-start justify-between">
                            <CardTitle class="text-base">{prompt.title}</CardTitle>
                            <div class="flex gap-1">
                                <Button variant="ghost" size="icon" class="h-8 w-8">
                                    <Star class="h-4 w-4 {prompt.starred ? 'fill-yellow-400 text-yellow-400' : ''}" />
                                </Button>
                                <Button variant="ghost" size="icon" class="h-8 w-8">
                                    <MoreVertical class="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <p class="text-sm text-muted-foreground line-clamp-2">{prompt.content}</p>
                        <div class="flex items-center justify-between">
                            <div class="flex gap-1 flex-wrap">
                                {#each prompt.tags as tag}
                                    <Badge variant="secondary" class="text-xs">{tag}</Badge>
                                {/each}
                            </div>
                            <Button variant="outline" size="sm" class="gap-1">
                                <Copy class="h-3 w-3" />
                                Copy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            {/each}
    </div>
</DashboardLayout>