<script lang="ts">
    import Sidebar from '$lib/components/layout/Sidebar.svelte';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';
    import * as Card from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import { cn } from '$lib/utils';
    import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-svelte';

    const today = new Date();
    let currentMonth = $state(today.getMonth());
    let currentYear = $state(today.getFullYear());

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const events = [
        { date: new Date(2026, 0, 6), title: 'Team Standup', time: '9:00 AM', color: 'bg-blue-500', type: 'meeting' },
        { date: new Date(2026, 0, 6), title: 'Product Review', time: '2:00 PM', color: 'bg-purple-500', type: 'meeting' },
        { date: new Date(2026, 0, 8), title: 'Client Call', time: '11:00 AM', color: 'bg-green-500', type: 'call' },
        { date: new Date(2026, 0, 10), title: 'Sprint Planning', time: '10:00 AM', color: 'bg-orange-500', type: 'meeting' },
        { date: new Date(2026, 0, 12), title: 'Design Workshop', time: '1:00 PM', color: 'bg-pink-500', type: 'workshop' },
        { date: new Date(2026, 0, 15), title: 'Quarterly Review', time: '3:00 PM', color: 'bg-red-500', type: 'meeting' }
    ];

    const upcomingEvents = [
        { title: 'Team Standup', time: '9:00 AM - 9:30 AM', location: 'Meeting Room A', attendees: 8, color: 'bg-blue-500' },
        { title: 'Product Review', time: '2:00 PM - 3:00 PM', location: 'Conference Room', attendees: 5, color: 'bg-purple-500' },
        { title: 'Client Call', time: '4:00 PM - 4:30 PM', location: 'Zoom', attendees: 3, color: 'bg-green-500' }
    ];

    function getDaysInMonth(month: number, year: number) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(month: number, year: number) {
        return new Date(year, month, 1).getDay();
    }

    function previousMonth() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
    }

    function nextMonth() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
    }

    function getEventsForDate(day: number) {
        return events.filter(
            (e) =>
                e.date.getDate() === day &&
                e.date.getMonth() === currentMonth &&
                e.date.getFullYear() === currentYear
        );
    }

    const calendarDays = $derived(() => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Previous month days
        const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, currentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, currentMonth: true });
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ day: i, currentMonth: false });
        }

        return days;
    });

    function isToday(day: number, isCurrentMonth: boolean) {
        return (
            isCurrentMonth &&
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    }
</script>

<div class="flex min-h-screen">
    <Sidebar />

    <main class="flex-1 p-8">
        <div class="flex items-center justify-between mb-8">
            <PageHeader title="Calendar" description="Schedule and manage your events." />
            <Button>
                <Plus class="mr-2 h-4 w-4" />
                New Event
            </Button>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
            <!-- Calendar Grid -->
            <Card.Root class="lg:col-span-2">
                <Card.Header>
                    <div class="flex items-center justify-between">
                        <Card.Title>{monthNames[currentMonth]} {currentYear}</Card.Title>
                        <div class="flex items-center gap-2">
                            <Button variant="outline" size="icon" onclick={previousMonth}>
                                <ChevronLeft class="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onclick={() => { currentMonth = today.getMonth(); currentYear = today.getFullYear(); }}>
                                Today
                            </Button>
                            <Button variant="outline" size="icon" onclick={nextMonth}>
                                <ChevronRight class="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Content>
                    <div class="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
                        {#each dayNames as day}
                            <div class="bg-background p-2 text-center text-sm font-medium text-muted-foreground">
                                {day}
                            </div>
                        {/each}

                        {#each calendarDays() as { day, currentMonth: isCurrent }}
                            {@const dayEvents = isCurrent ? getEventsForDate(day) : []}
                            <div
                                    class={cn(
									'bg-background p-2 min-h-[100px] text-sm',
									!isCurrent && 'text-muted-foreground/50'
								)}
                            >
								<span
                                        class={cn(
										'inline-flex h-7 w-7 items-center justify-center rounded-full',
										isToday(day, isCurrent) && 'bg-primary text-primary-foreground font-semibold'
									)}
                                >
									{day}
								</span>
                                <div class="mt-1 space-y-1">
                                    {#each dayEvents.slice(0, 2) as event}
                                        <div class={cn('text-xs p-1 rounded truncate text-white', event.color)}>
                                            {event.title}
                                        </div>
                                    {/each}
                                    {#if dayEvents.length > 2}
                                        <div class="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </Card.Content>
            </Card.Root>

            <!-- Upcoming Events -->
            <div class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Today's Schedule</Card.Title>
                        <Card.Description>
                            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-4">
                        {#each upcomingEvents as event}
                            <div class="flex gap-3">
                                <div class={cn('w-1 rounded-full', event.color)}></div>
                                <div class="flex-1">
                                    <p class="font-medium">{event.title}</p>
                                    <div class="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Clock class="h-3 w-3" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin class="h-3 w-3" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users class="h-3 w-3" />
                                        <span>{event.attendees} attendees</span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </Card.Content>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title>Quick Actions</Card.Title>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <Button variant="outline" class="w-full justify-start">
                            <Plus class="mr-2 h-4 w-4" />
                            Schedule Meeting
                        </Button>
                        <Button variant="outline" class="w-full justify-start">
                            <Clock class="mr-2 h-4 w-4" />
                            Set Reminder
                        </Button>
                        <Button variant="outline" class="w-full justify-start">
                            <Users class="mr-2 h-4 w-4" />
                            Invite Team
                        </Button>
                    </Card.Content>
                </Card.Root>
            </div>
        </div>
    </main>
</div>