#!/bin/bash

# =============================================================================
# shadcn-svelte Boilerplate Generator
# =============================================================================

PROJECT_NAME="shadcn-svelte-boilerplate"

echo "🚀 Creating $PROJECT_NAME..."

# Create project with sv
bunx sv create "$PROJECT_NAME" --template minimal --types ts --no-add-ons --no-install

cd "$PROJECT_NAME"

# Install dependencies
bun install

# Initialize shadcn-svelte (using defaults)
bunx shadcn-svelte@latest init

# Add components
bunx shadcn-svelte@latest add button card input label tabs table avatar dropdown-menu sheet dialog alert badge separator skeleton popover select textarea checkbox switch radio-group progress sonner

# Install additional dependencies
bun install lucide-svelte mode-watcher

# Create directory structure
mkdir -p src/lib/components/layout
mkdir -p src/routes/dashboard
mkdir -p src/routes/auth/login
mkdir -p src/routes/auth/register
mkdir -p src/routes/settings
mkdir -p src/routes/profile
mkdir -p src/routes/users
mkdir -p src/routes/forms
mkdir -p src/routes/pricing
mkdir -p "src/routes/[...catchall]"

# =============================================================================
# Create Layout Components
# =============================================================================

cat > src/lib/components/layout/Navbar.svelte << 'NAVBAREOF'
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Menu, Moon, Sun } from 'lucide-svelte';
	import { toggleMode, mode } from 'mode-watcher';

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/pricing', label: 'Pricing' }
	];
</script>

