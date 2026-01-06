<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Input } from '$lib/components/ui/input';
    import { Search, Filter, Download, RefreshCw, ChevronRight, AlertCircle, Info, Bug, CheckCircle } from '@lucide/svelte';

    const logs = [
        { timestamp: '12:45:32.123', level: 'info', message: 'Request received', details: 'POST /v1/chat/completions', requestId: 'req_abc123' },
        { timestamp: '12:45:32.456', level: 'debug', message: 'Context assembled', details: '14,520 tokens', requestId: 'req_abc123' },
        { timestamp: '12:45:32.789', level: 'info', message: 'Tool called: web_search', details: 'Query: "SvelteKit best practices"', requestId: 'req_abc123' },
        { timestamp: '12:45:35.012', level: 'debug', message: 'Tool response received', details: '3 results, 2,340 tokens', requestId: 'req_abc123' },
        { timestamp: '12:45:38.345', level: 'info', message: 'Response generated', details: '847 tokens, 5.2s latency', requestId: 'req_abc123' },
        { timestamp: '12:45:38.456', level: 'success', message: 'Request completed', details: 'Status: 200 OK', requestId: 'req_abc123' },
        { timestamp: '12:44:12.789', level: 'error', message: 'Rate limit exceeded', details: 'Retry after 30s', requestId: 'req_xyz789' },
        { timestamp: '12:43:45.012', level: 'warn', message: 'High token usage', details: '95% of context used', requestId: 'req_def456' }
    ];

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error': return AlertCircle;
            case 'warn': return AlertCircle;
            case 'debug': return Bug;
            case 'success': return CheckCircle;
            default: return Info;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-500';
            case 'warn': return 'text-yellow-500';
            case 'debug': return 'text-gray-500';
            case 'success': return 'text-green-500';
            default: return 'text-blue-500';
        }
    };
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Agent Logs" description="Debug and monitor agent activity" />
        <div class="flex gap-2">
            <Button variant="outline" size="icon">
                <RefreshCw class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
                <Download class="h-4 w-4" />
            </Button>
        </div>
    </div>
        <div class="flex gap-2">
            <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search logs..." class="pl-10 h-10" />
            </div>
            <select class="h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="all">All Levels</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
            </select>
        </div>

    <div class="space-y-4">
        <div class="p-4 space-y-2">
            {#each logs as log}
                {@const Icon = getLevelIcon(log.level)}
                <Card class="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent class="p-3">
                        <div class="flex items-start gap-3">
                            <Icon class="h-4 w-4 mt-0.5 shrink-0 {getLevelColor(log.level)}" />
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <code class="text-xs text-muted-foreground font-mono">{log.timestamp}</code>
                                    <Badge variant="outline" class="text-xs uppercase">{log.level}</Badge>
                                    <code class="text-xs text-muted-foreground">{log.requestId}</code>
                                </div>
                                <p class="font-medium text-sm mt-1">{log.message}</p>
                                <p class="text-sm text-muted-foreground">{log.details}</p>
                            </div>
                            <ChevronRight class="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>
    </div>

    <div class="border-t bg-muted/50 p-3 mt-4 rounded-lg">
        <div class="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing 8 logs</span>
            <Button variant="link" size="sm">Load more</Button>
        </div>
    </div>
</DashboardLayout>