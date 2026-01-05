<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Home, ArrowLeft } from 'lucide-svelte';
</script>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="text-center space-y-6 max-w-md">
		<div class="space-y-2">
			<h1 class="text-9xl font-bold text-primary/20">404</h1>
			<h2 class="text-2xl font-bold">Page not found</h2>
			<p class="text-muted-foreground">Sorry, we couldn't find the page you're looking for.</p>
		</div>
		<div class="flex flex-col sm:flex-row gap-3 justify-center">
			<Button variant="outline" onclick={() => history.back()}>
				<ArrowLeft class="mr-2 h-4 w-4" />Go Back
			</Button>
			<Button href="/"><Home class="mr-2 h-4 w-4" />Back to Home</Button>
		</div>
		<div class="pt-8 border-t">
			<p class="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
			<div class="flex gap-4 justify-center text-sm">
				<a href="/dashboard" class="text-primary hover:underline">Dashboard</a>
				<a href="/pricing" class="text-primary hover:underline">Pricing</a>
				<a href="/settings" class="text-primary hover:underline">Settings</a>
			</div>
		</div>
	</div>
</div>
