<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { Progress } from '$lib/components/ui/progress';
    import { Badge } from '$lib/components/ui/badge';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Upload, Play, Pause, CheckCircle, XCircle, Clock, Cpu, FileJson } from 'lucide-svelte';

    const jobs = [
        { id: 1, name: 'Customer Support v2', status: 'running', progress: 67, epochs: '2/3', baseModel: 'Claude Sonnet', samples: 1250 },
        { id: 2, name: 'Legal Assistant', status: 'completed', progress: 100, epochs: '3/3', baseModel: 'Claude Opus', samples: 3400 },
        { id: 3, name: 'Code Review Bot', status: 'failed', progress: 23, epochs: '1/3', baseModel: 'Claude Sonnet', samples: 890 }
    ];
</script>

<DashboardLayout>
    <PageHeader title="Fine-Tuning" description="Train custom models on your data" />

    <div class="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>New Fine-Tune Job</CardTitle>
                <CardDescription>Upload training data and configure your model</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload class="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p class="font-medium">Upload Training Data</p>
                    <p class="text-sm text-muted-foreground mb-4">JSONL format with prompt/completion pairs</p>
                    <Button variant="outline">Choose File</Button>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label>Base Model</Label>
                        <select class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">Select model</option>
                            <option value="opus">Claude Opus 4.5</option>
                            <option value="sonnet">Claude Sonnet 4</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <Label>Epochs</Label>
                        <select class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">Select</option>
                            <option value="1">1 epoch</option>
                            <option value="2">2 epochs</option>
                            <option value="3">3 epochs</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label>Job Name</Label>
                    <Input placeholder="my-custom-model-v1" class="h-12" />
                </div>
            </CardContent>
        </Card>

        <div class="space-y-3">
            <h2 class="font-semibold text-lg">Training Jobs</h2>
            {#each jobs as job}
                <Card>
                    <CardContent class="p-4 space-y-4">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-3">
                                <div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Cpu class="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p class="font-medium">{job.name}</p>
                                    <p class="text-sm text-muted-foreground">{job.baseModel} · {job.samples} samples</p>
                                </div>
                            </div>
                            <Badge variant={job.status === 'completed' ? 'default' : job.status === 'running' ? 'secondary' : 'destructive'}>
                                {#if job.status === 'completed'}
                                    <CheckCircle class="h-3 w-3 mr-1" />
                                {:else if job.status === 'failed'}
                                    <XCircle class="h-3 w-3 mr-1" />
                                {:else}
                                    <Clock class="h-3 w-3 mr-1 animate-spin" />
                                {/if}
                                {job.status}
                            </Badge>
                        </div>

                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span>Epoch {job.epochs}</span>
                                <span>{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} class="h-2" />
                        </div>

                        {#if job.status === 'running'}
                            <div class="flex gap-2">
                                <Button variant="outline" size="sm" class="flex-1">
                                    <Pause class="h-4 w-4 mr-1" />
                                    Pause
                                </Button>
                                <Button variant="destructive" size="sm">Cancel</Button>
                            </div>
                        {:else if job.status === 'completed'}
                            <Button variant="outline" class="w-full">Deploy Model</Button>
                        {/if}
                    </CardContent>
                </Card>
            {/each}
        </div>
        <Button class="w-full h-12 gap-2">
            <Play class="h-5 w-5" />
            Start Training
        </Button>
    </div>
</DashboardLayout>