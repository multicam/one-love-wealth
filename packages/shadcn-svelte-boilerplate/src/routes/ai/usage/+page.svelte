<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Progress } from '$lib/components/ui/progress';
    import { Badge } from '$lib/components/ui/badge';
    import { Separator } from '$lib/components/ui/separator';
    import { Calendar, CreditCard, ArrowUpRight } from 'lucide-svelte';
</script>

<DashboardLayout>
    <PageHeader title="Usage & Billing" description="Monitor your usage and manage billing" />

    <div class="space-y-4">
        <Card class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <Badge variant="secondary" class="bg-white/20 text-white hover:bg-white/30">Pro Plan</Badge>
                    <Button variant="secondary" size="sm" class="gap-1">
                        Upgrade
                        <ArrowUpRight class="h-3 w-3" />
                    </Button>
                </div>
                <p class="text-sm opacity-80">Current billing period</p>
                <p class="text-3xl font-bold">$49.00</p>
                <p class="text-sm opacity-80 mt-1">Jan 1 - Jan 31, 2026</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle class="flex items-center justify-between">
                    <span>Token Usage</span>
                    <span class="text-sm font-normal text-muted-foreground">Resets in 25 days</span>
                </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div>
                    <div class="flex justify-between text-sm mb-2">
                        <span>1.2M / 5M tokens</span>
                        <span class="text-muted-foreground">24%</span>
                    </div>
                    <Progress value={24} class="h-3" />
                </div>
                <div class="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <p class="text-2xl font-bold">847K</p>
                        <p class="text-sm text-muted-foreground">Input tokens</p>
                    </div>
                    <div>
                        <p class="text-2xl font-bold">353K</p>
                        <p class="text-sm text-muted-foreground">Output tokens</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Usage by Agent</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
                {#each [
                    { name: 'Code Assistant', tokens: '523K', pct: 44, icon: '💻' },
                    { name: 'Data Analyst', tokens: '312K', pct: 26, icon: '📊' },
                    { name: 'Content Writer', tokens: '198K', pct: 17, icon: '✍️' },
                    { name: 'Research Bot', tokens: '167K', pct: 13, icon: '🔬' }
                ] as agent}
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span>{agent.icon}</span>
                                <span class="text-sm font-medium">{agent.name}</span>
                            </div>
                            <span class="text-sm text-muted-foreground">{agent.tokens}</span>
                        </div>
                        <Progress value={agent.pct} class="h-2" />
                    </div>
                {/each}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
                {#each [
                    { date: 'Dec 2025', amount: '$49.00', status: 'Paid' },
                    { date: 'Nov 2025', amount: '$49.00', status: 'Paid' },
                    { date: 'Oct 2025', amount: '$49.00', status: 'Paid' }
                ] as invoice}
                    <div class="flex items-center justify-between py-2">
                        <div class="flex items-center gap-3">
                            <Calendar class="h-4 w-4 text-muted-foreground" />
                            <span class="text-sm">{invoice.date}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-medium">{invoice.amount}</span>
                            <Badge variant="secondary">{invoice.status}</Badge>
                        </div>
                    </div>
                    <Separator />
                {/each}
            </CardContent>
        </Card>

        <Card>
            <CardContent class="p-4">
                <Button variant="outline" class="w-full h-12 gap-2">
                    <CreditCard class="h-4 w-4" />
                    Manage Payment Method
                </Button>
            </CardContent>
        </Card>
    </div>
</DashboardLayout>