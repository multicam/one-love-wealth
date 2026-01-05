<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import * as Card from '$lib/components/ui/card';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Badge } from '$lib/components/ui/badge';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { cn } from '$lib/utils';
    import {
        Plus,
        Search,
        Filter,
        Grid,
        List,
        MoreHorizontal,
        Edit,
        Trash2,
        Eye,
        Package
    } from '@lucide/svelte';

    const products = [
        {
            id: 1,
            name: 'Wireless Headphones',
            sku: 'WH-1000XM5',
            price: 349.99,
            stock: 124,
            category: 'Electronics',
            status: 'Active',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'
        },
        {
            id: 2,
            name: 'Mechanical Keyboard',
            sku: 'KB-MECH-01',
            price: 159.99,
            stock: 56,
            category: 'Electronics',
            status: 'Active',
            image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200&h=200&fit=crop'
        },
        {
            id: 3,
            name: 'Ergonomic Mouse',
            sku: 'MS-ERG-02',
            price: 79.99,
            stock: 0,
            category: 'Electronics',
            status: 'Out of Stock',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop'
        },
        {
            id: 4,
            name: 'USB-C Hub',
            sku: 'HUB-USB-C',
            price: 49.99,
            stock: 234,
            category: 'Accessories',
            status: 'Active',
            image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e7?w=200&h=200&fit=crop'
        },
        {
            id: 5,
            name: 'Monitor Stand',
            sku: 'MS-STAND-01',
            price: 89.99,
            stock: 12,
            category: 'Furniture',
            status: 'Low Stock',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop'
        },
        {
            id: 6,
            name: 'Webcam HD',
            sku: 'WC-HD-1080',
            price: 129.99,
            stock: 89,
            category: 'Electronics',
            status: 'Active',
            image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=200&h=200&fit=crop'
        }
    ];

    let viewMode = $state<'grid' | 'list'>('grid');
    let searchQuery = $state('');
    let selectedProducts = $state<number[]>([]);

    const filteredProducts = $derived(
        products.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    function getStatusVariant(status: string) {
        switch (status) {
            case 'Active': return 'default';
            case 'Low Stock': return 'secondary';
            case 'Out of Stock': return 'destructive';
            default: return 'secondary';
        }
    }

    function toggleSelect(id: number) {
        if (selectedProducts.includes(id)) {
            selectedProducts = selectedProducts.filter((i) => i !== id);
        } else {
            selectedProducts = [...selectedProducts, id];
        }
    }
</script>

<DashboardLayout>
        <div class="flex items-center justify-between mb-8">
            <PageHeader title="Products" description="Manage your product inventory." />
            <Button>
                <Plus class="mr-2 h-4 w-4" />
                Add Product
            </Button>
        </div>

        <Card.Root>
            <Card.Header>
                <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div class="relative w-full md:w-80">
                        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search products..." class="pl-9" bind:value={searchQuery} />
                    </div>
                    <div class="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Filter class="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <div class="flex border rounded-md">
                            <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    class="rounded-r-none"
                                    onclick={() => (viewMode = 'grid')}
                            >
                                <Grid class="h-4 w-4" />
                            </Button>
                            <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    class="rounded-l-none"
                                    onclick={() => (viewMode = 'list')}
                            >
                                <List class="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Card.Content>
                {#if viewMode === 'grid'}
                    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {#each filteredProducts as product (product.id)}
                            <Card.Root class="overflow-hidden">
                                <div class="relative aspect-square bg-muted">
                                    <img
                                            src={product.image}
                                            alt={product.name}
                                            class="object-cover w-full h-full"
                                    />
                                    <div class="absolute top-2 left-2">
                                        <Checkbox
                                                checked={selectedProducts.includes(product.id)}
                                                onCheckedChange={() => toggleSelect(product.id)}
                                        />
                                    </div>
                                    <div class="absolute top-2 right-2">
                                        <Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
                                    </div>
                                </div>
                                <Card.Content class="p-4">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <h3 class="font-semibold">{product.name}</h3>
                                            <p class="text-sm text-muted-foreground">{product.sku}</p>
                                        </div>
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
                                                    <Eye class="mr-2 h-4 w-4" />View
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item>
                                                    <Edit class="mr-2 h-4 w-4" />Edit
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Separator />
                                                <DropdownMenu.Item class="text-destructive">
                                                    <Trash2 class="mr-2 h-4 w-4" />Delete
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Root>
                                    </div>
                                    <div class="mt-4 flex items-center justify-between">
                                        <span class="text-lg font-bold">${product.price}</span>
                                        <span class="text-sm text-muted-foreground">
											{product.stock} in stock
										</span>
                                    </div>
                                </Card.Content>
                            </Card.Root>
                        {/each}
                    </div>
                {:else}
                    <div class="space-y-2">
                        {#each filteredProducts as product (product.id)}
                            <div class="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <Checkbox
                                        checked={selectedProducts.includes(product.id)}
                                        onCheckedChange={() => toggleSelect(product.id)}
                                />
                                <img
                                        src={product.image}
                                        alt={product.name}
                                        class="h-16 w-16 rounded-lg object-cover"
                                />
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-semibold">{product.name}</h3>
                                    <p class="text-sm text-muted-foreground">{product.sku} • {product.category}</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold">${product.price}</p>
                                    <p class="text-sm text-muted-foreground">{product.stock} in stock</p>
                                </div>
                                <Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger>
                                        {#snippet child({ props })}
                                            <Button {...props} variant="ghost" size="icon">
                                                <MoreHorizontal class="h-4 w-4" />
                                            </Button>
                                        {/snippet}
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content align="end">
                                        <DropdownMenu.Item><Eye class="mr-2 h-4 w-4" />View</DropdownMenu.Item>
                                        <DropdownMenu.Item><Edit class="mr-2 h-4 w-4" />Edit</DropdownMenu.Item>
                                        <DropdownMenu.Separator />
                                        <DropdownMenu.Item class="text-destructive">
                                            <Trash2 class="mr-2 h-4 w-4" />Delete
                                        </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            </div>
                        {/each}
                    </div>
                {/if}

                {#if filteredProducts.length === 0}
                    <div class="text-center py-12">
                        <Package class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p class="text-muted-foreground">No products found</p>
                    </div>
                {/if}
            </Card.Content>
            <Card.Footer class="flex items-center justify-between">
                <p class="text-sm text-muted-foreground">
                    {selectedProducts.length} of {filteredProducts.length} selected
                </p>
                <div class="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                </div>
            </Card.Footer>
        </Card.Root>
</DashboardLayout>