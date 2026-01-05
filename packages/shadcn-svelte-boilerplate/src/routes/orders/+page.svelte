<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import * as Card from '$lib/components/ui/card';
    import * as Table from '$lib/components/ui/table';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import * as Tabs from '$lib/components/ui/tabs';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Badge } from '$lib/components/ui/badge';
    import {
        Search,
        Filter,
        Download,
        MoreHorizontal,
        Eye,
        Truck,
        Package,
        CheckCircle,
        XCircle,
        Clock
    } from '@lucide/svelte';

    const orders = [
        {
            id: 'ORD-001',
            customer: 'Alice Johnson',
            email: 'alice@example.com',
            items: 3,
            total: 459.97,
            status: 'Delivered',
            date: '2026-01-05',
            payment: 'Paid'
        },
        {
            id: 'ORD-002',
            customer: 'Bob Smith',
            email: 'bob@example.com',
            items: 1,
            total: 159.99,
            status: 'Shipped',
            date: '2026-01-05',
            payment: 'Paid'
        },
        {
            id: 'ORD-003',
            customer: 'Carol White',
            email: 'carol@example.com',
            items: 2,
            total: 239.98,
            status: 'Processing',
            date: '2026-01-04',
            payment: 'Paid'
        },
        {
            id: 'ORD-004',
            customer: 'David Brown',
            email: 'david@example.com',
            items: 5,
            total: 892.45,
            status: 'Pending',
            date: '2026-01-04',
            payment: 'Pending'
        },
        {
            id: 'ORD-005',
            customer: 'Eva Martinez',
            email: 'eva@example.com',
            items: 1,
            total: 79.99,
            status: 'Cancelled',
            date: '2026-01-03',
            payment: 'Refunded'
        },
        {
            id: 'ORD-006',
            customer: 'Frank Wilson',
            email: 'frank@example.com',
            items: 4,
            total: 567.96,
            status: 'Delivered',
            date: '2026-01-02',
            payment: 'Paid'
        }
    ];

    const stats = [
        { label: 'Total Orders', value: '1,284', icon: Package, change: '+12%' },
        { label: 'Pending', value: '23', icon: Clock, change: '-5%' },
        { label: 'Shipped', value: '156', icon: Truck, change: '+8%' },
        { label: 'Delivered', value: '1,105', icon: CheckCircle, change: '+15%' }
    ];

    let searchQuery = $state('');

    const filteredOrders = $derived(
        orders.filter(
            (o) =>
                o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.customer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    function getStatusConfig(status: string) {
        const configs: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
            Delivered: { variant: 'default', icon: CheckCircle },
            Shipped: { variant: 'secondary', icon: Truck },
            Processing: { variant: 'outline', icon: Package },
            Pending: { variant: 'outline', icon: Clock },
            Cancelled: { variant: 'destructive', icon: XCircle }
        };
        return configs[status] || { variant: 'secondary', icon: Package };
    }

    function getPaymentVariant(payment: string) {
        switch (payment) {
            case 'Paid': return 'default';
            case 'Pending': return 'outline';
            case 'Refunded': return 'secondary';
            default: return 'secondary';
        }
    }
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
            <PageHeader title="Orders" description="Track and manage customer orders." />
            <Button variant="outline">
                <Download class="mr-2 h-4 w-4" />
                Export
            </Button>
        </div>

        <!-- Stats -->
        <div class="grid gap-4 md:grid-cols-4 mb-8">
            {#each stats as stat}
                <Card.Root>
                    <Card.Content class="flex items-center gap-4 p-6">
                        <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <stat.icon class="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">{stat.label}</p>
                            <p class="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>

        <Card.Root>
            <Card.Header>
                <Tabs.Root value="all">
                    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <Tabs.List>
                            <Tabs.Trigger value="all">All Orders</Tabs.Trigger>
                            <Tabs.Trigger value="pending">Pending</Tabs.Trigger>
                            <Tabs.Trigger value="processing">Processing</Tabs.Trigger>
                            <Tabs.Trigger value="shipped">Shipped</Tabs.Trigger>
                            <Tabs.Trigger value="delivered">Delivered</Tabs.Trigger>
                        </Tabs.List>
                        <div class="flex items-center gap-2">
                            <div class="relative w-full md:w-64">
                                <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Search orders..." class="pl-9" bind:value={searchQuery} />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter class="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Tabs.Root>
            </Card.Header>
            <Card.Content>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Order ID</Table.Head>
                            <Table.Head>Customer</Table.Head>
                            <Table.Head>Items</Table.Head>
                            <Table.Head>Total</Table.Head>
                            <Table.Head>Status</Table.Head>
                            <Table.Head>Payment</Table.Head>
                            <Table.Head>Date</Table.Head>
                            <Table.Head class="w-12"></Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each filteredOrders as order (order.id)}
                            {@const statusConfig = getStatusConfig(order.status)}
                            <Table.Row>
                                <Table.Cell class="font-mono font-medium">{order.id}</Table.Cell>
                                <Table.Cell>
                                    <div>
                                        <p class="font-medium">{order.customer}</p>
                                        <p class="text-sm text-muted-foreground">{order.email}</p>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>{order.items} items</Table.Cell>
                                <Table.Cell class="font-medium">${order.total.toFixed(2)}</Table.Cell>
                                <Table.Cell>
                                    <Badge variant={statusConfig.variant} class="gap-1">
                                        <statusConfig.icon class="h-3 w-3" />
                                        {order.status}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge variant={getPaymentVariant(order.payment)}>{order.payment}</Badge>
                                </Table.Cell>
                                <Table.Cell class="text-muted-foreground">{order.date}</Table.Cell>
                                <Table.Cell>
                                    <DropdownMenu.Root>
                                        <DropdownMenu.Trigger>
                                            {#snippet child({ props })}
                                                <Button {...props} variant="ghost" size="icon">
                                                    <MoreHorizontal class="h-4 w-4" />
                                                </Button>
                                            {/snippet}
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content align="end">
                                            <DropdownMenu.Item>
                                                <Eye class="mr-2 h-4 w-4" />View Details
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item>
                                                <Truck class="mr-2 h-4 w-4" />Update Status
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Separator />
                                            <DropdownMenu.Item class="text-destructive">
                                                <XCircle class="mr-2 h-4 w-4" />Cancel Order
                                            </DropdownMenu.Item>
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Root>
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </Card.Content>
            <Card.Footer class="flex items-center justify-between">
                <p class="text-sm text-muted-foreground">
                    Showing {filteredOrders.length} of {orders.length} orders
                </p>
                <div class="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                </div>
            </Card.Footer>
        </Card.Root>
</DashboardLayout>