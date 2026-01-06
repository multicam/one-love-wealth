<script lang="ts">
    import { DashboardLayout, PageHeader } from '$lib/components/layout';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { Switch } from '$lib/components/ui/switch';
    import { Label } from '$lib/components/ui/label';
    import { Separator } from '$lib/components/ui/separator';
    import { Badge } from '$lib/components/ui/badge';
    import { Shield, Globe, Database, FileText, Terminal, Mail, AlertTriangle } from 'lucide-svelte';
</script>

<DashboardLayout>
    <PageHeader title="Permissions" description="Configure agent access permissions" />

    <div class="space-y-4">
        <Card class="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardContent class="flex gap-3 p-4">
                <AlertTriangle class="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <p class="text-sm text-yellow-800 dark:text-yellow-200">
                    Changes to permissions take effect immediately. Review carefully before saving.
                </p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Globe class="h-5 w-5" />
                    Web Access
                </CardTitle>
                <CardDescription>Control internet connectivity</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Browse Web</Label>
                        <p class="text-sm text-muted-foreground">Search and read web pages</p>
                    </div>
                    <Switch checked />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Make API Calls</Label>
                        <p class="text-sm text-muted-foreground">Call external APIs</p>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Database class="h-5 w-5" />
                    Data Access
                </CardTitle>
                <CardDescription>Database and storage permissions</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Read Knowledge Base</Label>
                        <p class="text-sm text-muted-foreground">Access uploaded documents</p>
                    </div>
                    <Switch checked />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Write to Database</Label>
                        <p class="text-sm text-muted-foreground">Store and modify data</p>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Terminal class="h-5 w-5" />
                    Code Execution
                </CardTitle>
                <CardDescription>Runtime capabilities</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <Label>Run Code</Label>
                        <Badge variant="destructive" class="text-xs">High Risk</Badge>
                    </div>
                    <Switch checked />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>File System Access</Label>
                        <p class="text-sm text-muted-foreground">Read/write local files</p>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Mail class="h-5 w-5" />
                    Communications
                </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Send Emails</Label>
                        <p class="text-sm text-muted-foreground">Send emails on your behalf</p>
                    </div>
                    <Switch />
                </div>
                <Separator />
                <div class="flex items-center justify-between">
                    <div>
                        <Label>Slack Integration</Label>
                        <p class="text-sm text-muted-foreground">Post to Slack channels</p>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>
        <Button class="w-full h-12 mt-4">Save Permissions</Button>
    </div>
</DashboardLayout>