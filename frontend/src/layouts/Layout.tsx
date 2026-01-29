import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Layout() {
    const { user, logout, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-neutral-50 light">
            <header className="sticky top-0 z-50 w-full border-b bg-white">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="font-bold text-lg">
                        IssueHub
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
                    </div>
                </div>
            </header>
            <main className="container py-6 px-4">
                <Outlet />
            </main>
        </div>
    );
}
