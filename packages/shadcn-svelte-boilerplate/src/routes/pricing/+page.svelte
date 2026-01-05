<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { Check } from 'lucide-svelte';

	let annual = $state(false);

	const plans = [
		{ name: 'Starter', description: 'Perfect for trying out', monthlyPrice: 0, annualPrice: 0, features: ['Up to 3 projects', 'Basic analytics', 'Community support', '1GB storage'], cta: 'Get Started', variant: 'outline' as const },
		{ name: 'Pro', description: 'Best for growing teams', monthlyPrice: 29, annualPrice: 290, popular: true, features: ['Unlimited projects', 'Advanced analytics', 'Priority support', '100GB storage', 'Custom integrations', 'Team collaboration'], cta: 'Start Free Trial', variant: 'default' as const },
		{ name: 'Enterprise', description: 'For large-scale deployments', monthlyPrice: 99, annualPrice: 990, features: ['Everything in Pro', 'Unlimited storage', 'Dedicated support', 'SLA guarantee', 'Advanced security', 'SSO/SAML'], cta: 'Contact Sales', variant: 'outline' as const }
	];

	function getPrice(plan: (typeof plans)[0]) {
		return annual ? plan.annualPrice : plan.monthlyPrice;
	}
</script>

<div class="min-h-screen flex flex-col">
	<Navbar />
	<main class="flex-1 container py-16">
		<div class="text-center mb-12">
			<Badge variant="secondary" class="mb-4">Pricing</Badge>
			<h1 class="text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
			<p class="text-xl text-muted-foreground max-w-2xl mx-auto">Choose the plan that's right for you.</p>
			<div class="flex items-center justify-center gap-3 mt-8">
				<Label for="billing" class={annual ? 'text-muted-foreground' : ''}>Monthly</Label>
				<Switch id="billing" bind:checked={annual} />
				<Label for="billing" class={!annual ? 'text-muted-foreground' : ''}>Annual <Badge variant="secondary" class="ml-1">Save 20%</Badge></Label>
			</div>
		</div>

		<div class="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
			{#each plans as plan}
				<Card.Root class={plan.popular ? 'border-primary shadow-lg relative' : ''}>
					{#if plan.popular}
						<div class="absolute -top-3 left-1/2 -translate-x-1/2"><Badge>Most Popular</Badge></div>
					{/if}
					<Card.Header class="text-center pb-2">
						<Card.Title class="text-xl">{plan.name}</Card.Title>
						<Card.Description>{plan.description}</Card.Description>
					</Card.Header>
					<Card.Content class="text-center">
						<div class="mb-6">
							<span class="text-5xl font-bold">${getPrice(plan)}</span>
							{#if plan.monthlyPrice > 0}<span class="text-muted-foreground">/{annual ? 'year' : 'month'}</span>{/if}
						</div>
						<Button variant={plan.variant} class="w-full mb-6" size="lg">{plan.cta}</Button>
						<ul class="space-y-3 text-left">
							{#each plan.features as feature}
								<li class="flex items-center gap-2">
									<Check class="h-4 w-4 text-primary flex-shrink-0" />
									<span class="text-sm">{feature}</span>
								</li>
							{/each}
						</ul>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</main>
	<footer class="border-t py-8 mt-16">
		<div class="container text-center text-sm text-muted-foreground">© 2026 MyApp. All rights reserved.</div>
	</footer>
</div>
