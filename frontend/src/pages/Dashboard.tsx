import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

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
    project_id: number;
}

export default function Dashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [assignedIssues, setAssignedIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    // New Project State
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [desc, setDesc] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects/');
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedIssues = async () => {
        if (!user) return;
        try {
            const { data } = await api.get(`/issues/?assignee_id=${user.id}`);
            setAssignedIssues(data.issues || []);
        } catch (error) {
            console.error("Failed to fetch assigned issues", error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchAssignedIssues();
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await api.post('/projects/', { name, key, description: desc });
            setOpen(false);
            // Reset form
            setName('');
            setKey('');
            setDesc('');
            fetchProjects();
        } catch (err) {
            console.error(err);
            // Handle error display
        } finally {
            setCreateLoading(false);
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Loading projects...</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-50">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b bg-white px-6">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> New Project</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="key">Key (e.g. PRJ)</Label>
                                    <Input id="key" value={key} onChange={e => setKey(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea id="desc" value={desc} onChange={e => setDesc(e.target.value)} />
                                </div>
                                <Button type="submit" disabled={createLoading} className="w-full">
                                    {createLoading ? 'Creating...' : 'Create Project'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Assigned Issues Section */}
                    {assignedIssues.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Assigned to Me</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {assignedIssues.map((issue) => (
                                    <Link key={issue.id} to={`/issues/${issue.id}`}>
                                        <Card className="hover:bg-neutral-50 transition-colors cursor-pointer h-full">
                                            <CardHeader>
                                                <CardTitle className="text-base">{issue.title}</CardTitle>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="outline">{issue.status}</Badge>
                                                    <Badge variant="outline">{issue.priority}</Badge>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects Section */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">My Projects</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project) => (
                                <Link key={project.id} to={`/projects/${project.id}`}>
                                    <Card className="hover:bg-neutral-50 transition-colors cursor-pointer h-full">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle>{project.name}</CardTitle>
                                                <span className="text-xs font-mono bg-neutral-100 text-neutral-800 px-2 py-1 rounded border border-neutral-200">{project.key}</span>
                                            </div>
                                            <CardDescription className="line-clamp-2 text-muted-foreground">{project.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                            {projects.length === 0 && (
                                <div className="col-span-full text-center py-10 text-muted-foreground">
                                    No projects found. Create one to get started.
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

