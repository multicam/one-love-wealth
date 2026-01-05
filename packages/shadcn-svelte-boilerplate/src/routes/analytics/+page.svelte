<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import * as Card from '$lib/components/ui/card';
    import * as Select from '$lib/components/ui/select';
    import * as Tabs from '$lib/components/ui/tabs';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import { Progress } from '$lib/components/ui/progress';
    import {
        TrendingUp,
        TrendingDown,
        Eye,
        Users,
        Clock,
        MousePointer,
        Download,
        Calendar
    } from '@lucide/svelte';

    const metrics = [
        { label: 'Page Views', value: '124,892', change: '+12.5%', trend: 'up', icon: Eye },
        { label: 'Unique Visitors', value: '48,234', change: '+8.2%', trend: 'up', icon: Users },
        { label: 'Avg. Session', value: '4m 32s', change: '-2.1%', trend: 'down', icon: Clock },
        { label: 'Bounce Rate', value: '42.3%', change: '-5.4%', trend: 'up', icon: MousePointer }
    ];

    const topPages = [
        { page: '/dashboard', views: 12453, percentage: 100 },
        { page: '/products', views: 8932, percentage: 72 },
        { page: '/pricing', views: 6721, percentage: 54 },
        { page: '/blog/getting-started', views: 5234, percentage: 42 },
        { page: '/about', views: 3892, percentage: 31 }
    ];

    const trafficSources = [
        { source: 'Direct', visitors: 24532, percentage: 35, color: 'bg-blue-500' },
        { source: 'Organic Search', visitors: 18234, percentage: 26, color: 'bg-green-500' },
        { source: 'Social Media', visitors: 12453, percentage: 18, color: 'bg-purple-500' },
        { source: 'Referral', visitors: 8932, percentage: 13, color: 'bg-orange-500' },
        { source: 'Email', visitors: 5621, percentage: 8, color: 'bg-pink-500' }
    ];

    const countries = [
        { country: 'United States', flag: '🇺🇸', visitors: 32453, percentage: 42 },
        { country: 'United Kingdom', flag: '🇬🇧', visitors: 12234, percentage: 16 },
        { country: 'Germany', flag: '🇩🇪', visitors: 8932, percentage: 12 },
        { country: 'Canada', flag: '🇨🇦', visitors: 6721, percentage: 9 },
        { country: 'Australia', flag: '🇦🇺', visitors: 5234, percentage: 7 }
    ];

    const devices = [
        { device: 'Desktop', percentage: 58, color: 'bg-blue-500' },
        { device: 'Mobile', percentage: 35, color: 'bg-green-500' },
        { device: 'Tablet', percentage: 7, color: 'bg-orange-500' }
    ];

    const dateRangeItems = [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: '1y', label: 'Last year' }
    ];
    let dateRange = $state('7d');
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
            <PageHeader title="Analytics" description="Track your website performance and user behavior." />
            <div class="flex items-center gap-2">
                <Select.Root type="single" bind:value={dateRange} items={dateRangeItems}>
                    <Select.Trigger class="w-[180px]">
                        {dateRangeItems.find(i => i.value === dateRange)?.label || "Last 7 days"}
                    </Select.Trigger>
                    <Select.Content>
                        {#each dateRangeItems as item}
                            <Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
                <Button variant="outline">
                    <Download class="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </div>

        <!-- Metrics Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {#each metrics as metric}
                <Card.Root>
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Card.Title class="text-sm font-medium">{metric.label}</Card.Title>
                        <metric.icon class="h-4 w-4 text-muted-foreground" />
                    </Card.Header>
                    <Card.Content>
                        <div class="text-2xl font-bold">{metric.value}</div>
                        <div class="flex items-center gap-1 text-xs">
                            {#if metric.trend === 'up'}
                                <TrendingUp class="h-3 w-3 text-green-500" />
                                <span class="text-green-500">{metric.change}</span>
                            {:else}
                                <TrendingDown class="h-3 w-3 text-red-500" />
                                <span class="text-red-500">{metric.change}</span>
                            {/if}
                            <span class="text-muted-foreground">vs last period</span>
                        </div>
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>

        <!-- Charts Section -->
        <div class="grid gap-6 lg:grid-cols-2 mb-8">
            <Card.Root class="lg:col-span-2">
                <Card.Header>
                    <Card.Title>Traffic Overview</Card.Title>
                    <Card.Description>Page views and unique visitors over time</Card.Description>
                </Card.Header>
                <Card.Content>
                    <div class="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                        <p class="text-muted-foreground">Line Chart - Traffic Over Time</p>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>

        <div class="grid gap-6 lg:grid-cols-3 mb-8">
            <!-- Top Pages -->
            <Card.Root>
                <Card.Header>
                    <Card.Title>Top Pages</Card.Title>
                    <Card.Description>Most visited pages</Card.Description>
                </Card.Header>
                <Card.Content class="space-y-4">
                    {#each topPages as page}
                        <div class="space-y-2">
                            <div class="flex items-center justify-between text-sm">
                                <span class="font-mono truncate">{page.page}</span>
                                <span class="text-muted-foreground">{page.views.toLocaleString()}</span>
                            </div>
                            <Progress value={page.percentage} class="h-2" />
                        </div>
                    {/each}
                </Card.Content>
            </Card.Root>

            <!-- Traffic Sources -->
            <Card.Root>
                <Card.Header>
                    <Card.Title>Traffic Sources</Card.Title>
                    <Card.Description>Where visitors come from</Card.Description>
                </Card.Header>
                <Card.Content class="space-y-4">
                    {#each trafficSources as source}
                        <div class="flex items-center gap-3">
                            <div class={`h-3 w-3 rounded-full ${source.color}`}></div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium">{source.source}</span>
                                    <span class="text-sm text-muted-foreground">{source.percentage}%</span>
                                </div>
                                <Progress value={source.percentage} class="h-1.5 mt-1" />
                            </div>
                        </div>
                    {/each}
                </Card.Content>
            </Card.Root>

            <!-- Device Breakdown -->
            <Card.Root>
                <Card.Header>
                    <Card.Title>Devices</Card.Title>
                    <Card.Description>Visitors by device type</Card.Description>
                </Card.Header>
                <Card.Content>
                    <div class="h-[200px] flex items-center justify-center bg-muted/50 rounded-lg mb-4">
                        <p class="text-muted-foreground">Donut Chart</p>
                    </div>
                    <div class="space-y-2">
                        {#each devices as device}
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <div class={`h-3 w-3 rounded-full ${device.color}`}></div>
                                    <span class="text-sm">{device.device}</span>
                                </div>
                                <span class="text-sm font-medium">{device.percentage}%</span>
                            </div>
                        {/each}
                    </div>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Countries Table -->
        <Card.Root>
            <Card.Header>
                <Card.Title>Top Countries</Card.Title>
                <Card.Description>Visitor distribution by country</Card.Description>
            </Card.Header>
            <Card.Content>
                <div class="space-y-4">
                    {#each countries as country}
                        <div class="flex items-center gap-4">
                            <span class="text-2xl">{country.flag}</span>
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="font-medium">{country.country}</span>
                                    <span class="text-sm text-muted-foreground">{country.visitors.toLocaleString()} visitors</span>
                                </div>
                                <Progress value={country.percentage} class="h-2" />
                            </div>
                            <Badge variant="secondary">{country.percentage}%</Badge>
                        </div>
                    {/each}
                </div>
            </Card.Content>
        </Card.Root>
</DashboardLayout>