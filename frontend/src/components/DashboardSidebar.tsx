import { Link, useLocation, Navigate } from 'react-router-dom';
import { Home, ListTodo, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function DashboardSidebar() {
    const location = useLocation();
    const { user, logout, isLoading } = useAuth();

    // If not authenticated, redirect to login
    if (!isLoading && !user) {
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        {
            title: 'Projects',
            href: '/',
            icon: Home,
        },
        {
            title: 'Issues',
            href: '/issues',
            icon: ListTodo,
        },
    ];

    return (
        <div className="flex h-full w-[280px] flex-col border-r bg-white">
            <div className="flex h-16 items-center border-b px-6">
                <h2 className="text-lg font-bold">IssueHub</h2>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-neutral-100 text-neutral-900'
                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* User info and logout at bottom */}
            <div className="border-t p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground truncate">{user?.email}</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
