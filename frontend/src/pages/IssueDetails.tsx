import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { Pencil, X, Check } from 'lucide-react';

interface User {
    id: number;
    email: string;
    name?: string;
}

interface Issue {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    project_id: number;
    reporter_id: number;
    assignee_id?: number;
    reporter?: User;
}

interface Comment {
    id: number;
    body: string;
    author_id: number;
    created_at: string;
    author?: User;
    // Backend comment schema might not nest author yet, but we can fetch it or just show ID for now.
    // Actually, standard practice is to include author info. Let's assume standard behavior or just show email if available.
}

export default function IssueDetails() {
    const { id } = useParams<{ id: string }>();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    // Comment State
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    // Status Update State
    const [status, setStatus] = useState('');

    // Description Edit State
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editedDescription, setEditedDescription] = useState('');
    const [descriptionLoading, setDescriptionLoading] = useState(false);

    // Project Member State (for permission checks)
    const [projectMemberRole, setProjectMemberRole] = useState<string | null>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [userSkip, setUserSkip] = useState(0);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);

    // Assignee State
    const [assigneeLoading, setAssigneeLoading] = useState(false);

    // Auth
    const { user } = useAuth();

    const fetchData = async () => {
        try {
            if (!id) return;

            const iRes = await api.get(`/issues/${id}`);
            setIssue(iRes.data);
            setStatus(iRes.data.status);

            // Fetch all users for assignee dropdown (with pagination)
            try {
                const usersRes = await api.get(`/users/?skip=0&limit=10`);
                setAllUsers(usersRes.data);
                setHasMoreUsers(usersRes.data.length === 10);
                setUserSkip(10);
            } catch (err) {
                console.error("Failed to fetch users", err);
            }

            // Check current user's role using dedicated endpoint
            if (user) {
                try {
                    const myMembershipRes = await api.get(`/projects/${iRes.data.project_id}/my-membership`);
                    setProjectMemberRole(myMembershipRes.data.role);
                } catch (err) {
                    console.error("Failed to fetch user membership", err);
                }
            }

            const cRes = await api.get(`/comments/issue/${id}`);
            setComments(cRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, user]);

    const loadMoreUsers = async () => {
        if (!hasMoreUsers) return;
        try {
            const usersRes = await api.get(`/users/?skip=${userSkip}&limit=10`);
            setAllUsers(prev => [...prev, ...usersRes.data]);
            setHasMoreUsers(usersRes.data.length === 10);
            setUserSkip(prev => prev + 10);
        } catch (err) {
            console.error("Failed to load more users", err);
        }
    };

    // Permission check: can user edit this issue?
    const canEditIssue = () => {
        if (!user || !issue) return false;

        // Check if user is project maintainer
        const isMaintainer = projectMemberRole === 'maintainer';

        // Check if user is issue reporter
        const isReporter = issue.reporter_id === user.id;

        return isMaintainer || isReporter;
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await api.patch(`/issues/${id}`, { status: newStatus });
            setStatus(newStatus);
            if (issue) setIssue({ ...issue, status: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            await api.post(`/comments/issue/${id}`, { body: newComment });
            setNewComment('');
            // Refresh comments
            const cRes = await api.get(`/comments/issue/${id}`);
            setComments(cRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleEditDescription = () => {
        setEditedDescription(issue?.description || '');
        setIsEditingDescription(true);
    };

    const handleSaveDescription = async () => {
        if (!id) return;
        setDescriptionLoading(true);
        try {
            await api.patch(`/issues/${id}`, { description: editedDescription });
            if (issue) {
                setIssue({ ...issue, description: editedDescription });
            }
            setIsEditingDescription(false);
        } catch (err) {
            console.error("Failed to update description", err);
        } finally {
            setDescriptionLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingDescription(false);
        setEditedDescription('');
    };

    const handleAssigneeChange = async (newAssigneeId: string) => {
        if (!id) return;
        setAssigneeLoading(true);
        try {
            const assigneeId = newAssigneeId === "unassigned" ? null : parseInt(newAssigneeId);
            await api.patch(`/issues/${id}`, { assignee_id: assigneeId });
            if (issue) {
                setIssue({ ...issue, assignee_id: assigneeId || undefined });
            }
        } catch (err) {
            console.error("Failed to update assignee", err);
        } finally {
            setAssigneeLoading(false);
        }
    };


    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!issue) return <div className="flex h-screen items-center justify-center">Issue not found</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-50">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b bg-white px-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link to={`/projects/${issue.project_id}`} className="hover:underline">Project {issue.project_id}</Link>
                        <span>/</span>
                        <span>Issue #{issue.id}</span>
                    </div>
                    <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto space-y-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">{issue.title}</h1>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="md:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle>Description</CardTitle>
                                        {!isEditingDescription && canEditIssue() && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleEditDescription}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        {isEditingDescription ? (
                                            <div className="space-y-3">
                                                <Textarea
                                                    value={editedDescription}
                                                    onChange={(e) => setEditedDescription(e.target.value)}
                                                    className="min-h-[150px]"
                                                    placeholder="Enter issue description..."
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={handleSaveDescription}
                                                        disabled={descriptionLoading}
                                                        size="sm"
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        {descriptionLoading ? 'Saving...' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleCancelEdit}
                                                        disabled={descriptionLoading}
                                                        size="sm"
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {issue.description || "No description provided."}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <Card key={comment.id} className="bg-neutral-50 border-none shadow-none">
                                                <CardContent className="p-4 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="text-xs">U</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm font-medium">User {comment.author_id}</span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(comment.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">{comment.body}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {comments.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No comments yet.</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Textarea
                                            placeholder="Add a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <Button onClick={handlePostComment} disabled={commentLoading}>
                                            {commentLoading ? 'Posting...' : 'Post Comment'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-xs text-muted-foreground">Priority</span>
                                            <Badge variant="outline" className="w-fit">
                                                {issue.priority}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-xs text-muted-foreground">Reporter</span>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">R</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">User {issue.reporter_id}</span>
                                            </div>
                                        </div>
                                        {projectMemberRole?.toLowerCase() === 'maintainer' && (
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-xs text-muted-foreground">Assignee</span>
                                                <Select
                                                    value={issue.assignee_id?.toString() || "unassigned"}
                                                    onValueChange={handleAssigneeChange}
                                                    disabled={assigneeLoading}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Unassigned" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                                        {allUsers.map((user: any) => (
                                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                                {user.name || user.email}
                                                            </SelectItem>
                                                        ))}
                                                        {hasMoreUsers && (
                                                            <div className="p-2 border-t">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="w-full"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        loadMoreUsers();
                                                                    }}
                                                                >
                                                                    Load More...
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
