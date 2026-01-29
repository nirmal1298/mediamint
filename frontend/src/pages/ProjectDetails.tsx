import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardSidebar } from '@/components/DashboardSidebar';

interface Project {
    id: number;
    name: string;
    key: string;
    description: string;
}

interface Issue {
    id: number;
    title: string;
    status: string;
    priority: string;
    reporter_id: number;
    assignee_id?: number;
}

export default function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Issue State
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState('medium');
    const [createLoading, setCreateLoading] = useState(false);

    const fetchData = async () => {
        try {
            if (!id) return;

            const pRes = await api.get(`/projects/${id}`);
            setProject(pRes.data);

            const iRes = await api.get('/issues/', { params: { project_id: id } });
            setIssues(iRes.data.items || iRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleCreateIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setCreateLoading(true);
        try {
            await api.post('/issues/', {
                title,
                description: desc,
                priority,
                project_id: parseInt(id),
                status: 'open'
            });
            setOpen(false);
            setTitle('');
            setDesc('');
            setPriority('medium');
            fetchData(); // Refresh list
        } catch (err) {
            console.error(err);
        } finally {
            setCreateLoading(false);
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'open': return 'default'; // default in shadcn badge is black/primary
            case 'in_progress': return 'secondary'; // blue-ish usually
            case 'resolved': return 'outline';
            case 'closed': return 'destructive'; // red
            default: return 'outline';
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!project) return <div className="flex h-screen items-center justify-center">Project not found</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-50">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b bg-white px-6">
                    <div>
                        <h1 className="text-xl font-bold">{project.name}</h1>
                        <p className="text-xs text-muted-foreground">Key: {project.key}</p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> New Issue</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Issue</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateIssue} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea id="desc" value={desc} onChange={e => setDesc(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" disabled={createLoading} className="w-full">
                                    {createLoading ? 'Creating...' : 'Create Issue'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Issues</CardTitle>
                            <CardDescription>Manage and track issues for this project.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {issues.map((issue) => (
                                        <TableRow key={issue.id}>
                                            <TableCell className="font-medium">{project.key}-{issue.id}</TableCell>
                                            <TableCell>
                                                <Link to={`/issues/${issue.id}`} className="hover:underline font-medium">
                                                    {issue.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusColor(issue.status) as "default" | "secondary" | "outline" | "destructive"}>
                                                    {issue.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs uppercase font-bold ${issue.priority === 'critical' || issue.priority === 'high' ? 'text-red-500' : 'text-neutral-500'}`}>
                                                    {issue.priority}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link to={`/issues/${issue.id}`}>View</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {issues.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                No issues found in this project.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
