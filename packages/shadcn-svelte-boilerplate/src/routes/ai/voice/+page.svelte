<script lang="ts">
    import { DashboardLayout } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
    import { Mic, MicOff, Phone, Volume2, Settings, Bot } from '@lucide/svelte';

    let isListening = false;
    let isMuted = false;
</script>

<DashboardLayout noPadding>
<div class="flex h-full flex-col bg-gradient-to-b from-background to-muted">
    <header class="p-4">
        <div class="flex items-center justify-between">
            <Button variant="ghost" size="icon">
                <Settings class="h-5 w-5" />
            </Button>
            <p class="text-sm text-muted-foreground">Voice Assistant</p>
            <div class="w-10"></div>
        </div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        <div class="relative">
            <div class="absolute inset-0 rounded-full bg-primary/20 animate-ping {isListening ? '' : 'hidden'}"></div>
            <div class="absolute inset-0 scale-110 rounded-full bg-primary/10 animate-pulse {isListening ? '' : 'hidden'}"></div>
            <Avatar class="h-32 w-32 relative">
                <AvatarFallback class="bg-primary text-primary-foreground text-4xl">
                    <Bot class="h-16 w-16" />
                </AvatarFallback>
            </Avatar>
        </div>

        <div class="text-center space-y-2">
            <h2 class="text-2xl font-bold">
                {isListening ? 'Listening...' : 'Tap to speak'}
            </h2>
            <p class="text-muted-foreground">
                {isListening ? '"How can I help you today?"' : 'Press the microphone to start'}
            </p>
        </div>

        <Card class="w-full max-w-sm {isListening ? 'border-primary' : ''}">
            <CardContent class="p-4">
                <div class="flex items-center justify-center gap-1 h-12">
                    {#each Array(20) as _, i}
                        <div
                                class="w-1 bg-primary rounded-full transition-all duration-150"
                                style="height: {isListening ? Math.random() * 100 : 20}%"
                        ></div>
                    {/each}
                </div>
            </CardContent>
        </Card>
    </main>

    <div class="p-8 pb-12">
        <div class="flex items-center justify-center gap-6">
            <Button
                    variant="outline"
                    size="icon"
                    class="h-14 w-14 rounded-full"
                    onclick={() => isMuted = !isMuted}
            >
                {#if isMuted}
                    <MicOff class="h-6 w-6" />
                {:else}
                    <Volume2 class="h-6 w-6" />
                {/if}
            </Button>

            <Button
                    size="icon"
                    class="h-20 w-20 rounded-full {isListening ? 'bg-red-500 hover:bg-red-600' : ''}"
                    onclick={() => isListening = !isListening}
            >
                {#if isListening}
                    <Phone class="h-8 w-8" />
                {:else}
                    <Mic class="h-8 w-8" />
                {/if}
            </Button>

            <Button
                    variant="outline"
                    size="icon"
                    class="h-14 w-14 rounded-full"
            >
                <Settings class="h-6 w-6" />
            </Button>
        </div>
    </div>
</div>
</DashboardLayout>