<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Progress } from '$lib/components/ui/progress';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let acceptTerms = $state(false);

	const passwordStrength = $derived(() => {
		if (!password) return 0;
		let strength = 0;
		if (password.length >= 8) strength += 25;
		if (/[A-Z]/.test(password)) strength += 25;
		if (/[0-9]/.test(password)) strength += 25;
		if (/[^A-Za-z0-9]/.test(password)) strength += 25;
		return strength;
	});

	const strengthLabel = $derived(() => {
		const s = passwordStrength();
		if (s === 0) return '';
		if (s <= 25) return 'Weak';
		if (s <= 50) return 'Fair';
		if (s <= 75) return 'Good';
		return 'Strong';
	});
</script>

<div class="min-h-screen flex">
	<div class="flex-1 flex items-center justify-center p-8">
		<Card.Root class="w-full max-w-md border-0 shadow-none">
			<Card.Header>
				<Card.Title class="text-2xl">Create an account</Card.Title>
				<Card.Description>Enter your details to get started</Card.Description>
			</Card.Header>
			<Card.Content>
				<form class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Full Name</Label>
						<Input id="name" placeholder="John Doe" bind:value={name} />
					</div>
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input id="email" type="email" placeholder="name@example.com" bind:value={email} />
					</div>
					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input id="password" type="password" bind:value={password} />
						{#if password}
							<div class="space-y-1">
								<Progress value={passwordStrength()} class="h-2" />
								<p class="text-xs text-muted-foreground">Password strength: {strengthLabel()}</p>
							</div>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="confirmPassword">Confirm Password</Label>
						<Input id="confirmPassword" type="password" bind:value={confirmPassword} />
						{#if confirmPassword && password !== confirmPassword}
							<p class="text-xs text-destructive">Passwords do not match</p>
						{/if}
					</div>
					<div class="flex items-start space-x-2">
						<Checkbox id="terms" bind:checked={acceptTerms} class="mt-1" />
						<Label for="terms" class="text-sm font-normal leading-relaxed">
							I agree to the <a href="#" class="text-primary hover:underline">Terms</a> and
							<a href="#" class="text-primary hover:underline">Privacy Policy</a>
						</Label>
					</div>
					<Button class="w-full" type="submit" disabled={!acceptTerms}>Create account</Button>
				</form>
			</Card.Content>
			<Card.Footer class="justify-center">
				<p class="text-sm text-muted-foreground">
					Already have an account?
					<a href="/auth/login" class="text-primary hover:underline">Sign in</a>
				</p>
			</Card.Footer>
		</Card.Root>
	</div>

	<div class="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
		<div class="max-w-md text-primary-foreground space-y-6">
			<h2 class="text-3xl font-bold">Start building amazing apps today</h2>
			<p class="text-lg opacity-90">Join thousands of developers creating beautiful applications.</p>
			<div class="space-y-4">
				{#each ['Free tier available', 'No credit card required', 'Cancel anytime'] as item}
					<div class="flex items-center gap-3">
						<div class="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">✓</div>
						<span>{item}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
