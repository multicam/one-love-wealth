<script lang="ts">
	import { DashboardLayout, PageHeader } from '$lib/components/layout';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { Separator } from '$lib/components/ui/separator';

	let notifications = $state({ email: true, push: false, marketing: false });
	
	const languageItems = [
		{ value: 'en', label: 'English' },
		{ value: 'es', label: 'Spanish' },
		{ value: 'fr', label: 'French' }
	];
	let language = $state('en');
</script>

<DashboardLayout>
	<PageHeader title="Settings" description="Manage your account settings and preferences." />

		<Tabs.Root value="general" class="space-y-6">
			<Tabs.List>
				<Tabs.Trigger value="general">General</Tabs.Trigger>
				<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
				<Tabs.Trigger value="security">Security</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="general">
				<Card.Root>
					<Card.Header>
						<Card.Title>General Settings</Card.Title>
						<Card.Description>Update your basic account information.</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="firstName">First Name</Label>
								<Input id="firstName" value="John" />
							</div>
							<div class="space-y-2">
								<Label for="lastName">Last Name</Label>
								<Input id="lastName" value="Doe" />
							</div>
						</div>
						<div class="space-y-2">
							<Label for="email">Email</Label>
							<Input id="email" type="email" value="john@example.com" />
						</div>
						<div class="space-y-2">
							<Label for="language">Language</Label>
							<Select.Root type="single" bind:value={language} items={languageItems}>
								<Select.Trigger class="w-full md:w-[280px]">
									{languageItems.find(i => i.value === language)?.label || "Select language"}
								</Select.Trigger>
								<Select.Content>
									{#each languageItems as item}
										<Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</Card.Content>
					<Card.Footer>
						<Button>Save Changes</Button>
					</Card.Footer>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="notifications">
				<Card.Root>
					<Card.Header>
						<Card.Title>Notification Preferences</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-6">
						<div class="flex items-center justify-between">
							<div>
								<Label>Email Notifications</Label>
								<p class="text-sm text-muted-foreground">Receive email updates</p>
							</div>
							<Switch bind:checked={notifications.email} />
						</div>
						<Separator />
						<div class="flex items-center justify-between">
							<div>
								<Label>Push Notifications</Label>
								<p class="text-sm text-muted-foreground">Receive push notifications</p>
							</div>
							<Switch bind:checked={notifications.push} />
						</div>
					</Card.Content>
					<Card.Footer>
						<Button>Save Preferences</Button>
					</Card.Footer>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="security">
				<Card.Root>
					<Card.Header>
						<Card.Title>Security Settings</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-6">
						<div class="space-y-2">
							<Label for="currentPassword">Current Password</Label>
							<Input id="currentPassword" type="password" />
						</div>
						<div class="space-y-2">
							<Label for="newPassword">New Password</Label>
							<Input id="newPassword" type="password" />
						</div>
						<div class="space-y-2">
							<Label for="confirmPassword">Confirm New Password</Label>
							<Input id="confirmPassword" type="password" />
						</div>
					</Card.Content>
					<Card.Footer>
						<Button>Update Password</Button>
					</Card.Footer>
				</Card.Root>
			</Tabs.Content>
	</Tabs.Root>
</DashboardLayout>
