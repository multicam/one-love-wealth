<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { MessageSquare, Clock, ThumbsUp, TrendingUp, Zap } from '@lucide/svelte';
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Analytics" description="Agent performance metrics" />
        <select class="h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
        </select>
    </div>

    <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
            <Card>
                <CardContent class="p-4">
                    <MessageSquare class="h-6 w-6 text-blue-500 mb-2" />
                    <p class="text-2xl font-bold">1,420</p>
                    <p class="text-xs text-muted-foreground">Total Messages</p>
                    <Badge variant="secondary" class="mt-2 text-green-600">
                        <TrendingUp class="h-3 w-3 mr-1" />
                        +12%
                    </Badge>
                </CardContent>
            </Card>

            <Card>
                <CardContent class="p-4">
                    <Clock class="h-6 w-6 text-orange-500 mb-2" />
                    <p class="text-2xl font-bold">2.3s</p>
                    <p class="text-xs text-muted-foreground">Avg Response</p>
                    <Badge variant="secondary" class="mt-2 text-green-600">
                        <TrendingUp class="h-3 w-3 mr-1" />
                        -8%
                    </Badge>
                </CardContent>
            </Card>

            <Card>
                <CardContent class="p-4">
                    <ThumbsUp class="h-6 w-6 text-green-500 mb-2" />
                    <p class="text-2xl font-bold">94%</p>
                    <p class="text-xs text-muted-foreground">Satisfaction</p>
                    <Badge variant="secondary" class="mt-2 text-green-600">
                        <TrendingUp class="h-3 w-3 mr-1" />
                        +3%
                    </Badge>
                </CardContent>
            </Card>

            <Card>
                <CardContent class="p-4">
                    <Zap class="h-6 w-6 text-purple-500 mb-2" />
                    <p class="text-2xl font-bold">847K</p>
                    <p class="text-xs text-muted-foreground">Tokens Used</p>
                    <Badge variant="secondary" class="mt-2 text-yellow-600">
                        +24%
                    </Badge>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Usage Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="h-48 flex items-end justify-between gap-1">
                    {#each [40, 65, 45, 80, 55, 90, 70] as height}
                        <div class="flex-1 bg-primary rounded-t" style="height: {height}%"></div>
                    {/each}
                </div>
                <div class="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Top Topics</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
                {#each [
                    { topic: 'React Components', count: 234, pct: 80 },
                    { topic: 'TypeScript Types', count: 189, pct: 65 },
                    { topic: 'API Integration', count: 156, pct: 55 },
                    { topic: 'Debugging', count: 134, pct: 45 },
                    { topic: 'Testing', count: 98, pct: 35 }
                ] as item}
                    <div class="space-y-1">
                        <div class="flex justify-between text-sm">
                            <span>{item.topic}</span>
                            <span class="text-muted-foreground">{item.count}</span>
                        </div>
                        <div class="h-2 bg-muted rounded-full overflow-hidden">
                            <div class="h-full bg-primary rounded-full" style="width: {item.pct}%"></div>
                        </div>
                    </div>
                {/each}
            </CardContent>
        </Card>
    </div>
</DashboardLayout>