<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';
    import { Progress } from '$lib/components/ui/progress';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Play, FileText, CheckCircle, XCircle, AlertTriangle, BarChart3, Target } from '@lucide/svelte';

    const evalSets = [
        { name: 'Accuracy Benchmark', tests: 150, passed: 142, failed: 8, score: 94.7 },
        { name: 'Safety & Guardrails', tests: 80, passed: 78, failed: 2, score: 97.5 },
        { name: 'Code Generation', tests: 200, passed: 184, failed: 16, score: 92.0 },
        { name: 'Reasoning Tasks', tests: 100, passed: 89, failed: 11, score: 89.0 }
    ];

    const recentRuns = [
        { id: 1, model: 'Code Assistant v2', evalSet: 'Code Generation', score: 94.2, time: '2 hours ago', status: 'passed' },
        { id: 2, model: 'Support Bot', evalSet: 'Safety & Guardrails', score: 98.1, time: '5 hours ago', status: 'passed' },
        { id: 3, model: 'Research Agent', evalSet: 'Reasoning Tasks', score: 76.4, time: 'Yesterday', status: 'failed' }
    ];
</script>

<DashboardLayout>
    <div class="flex items-center justify-between mb-8">
        <PageHeader title="Evaluations" description="Test and benchmark your models" />
        <Button class="gap-2">
            <Play class="h-4 w-4" />
            Run Eval
        </Button>
    </div>

    <div class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
            <Card>
                <CardContent class="p-4 text-center">
                    <Target class="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p class="text-3xl font-bold">93.3%</p>
                    <p class="text-sm text-muted-foreground">Avg Score</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent class="p-4 text-center">
                    <BarChart3 class="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p class="text-3xl font-bold">530</p>
                    <p class="text-sm text-muted-foreground">Total Tests</p>
                </CardContent>
            </Card>
        </div>

        <Tabs value="sets">
            <TabsList class="w-full">
                <TabsTrigger value="sets" class="flex-1">Eval Sets</TabsTrigger>
                <TabsTrigger value="runs" class="flex-1">Recent Runs</TabsTrigger>
            </TabsList>

            <TabsContent value="sets" class="space-y-3 mt-4">
                {#each evalSets as evalSet}
                    <Card>
                        <CardContent class="p-4 space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <FileText class="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p class="font-medium">{evalSet.name}</p>
                                        <p class="text-sm text-muted-foreground">{evalSet.tests} test cases</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold">{evalSet.score}%</p>
                                </div>
                            </div>

                            <Progress value={evalSet.score} class="h-2" />

                            <div class="flex justify-between text-sm">
								<span class="flex items-center gap-1 text-green-600">
									<CheckCircle class="h-4 w-4" />
                                    {evalSet.passed} passed
								</span>
                                <span class="flex items-center gap-1 text-red-600">
									<XCircle class="h-4 w-4" />
                                    {evalSet.failed} failed
								</span>
                            </div>

                            <Button variant="outline" class="w-full">View Details</Button>
                        </CardContent>
                    </Card>
                {/each}
            </TabsContent>

            <TabsContent value="runs" class="space-y-3 mt-4">
                {#each recentRuns as run}
                    <Card>
                        <CardContent class="p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-medium">{run.model}</p>
                                    <p class="text-sm text-muted-foreground">{run.evalSet}</p>
                                </div>
                                <Badge variant={run.status === 'passed' ? 'default' : 'destructive'}>
                                    {run.score}%
                                </Badge>
                            </div>
                            <p class="text-xs text-muted-foreground mt-2">{run.time}</p>
                        </CardContent>
                    </Card>
                {/each}
            </TabsContent>
        </Tabs>
    </div>
</DashboardLayout>