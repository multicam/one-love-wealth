<script lang="ts">
	import { DashboardLayout, PageHeader } from '$lib/components/layout';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { MoreHorizontal, Plus, Search, Download, Filter } from '@lucide/svelte';

	const users = [
		{ id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', lastActive: '2 min ago' },
		{ id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active', lastActive: '1 hour ago' },
		{ id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Editor', status: 'Inactive', lastActive: '2 days ago' },
		{ id: 4, name: 'David Brown', email: 'david@example.com', role: 'User', status: 'Active', lastActive: '5 min ago' },
		{ id: 5, name: 'Eva Martinez', email: 'eva@example.com', role: 'Admin', status: 'Active', lastActive: 'Just now' }
	];

	let selectedUsers = $state<number[]>([]);
	let searchQuery = $state('');

	const filteredUsers = $derived(
		users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	function toggleSelect(id: number) {
		if (selectedUsers.includes(id)) {
			selectedUsers = selectedUsers.filter((i) => i !== id);
		} else {
			selectedUsers = [...selectedUsers, id];
		}
	}

	function getStatusVariant(status: string) {
		return status === 'Active' ? 'default' : 'secondary';
	}
</script>

<DashboardLayout>
		<PageHeader title="Users" description="Manage user accounts and permissions." />

		<Card.Root>
			<Card.Header>
				<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div class="relative w-full md:w-80">
						<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input placeholder="Search users..." class="pl-9" bind:value={searchQuery} />
					</div>
					<div class="flex gap-2">
						<Button variant="outline" size="sm"><Filter class="mr-2 h-4 w-4" />Filter</Button>
						<Button variant="outline" size="sm"><Download class="mr-2 h-4 w-4" />Export</Button>
						<Button size="sm"><Plus class="mr-2 h-4 w-4" />Add User</Button>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-12"><Checkbox /></Table.Head>
							<Table.Head>User</Table.Head>
							<Table.Head>Role</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Last Active</Table.Head>
							<Table.Head class="w-12"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filteredUsers as user (user.id)}
							<Table.Row>
								<Table.Cell>
									<Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => toggleSelect(user.id)} />
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-3">
										<Avatar.Root class="h-8 w-8">
											<Avatar.Image src="https://api.dicebear.com/7.x/avataaars/svg?seed={user.name}" alt={user.name} />
											<Avatar.Fallback>{user.name[0]}</Avatar.Fallback>
										</Avatar.Root>
										<div>
											<p class="font-medium">{user.name}</p>
											<p class="text-sm text-muted-foreground">{user.email}</p>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell>{user.role}</Table.Cell>
								<Table.Cell><Badge variant={getStatusVariant(user.status)}>{user.status}</Badge></Table.Cell>
								<Table.Cell class="text-muted-foreground">{user.lastActive}</Table.Cell>
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
											<DropdownMenu.Item>View Profile</DropdownMenu.Item>
											<DropdownMenu.Item>Edit User</DropdownMenu.Item>
											<DropdownMenu.Separator />
											<DropdownMenu.Item class="text-destructive">Delete User</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
			<Card.Footer class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">{selectedUsers.length} of {filteredUsers.length} selected.</p>
				<div class="flex gap-2">
					<Button variant="outline" size="sm" disabled>Previous</Button>
					<Button variant="outline" size="sm">Next</Button>
				</div>
			</Card.Footer>
		</Card.Root>
</DashboardLayout>
