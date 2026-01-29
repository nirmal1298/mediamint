import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Issue {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    project_id: number;
    reporter_id: number;
    assignee_id?: number;
    created_at: string;
}

interface IssueListResponse {
    items: Issue[];
    total: number;
    skip: number;
    limit: number;
}

export default function Issues() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const limit = 10;

    const fetchIssues = async (currentPage: number) => {
        try {
            setLoading(true);
            const skip = (currentPage - 1) * limit;
            const { data } = await api.get<IssueListResponse>('/issues/', {
                params: { skip, limit }
            });
            setIssues(data.items);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch issues", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues(page);
    }, [page]);

    const totalPages = Math.ceil(total / limit);

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'open': return 'default';
            case 'in_progress': return 'secondary';
            case 'resolved': return 'outline';
            case 'closed': return 'outline';
            default: return 'default';
        }
    };

    const getPriorityBadgeVariant = (priority: string) => {
        switch (priority) {
            case 'low': return 'outline';
            case 'medium': return 'secondary';
            case 'high': return 'destructive';
            default: return 'default';
        }
    };

    if (loading && issues.length === 0) {
        return <div className="flex h-screen items-center justify-center">Loading issues...</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-50">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b bg-white px-6">
                    <h1 className="text-2xl font-bold">Issues</h1>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {/* Table */}
                        <div className="rounded-md border bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="w-[120px]">Status</TableHead>
                                        <TableHead className="w-[120px]">Priority</TableHead>
                                        <TableHead className="w-[100px]">Project</TableHead>
                                        <TableHead className="w-[120px]">Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {issues.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                No issues found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        issues.map((issue) => (
                                            <TableRow key={issue.id}>
                                                <TableCell className="font-medium">
                                                    <Link to={`/issues/${issue.id}`} className="hover:underline">
                                                        #{issue.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link to={`/issues/${issue.id}`} className="hover:underline">
                                                        {issue.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(issue.status)}>
                                                        {issue.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getPriorityBadgeVariant(issue.priority)}>
                                                        {issue.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Link to={`/projects/${issue.project_id}`} className="hover:underline text-sm">
                                                        Project {issue.project_id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(issue.created_at).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} issues
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1 || loading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="text-sm">
                                        Page {page} of {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages || loading}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
