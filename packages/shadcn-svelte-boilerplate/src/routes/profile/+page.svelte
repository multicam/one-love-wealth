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