<header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="container flex h-16 items-center justify-between">
		<div class="flex items-center gap-6">
			<a href="/" class="text-xl font-bold">MyApp</a>
			<nav class="hidden md:flex gap-6">
				{#each navItems as item}
					<a href={item.href} class="text-sm text-muted-foreground hover:text-foreground transition-colors">
						{item.label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="ghost" size="icon" onclick={toggleMode}>
				{#if $mode === 'dark'}
					<Sun class="h-5 w-5" />
				{:else}
					<Moon class="h-5 w-5" />
				{/if}
			</Button>

			<div class="hidden md:flex gap-2">
				<Button variant="ghost" href="/auth/login">Login</Button>
				<Button href="/auth/register">Get Started</Button>
			</div>

			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button builders={[builder]} variant="ghost" size="icon" class="md:hidden">
						<Menu class="h-5 w-5" />
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="right">
					<Sheet.Header>
						<Sheet.Title>Menu</Sheet.Title>
					</Sheet.Header>
					<nav class="flex flex-col gap-4 mt-4">
						{#each navItems as item}
							<a href={item.href} class="text-lg">{item.label}</a>
						{/each}
						<hr class="my-2" />
						<Button variant="outline" href="/auth/login" class="w-full">Login</Button>
						<Button href="/auth/register" class="w-full">Get Started</Button>
					</nav>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</header>
NAVBAREOF

cat > src/lib/components/layout/Sidebar.svelte << 'SIDEBAREOF'
<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { LayoutDashboard, Users, Settings, FileText, User, CreditCard } from 'lucide-svelte';

	const sidebarItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/users', label: 'Users', icon: Users },
		{ href: '/forms', label: 'Forms', icon: FileText },
		{ href: '/profile', label: 'Profile', icon: User },
		{ href: '/pricing', label: 'Pricing', icon: CreditCard },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];
</script>

<aside class="hidden lg:flex w-64 flex-col border-r bg-muted/40 p-4">
	<div class="mb-8">
		<a href="/" class="text-xl font-bold">MyApp</a>
	</div>

	<nav class="flex-1 space-y-1">
		{#each sidebarItems as item}
			{@const isActive = $page.url.pathname === item.href}
			<a
				href={item.href}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
					isActive
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground'
				)}
			>
				<item.icon class="h-4 w-4" />
				{item.label}
			</a>
		{/each}
	</nav>
</aside>
SIDEBAREOF

cat > src/lib/components/layout/PageHeader.svelte << 'PAGEHEADEREOF'
<script lang="ts">
	interface Props {
		title: string;
		description?: string;
	}

	let { title, description }: Props = $props();
</script>

<div class="mb-8">
	<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
	{#if description}
		<p class="text-muted-foreground mt-2">{description}</p>
	{/if}
</div>
PAGEHEADEREOF

# =============================================================================
# Create Root Layout
# =============================================================================

cat > src/routes/+layout.svelte << 'LAYOUTEOF'
<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster richColors />

{@render children()}
LAYOUTEOF

# =============================================================================
# Create Pages
# =============================================================================

# Landing Page
cat > src/routes/+page.svelte << 'LANDINGEOF'
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
LANDINGEOF

# Dashboard Page
cat > src/routes/dashboard/+page.svelte << 'DASHBOARDEOF'
<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { TrendingUp, TrendingDown, Users, DollarSign, Activity, ShoppingCart } from 'lucide-svelte';

	const stats = [
		{ title: 'Total Revenue', value: '$45,231.89', change: '+20.1%', trend: 'up', icon: DollarSign },
		{ title: 'Subscriptions', value: '+2,350', change: '+180.1%', trend: 'up', icon: Users },
		{ title: 'Sales', value: '+12,234', change: '+19%', trend: 'up', icon: ShoppingCart },
		{ title: 'Active Now', value: '+573', change: '-2%', trend: 'down', icon: Activity }
	];

	const recentActivity = [
		{ user: 'Alice Johnson', action: 'Purchased Pro Plan', time: '2 min ago' },
		{ user: 'Bob Smith', action: 'Upgraded subscription', time: '15 min ago' },
		{ user: 'Carol White', action: 'Completed onboarding', time: '1 hour ago' },
		{ user: 'David Brown', action: 'Submitted support ticket', time: '2 hours ago' }
	];
</script>

<div class="flex min-h-screen">
	<Sidebar />
	<main class="flex-1 p-8">
		<PageHeader title="Dashboard" description="Welcome back! Here's an overview of your metrics." />

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
			{#each stats as stat}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">{stat.title}</Card.Title>
						<stat.icon class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{stat.value}</div>
						<p class="text-xs text-muted-foreground flex items-center gap-1">
							{#if stat.trend === 'up'}
								<TrendingUp class="h-3 w-3 text-green-500" />
							{:else}
								<TrendingDown class="h-3 w-3 text-red-500" />
							{/if}
							{stat.change} from last month
						</p>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
			<Card.Root class="lg:col-span-4">
				<Card.Header>
					<Card.Title>Overview</Card.Title>
					<Card.Description>Monthly revenue for the current year</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
						<p class="text-muted-foreground">Chart Component Here</p>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="lg:col-span-3">
				<Card.Header>
					<Card.Title>Recent Activity</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#each recentActivity as activity}
						<div class="flex items-center gap-4">
							<div class="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
								<span class="text-sm font-medium">{activity.user[0]}</span>
							</div>
							<div class="flex-1 space-y-1">
								<p class="text-sm font-medium">{activity.user}</p>
								<p class="text-xs text-muted-foreground">{activity.action}</p>
							</div>
							<span class="text-xs text-muted-foreground">{activity.time}</span>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root class="mt-8">
			<Card.Header>
				<Card.Title>Goals Progress</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-6">
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span>Monthly Revenue Target</span>
						<span class="text-muted-foreground">$45,231 / $50,000</span>
					</div>
					<Progress value={90} />
				</div>
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span>New Users Target</span>
						<span class="text-muted-foreground">2,350 / 3,000</span>
					</div>
					<Progress value={78} />
				</div>
			</Card.Content>
		</Card.Root>
	</main>
</div>
DASHBOARDEOF

# Login Page
cat > src/routes/auth/login/+page.svelte << 'LOGINEOF'
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
LOGINEOF

# Register Page
cat > src/routes/auth/register/+page.svelte << 'REGISTEREOF'
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
REGISTEREOF

# Settings Page
cat > src/routes/settings/+page.svelte << 'SETTINGSEOF'
<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { Separator } from '$lib/components/ui/separator';

	let notifications = $state({ email: true, push: false, marketing: false });
</script>

<div class="flex min-h-screen">
	<Sidebar />
	<main class="flex-1 p-8">
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
							<Select.Root>
								<Select.Trigger class="w-full md:w-[280px]">
									<Select.Value placeholder="Select language" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="en">English</Select.Item>
									<Select.Item value="es">Spanish</Select.Item>
									<Select.Item value="fr">French</Select.Item>
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
	</main>
</div>
SETTINGSEOF

# Profile Page
cat > src/routes/profile/+page.svelte << 'PROFILEEOF'
<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Camera, MapPin, Mail, Calendar } from 'lucide-svelte';

	const user = {
		name: 'John Doe',
		email: 'john@example.com',
		role: 'Senior Developer',
		location: 'San Francisco, CA',
		joinDate: 'January 2024',
		bio: 'Full-stack developer passionate about building great user experiences.',
		skills: ['Svelte', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS']
	};
</script>

<div class="flex min-h-screen">
	<Sidebar />
	<main class="flex-1 p-8">
		<PageHeader title="Profile" description="Manage your public profile information." />

		<div class="grid gap-6 lg:grid-cols-3">
			<Card.Root class="lg:col-span-1">
				<Card.Content class="pt-6">
					<div class="flex flex-col items-center text-center">
						<div class="relative">
							<Avatar.Root class="h-24 w-24">
								<Avatar.Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt={user.name} />
								<Avatar.Fallback>JD</Avatar.Fallback>
							</Avatar.Root>
							<Button size="icon" variant="secondary" class="absolute bottom-0 right-0 h-8 w-8 rounded-full">
								<Camera class="h-4 w-4" />
							</Button>
						</div>
						<h2 class="mt-4 text-xl font-semibold">{user.name}</h2>
						<p class="text-muted-foreground">{user.role}</p>
						<div class="mt-4 flex flex-wrap justify-center gap-2">
							{#each user.skills as skill}
								<Badge variant="secondary">{skill}</Badge>
							{/each}
						</div>
						<Separator class="my-6" />
						<div class="w-full space-y-3 text-left text-sm">
							<div class="flex items-center gap-3 text-muted-foreground">
								<MapPin class="h-4 w-4" />{user.location}
							</div>
							<div class="flex items-center gap-3 text-muted-foreground">
								<Mail class="h-4 w-4" />{user.email}
							</div>
							<div class="flex items-center gap-3 text-muted-foreground">
								<Calendar class="h-4 w-4" />Joined {user.joinDate}
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="lg:col-span-2">
				<Card.Header>
					<Card.Title>Edit Profile</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="displayName">Display Name</Label>
							<Input id="displayName" value={user.name} />
						</div>
						<div class="space-y-2">
							<Label for="role">Role / Title</Label>
							<Input id="role" value={user.role} />
						</div>
					</div>
					<div class="space-y-2">
						<Label for="bio">Bio</Label>
						<Textarea id="bio" value={user.bio} rows={4} />
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="location">Location</Label>
							<Input id="location" value={user.location} />
						</div>
						<div class="space-y-2">
							<Label for="skills">Skills</Label>
							<Input id="skills" value={user.skills.join(', ')} />
						</div>
					</div>
				</Card.Content>
				<Card.Footer class="flex justify-between">
					<Button variant="outline">Cancel</Button>
					<Button>Save Changes</Button>
				</Card.Footer>
			</Card.Root>
		</div>
	</main>
</div>
PROFILEEOF

# Users Page (Data Table)
cat > src/routes/users/+page.svelte << 'USERSEOF'
<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { MoreHorizontal, Plus, Search, Download, Filter } from 'lucide-svelte';

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

<div class="flex min-h-screen">
	<Sidebar />
	<main class="flex-1 p-8">
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
										<DropdownMenu.Trigger asChild let:builder>
											<Button builders={[builder]} variant="ghost" size="icon">
												<MoreHorizontal class="h-4 w-4" />
											</Button>
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
	</main>
</div>
USERSEOF

# Forms Page
cat > src/routes/forms/+page.svelte << 'FORMSEOF'
<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
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

	function handleSubmit(e: Event) {
		e.preventDefault();
		toast.success('Form submitted successfully!', { description: 'We will get back to you soon.' });
	}
</script>

<div class="flex min-h-screen">
	<Sidebar />
	<main class="flex-1 p-8">
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
							<Select.Root>
								<Select.Trigger><Select.Value placeholder="Select a category" /></Select.Trigger>
								<Select.Content>
									<Select.Item value="general">General Inquiry</Select.Item>
									<Select.Item value="support">Technical Support</Select.Item>
									<Select.Item value="sales">Sales</Select.Item>
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
	</main>
</div>
FORMSEOF

# Pricing Page
cat > src/routes/pricing/+page.svelte << 'PRICINGEOF'
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
PRICINGEOF

# 404 Page
cat > "src/routes/[...catchall]/+page.svelte" << 'NOTFOUNDEOF'
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
NOTFOUNDEOF

echo ""
echo "✅ Project created successfully!"
echo ""
echo "To get started:"
echo "  cd $PROJECT_NAME"
echo "  bun run dev"
echo ""
echo "Pages available:"
echo "  /              - Landing Page"
echo "  /dashboard     - Dashboard"
echo "  /auth/login    - Login"
echo "  /auth/register - Register"
echo "  /settings      - Settings"
echo "  /profile       - Profile"
echo "  /users         - Data Table"
echo "  /forms         - Forms"
echo "  /pricing       - Pricing"
echo "  /anything-else - 404 Page"