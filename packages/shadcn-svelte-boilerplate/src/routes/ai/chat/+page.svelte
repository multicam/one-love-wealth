<script lang="ts">
    import { DashboardLayout } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
    import { Send, Paperclip, Mic, MoreVertical, Bot, User } from 'lucide-svelte';

    let message = '';
    let messages = [
        { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' },
        { role: 'user', content: 'Can you help me write a function to parse JSON?' },
        { role: 'assistant', content: 'Of course! Here\'s a simple JSON parsing function:\n\n```typescript\nfunction parseJSON<T>(json: string): T | null {\n  try {\n    return JSON.parse(json) as T;\n  } catch {\n    return null;\n  }\n}\n```\n\nWould you like me to add error handling or validation?' }
    ];
</script>

<DashboardLayout noPadding>
    <div class="flex h-full flex-col">
        <header class="flex items-center justify-between border-b bg-background p-4">
            <div class="flex items-center gap-3">
                <Avatar class="h-10 w-10">
                    <AvatarFallback class="bg-primary text-primary-foreground">
                        <Bot class="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 class="font-semibold">Claude Assistant</h1>
                    <p class="text-xs text-green-500">● Online</p>
                </div>
            </div>
            <Button variant="ghost" size="icon">
                <MoreVertical class="h-5 w-5" />
            </Button>
        </header>

        <div class="flex-1 p-4 overflow-auto">
        <div class="space-y-4">
            {#each messages as msg}
                <div class="flex gap-3 {msg.role === 'user' ? 'flex-row-reverse' : ''}">
                    <Avatar class="h-8 w-8 shrink-0">
                        <AvatarFallback class={msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                            {#if msg.role === 'assistant'}
                                <Bot class="h-4 w-4" />
                            {:else}
                                <User class="h-4 w-4" />
                            {/if}
                        </AvatarFallback>
                    </Avatar>
                    <div class="max-w-[80%] rounded-2xl px-4 py-2 {msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}">
                        <p class="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="border-t bg-background p-4">
        <div class="flex items-end gap-2">
            <Button variant="ghost" size="icon" class="shrink-0">
                <Paperclip class="h-5 w-5" />
            </Button>
            <div class="relative flex-1">
                <Input
                        bind:value={message}
                        placeholder="Type a message..."
                        class="min-h-12 pr-12 rounded-full"
                />
                <Button variant="ghost" size="icon" class="absolute right-1 top-1/2 -translate-y-1/2">
                    <Mic class="h-5 w-5" />
                </Button>
            </div>
            <Button size="icon" class="h-12 w-12 shrink-0 rounded-full">
                <Send class="h-5 w-5" />
            </Button>
        </div>
        </div>
    </div>
</DashboardLayout>