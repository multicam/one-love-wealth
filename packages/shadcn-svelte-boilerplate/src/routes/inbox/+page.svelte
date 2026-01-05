<script lang="ts">
    import Sidebar from '$lib/components/layout/Sidebar.svelte';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';
    import * as Card from '$lib/components/ui/card';
    import * as Avatar from '$lib/components/ui/avatar';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Badge } from '$lib/components/ui/badge';
    import { Separator } from '$lib/components/ui/separator';
    import { cn } from '$lib/utils';
    import {
        Search,
        Mail,
        Star,
        Trash2,
        Archive,
        Reply,
        Forward,
        MoreVertical,
        Paperclip,
        Clock
    } from 'lucide-svelte';

    const messages = [
        {
            id: 1,
            from: 'Alice Johnson',
            email: 'alice@example.com',
            subject: 'Project Update - Q1 Review',
            preview: 'Hi team, I wanted to share the latest updates on our Q1 progress...',
            time: '10:30 AM',
            unread: true,
            starred: true,
            labels: ['work']
        },
        {
            id: 2,
            from: 'GitHub',
            email: 'noreply@github.com',
            subject: '[svelte/svelte] New release v5.0.0',
            preview: 'A new release has been published for the repository you are watching...',
            time: '9:15 AM',
            unread: true,
            starred: false,
            labels: ['github']
        },
        {
            id: 3,
            from: 'Bob Smith',
            email: 'bob@example.com',
            subject: 'Re: Meeting Tomorrow',
            preview: 'Sounds good! I will be there at 2pm. Let me know if anything changes...',
            time: 'Yesterday',
            unread: false,
            starred: false,
            labels: ['work']
        },
        {
            id: 4,
            from: 'Stripe',
            email: 'receipts@stripe.com',
            subject: 'Your receipt from MyApp',
            preview: 'Thank you for your payment of $29.00. Your subscription has been renewed...',
            time: 'Yesterday',
            unread: false,
            starred: true,
            labels: ['receipts']
        },
        {
            id: 5,
            from: 'Carol White',
            email: 'carol@example.com',
            subject: 'Design Review Feedback',
            preview: 'I have reviewed the latest mockups and have some suggestions...',
            time: 'Mon',
            unread: false,
            starred: false,
            labels: ['work', 'design']
        },
        {
            id: 6,
            from: 'Newsletter',
            email: 'news@techdigest.com',
            subject: 'This Week in Tech - AI Updates',
            preview: 'The latest news and trends in artificial intelligence and machine learning...',
            time: 'Mon',
            unread: false,
            starred: false,
            labels: ['newsletter']
        }
    ];

    let selectedMessage = $state(messages[0]);
    let searchQuery = $state('');

    const filteredMessages = $derived(
        messages.filter(
            (m) =>
                m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.from.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    function getLabelColor(label: string) {
        const colors: Record<string, string> = {
            work: 'bg-blue-500',
            github: 'bg-gray-700',
            receipts: 'bg-green-500',
            design: 'bg-purple-500',
            newsletter: 'bg-orange-500'
        };
        return colors[label] || 'bg-gray-500';
    }
</script>

<div class="flex min-h-screen">
    <Sidebar />

    <main class="flex-1 flex flex-col">
        <div class="border-b p-4">
            <PageHeader title="Inbox" description="Manage your messages and communications." />
        </div>

        <div class="flex-1 flex">
            <!-- Message List -->
            <div class="w-full md:w-96 border-r flex flex-col">
                <div class="p-4 border-b">
                    <div class="relative">
                        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search messages..." class="pl-9" bind:value={searchQuery} />
                    </div>
                </div>

                <div class="flex-1 overflow-auto">
                    {#each filteredMessages as message (message.id)}
                        <button
                                class={cn(
								'w-full text-left p-4 border-b hover:bg-muted/50 transition-colors',
								selectedMessage?.id === message.id && 'bg-muted',
								message.unread && 'bg-primary/5'
							)}
                                onclick={() => (selectedMessage = message)}
                        >
                            <div class="flex items-start gap-3">
                                <Avatar.Root class="h-10 w-10 flex-shrink-0">
                                    <Avatar.Image
                                            src="https://api.dicebear.com/7.x/avataaars/svg?seed={message.from}"
                                            alt={message.from}
                                    />
                                    <Avatar.Fallback>{message.from[0]}</Avatar.Fallback>
                                </Avatar.Root>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between gap-2">
										<span class={cn('font-medium truncate', message.unread && 'font-semibold')}>
											{message.from}
										</span>
                                        <span class="text-xs text-muted-foreground flex-shrink-0">{message.time}</span>
                                    </div>
                                    <p class={cn('text-sm truncate', message.unread ? 'font-medium' : 'text-muted-foreground')}>
                                        {message.subject}
                                    </p>
                                    <p class="text-xs text-muted-foreground truncate mt-1">{message.preview}</p>
                                    <div class="flex items-center gap-2 mt-2">
                                        {#each message.labels as label}
                                            <div class={cn('h-2 w-2 rounded-full', getLabelColor(label))}></div>
                                        {/each}
                                        {#if message.starred}
                                            <Star class="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Message Detail -->
            <div class="hidden md:flex flex-1 flex-col">
                {#if selectedMessage}
                    <div class="p-4 border-b flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <Archive class="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Trash2 class="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" class="h-6" />
                            <Button variant="ghost" size="icon">
                                <Reply class="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Forward class="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreVertical class="h-4 w-4" />
                        </Button>
                    </div>

                    <div class="flex-1 overflow-auto p-6">
                        <div class="max-w-3xl">
                            <div class="flex items-start justify-between mb-6">
                                <div class="flex items-start gap-4">
                                    <Avatar.Root class="h-12 w-12">
                                        <Avatar.Image
                                                src="https://api.dicebear.com/7.x/avataaars/svg?seed={selectedMessage.from}"
                                                alt={selectedMessage.from}
                                        />
                                        <Avatar.Fallback>{selectedMessage.from[0]}</Avatar.Fallback>
                                    </Avatar.Root>
                                    <div>
                                        <h2 class="text-xl font-semibold">{selectedMessage.subject}</h2>
                                        <div class="flex items-center gap-2 mt-1">
                                            <span class="font-medium">{selectedMessage.from}</span>
                                            <span class="text-muted-foreground">&lt;{selectedMessage.email}&gt;</span>
                                        </div>
                                        <div class="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                            <Clock class="h-3 w-3" />
                                            <span>{selectedMessage.time}</span>
                                            <span>to me</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                        variant="ghost"
                                        size="icon"
                                        onclick={() => (selectedMessage.starred = !selectedMessage.starred)}
                                >
                                    <Star
                                            class={cn(
											'h-5 w-5',
											selectedMessage.starred && 'text-yellow-500 fill-yellow-500'
										)}
                                    />
                                </Button>
                            </div>

                            <div class="prose prose-sm max-w-none">
                                <p>Hi there,</p>
                                <p>{selectedMessage.preview}</p>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                                <p>
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                    culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                                <p>Best regards,<br />{selectedMessage.from}</p>
                            </div>

                            <Separator class="my-6" />

                            <div class="flex items-center gap-4">
                                <Button>
                                    <Reply class="mr-2 h-4 w-4" />
                                    Reply
                                </Button>
                                <Button variant="outline">
                                    <Forward class="mr-2 h-4 w-4" />
                                    Forward
                                </Button>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="flex-1 flex items-center justify-center text-muted-foreground">
                        <div class="text-center">
                            <Mail class="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Select a message to read</p>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </main>
</div>