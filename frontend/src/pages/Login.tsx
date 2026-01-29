import { LoginForm } from '@/components/login-form';

export default function Login() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 light">
            <div className="w-full max-w-6xl">
                <LoginForm />
            </div>
        </div>
    );
}
