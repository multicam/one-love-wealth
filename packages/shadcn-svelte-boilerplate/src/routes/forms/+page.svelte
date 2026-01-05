<script lang="ts">
	import { DashboardLayout, PageHeader } from '$lib/components/layout';
	import * as Card from '$lib/components/ui/card';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Switch } from '$lib/components/ui/switch';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';

	let formData = $state({ name: '', email: '', message: '', priority: 'medium', subscribe: false, urgent: false });
	
	const categoryItems = [
		{ value: 'general', label: 'General Inquiry' },
		{ value: 'support', label: 'Technical Support' },
		{ value: 'sales', label: 'Sales' }
	];
	let category = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		toast.success('Form submitted successfully!', { description: 'We will get back to you soon.' });
	}
</script>

<DashboardLayout>
	<PageHeader title="Forms" description="Example form layouts and components." />

		<div class="grid gap-6 lg:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Contact Form</Card.Title>
					<Card.Description>Send us a message and we'll respond shortly.</Card.Description>
				</Card.Header>
				<Card.Content>
					<form onsubmit={handleSubmit} class="space-y-4">
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="name">Name *</Label>
								<Input id="name" placeholder="John Doe" bind:value={formData.name} required />
							</div>
							<div class="space-y-2">
								<Label for="email">Email *</Label>
								<Input id="email" type="email" placeholder="john@example.com" bind:value={formData.email} required />
							</div>
						</div>
						<div class="space-y-2">
							<Label for="category">Category</Label>
							<Select.Root type="single" bind:value={category} items={categoryItems}>
								<Select.Trigger>
									{categoryItems.find(i => i.value === category)?.label || "Select a category"}
								</Select.Trigger>
								<Select.Content>
									{#each categoryItems as item}
										<Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-2">
							<Label for="message">Message *</Label>
							<Textarea id="message" placeholder="Tell us how we can help..." rows={4} bind:value={formData.message} required />
						</div>
						<div class="space-y-4">
							<Label>Priority Level</Label>
							<RadioGroup.Root bind:value={formData.priority} class="flex gap-4">
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value="low" id="low" />
									<Label for="low" class="font-normal">Low</Label>
								</div>
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value="medium" id="medium" />
									<Label for="medium" class="font-normal">Medium</Label>
								</div>
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value="high" id="high" />
									<Label for="high" class="font-normal">High</Label>
								</div>
							</RadioGroup.Root>
						</div>
						<Separator />
						<div class="space-y-4">
							<div class="flex items-center space-x-2">
								<Checkbox id="subscribe" bind:checked={formData.subscribe} />
								<Label for="subscribe" class="font-normal">Subscribe to newsletter</Label>
							</div>
							<div class="flex items-center justify-between">
								<div>
									<Label for="urgent">Mark as urgent</Label>
									<p class="text-sm text-muted-foreground">Enable for faster response</p>
								</div>
								<Switch id="urgent" bind:checked={formData.urgent} />
							</div>
						</div>
						<Button type="submit" class="w-full">Submit</Button>
					</form>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Input States</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<Label>Default Input</Label>
						<Input placeholder="Default input" />
					</div>
					<div class="space-y-2">
						<Label>Disabled Input</Label>
						<Input placeholder="Disabled input" disabled />
					</div>
					<div class="space-y-2">
						<Label>With Error</Label>
						<Input placeholder="Invalid input" class="border-destructive" />
						<p class="text-sm text-destructive">This field is required.</p>
					</div>
				</Card.Content>
			</Card.Root>
	</div>
</DashboardLayout>
