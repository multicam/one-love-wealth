<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Separator } from '$lib/components/ui/separator';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
</script>

<div class="min-h-screen flex items-center justify-center bg-muted/40 p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<Card.Title class="text-2xl">Welcome back</Card.Title>
			<Card.Description>Enter your credentials to access your account</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<Button variant="outline">Google</Button>
				<Button variant="outline">GitHub</Button>
			</div>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<Separator class="w-full" />
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-card px-2 text-muted-foreground">Or continue with</span>
				</div>
			</div>

			<form class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="name@example.com" bind:value={email} />
				</div>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="password">Password</Label>
						<a href="#" class="text-sm text-primary hover:underline">Forgot password?</a>
					</div>
					<Input id="password" type="password" bind:value={password} />
				</div>
				<div class="flex items-center space-x-2">
					<Checkbox id="remember" bind:checked={rememberMe} />
					<Label for="remember" class="text-sm font-normal">Remember me</Label>
				</div>
				<Button class="w-full" type="submit">Sign in</Button>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				Don't have an account?
				<a href="/auth/register" class="text-primary hover:underline">Sign up</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
