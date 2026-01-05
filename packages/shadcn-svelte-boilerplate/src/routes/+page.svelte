<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowRight, Zap, Shield, Sparkles } from 'lucide-svelte';

	const features = [
		{ icon: Zap, title: 'Lightning Fast', description: 'Built on SvelteKit for optimal performance.' },
		{ icon: Shield, title: 'Secure by Default', description: 'Enterprise-grade security built in.' },
		{ icon: Sparkles, title: 'Beautiful UI', description: 'Stunning components powered by shadcn-svelte.' }
	];
</script>

<div class="min-h-screen flex flex-col">
	<Navbar />
	<main class="flex-1">
		<section class="container py-24 md:py-32 space-y-8 text-center">
			<Badge variant="secondary">Now in Beta</Badge>
			<h1 class="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl mx-auto">
				Build beautiful apps with <span class="text-primary">shadcn-svelte</span>
			</h1>
			<p class="text-xl text-muted-foreground max-w-2xl mx-auto">
				A collection of beautifully designed, accessible components for SvelteKit.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<Button size="lg" href="/auth/register">
					Get Started <ArrowRight class="ml-2 h-4 w-4" />
				</Button>
				<Button size="lg" variant="outline" href="/dashboard">View Demo</Button>
			</div>
		</section>

		<section class="container py-24 border-t">
			<h2 class="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
			<div class="grid md:grid-cols-3 gap-8">
				{#each features as feature}
					<Card.Root>
						<Card.Header>
							<div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
								<feature.icon class="h-6 w-6 text-primary" />
							</div>
							<Card.Title>{feature.title}</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="text-muted-foreground">{feature.description}</p>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</section>
	</main>

	<footer class="border-t py-8">
		<div class="container text-center text-sm text-muted-foreground">
			© 2026 MyApp. All rights reserved.
		</div>
	</footer>
</div>
