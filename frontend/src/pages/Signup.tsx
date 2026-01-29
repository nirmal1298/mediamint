import { SignupForm } from '@/components/signup-form';

export default function Signup() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-6xl">
                <SignupForm />
            </div>
        </div>
    );
}
