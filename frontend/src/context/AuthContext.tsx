import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/api/client';

interface User {
    id: number;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const { data } = await api.get('/users/me');
                setUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        await fetchUser();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
