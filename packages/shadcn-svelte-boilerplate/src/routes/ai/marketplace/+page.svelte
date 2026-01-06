<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Card, CardContent, CardFooter } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Search, Star, Download, TrendingUp } from 'lucide-svelte';

    const categories = ['All', 'Productivity', 'Development', 'Creative', 'Research', 'Business'];
    const featured = [
        { name: 'Super Coder', icon: '🦸', rating: 4.9, installs: '50K+', category: 'Development', description: 'Advanced coding assistant with multi-language support' },
        { name: 'Legal Eagle', icon: '⚖️', rating: 4.8, installs: '25K+', category: 'Business', description: 'Contract review and legal document analysis' }
    ];
    const agents = [
        { name: 'SQL Master', icon: '🗃️', rating: 4.7, installs: '30K+', category: 'Development' },
        { name: 'Story Weaver', icon: '📖', rating: 4.6, installs: '20K+', category: 'Creative' },
        { name: 'Data Viz Pro', icon: '📈', rating: 4.8, installs: '15K+', category: 'Business' },
        { name: 'API Helper', icon: '🔌', rating: 4.5, installs: '12K+', category: 'Development' },
        { name: 'Email Wizard', icon: '📧', rating: 4.4, installs: '40K+', category: 'Productivity' },
        { name: 'Math Tutor', icon: '🧮', rating: 4.9, installs: '35K+', category: 'Research' }
    ];
</script>

<DashboardLayout>
    <PageHeader title="Marketplace" description="Discover and install AI agents" />

    <div class="relative mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search agents..." class="pl-10 h-12" />
    </div>

    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        {#each categories as cat, i}
            <Button variant={i === 0 ? 'default' : 'outline'} size="sm" class="rounded-full shrink-0">
                {cat}
            </Button>
        {/each}
    </div>

    <div class="space-y-6">
        <section>
            <div class="flex items-center gap-2 mb-3">
                <TrendingUp class="h-5 w-5 text-primary" />
                <h2 class="font-semibold text-lg">Featured</h2>
            </div>
            <div class="space-y-3">
                {#each featured as agent}
                    <Card>
                        <CardContent class="p-4">
                            <div class="flex gap-4">
                                <div class="h-16 w-16 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">
                                    {agent.icon}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <p class="font-semibold">{agent.name}</p>
                                            <Badge variant="secondary" class="mt-1">{agent.category}</Badge>
                                        </div>
                                        <div class="flex items-center gap-1 text-sm">
                                            <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            {agent.rating}
                                        </div>
                                    </div>
                                    <p class="text-sm text-muted-foreground mt-2 line-clamp-2">{agent.description}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter class="px-4 pb-4 pt-0">
                            <Button class="w-full h-10 gap-2">
                                <Download class="h-4 w-4" />
                                Install
                            </Button>
                        </CardFooter>
                    </Card>
                {/each}
            </div>
        </section>

        <section>
            <h2 class="font-semibold text-lg mb-3">Popular Agents</h2>
            <div class="grid grid-cols-2 gap-3">
                {#each agents as agent}
                    <Card class="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent class="p-4 text-center">
                            <div class="h-14 w-14 mx-auto rounded-xl bg-muted flex items-center justify-center text-2xl mb-3">
                                {agent.icon}
                            </div>
                            <p class="font-medium text-sm">{agent.name}</p>
                            <div class="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                                <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {agent.rating} · {agent.installs}
                            </div>
                        </CardContent>
                    </Card>
                {/each}
            </div>
        </section>
    </div>
</DashboardLayout>