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
