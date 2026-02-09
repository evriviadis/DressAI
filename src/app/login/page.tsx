'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        setIsSignUp(searchParams.get('signup') === 'true');
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }

                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                    },
                });

                if (signUpError) throw signUpError;
                setMessage('Check your email for a confirmation link!');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-light/10 -z-10" />

            <Card className="w-full max-w-md" padding="lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto gradient-hero rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </h1>
                    <p className="text-muted mt-2">
                        {isSignUp
                            ? 'Start your AI-powered style journey'
                            : 'Sign in to access your wardrobe'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted"
                            placeholder="••••••••"
                        />
                    </div>

                    {isSignUp && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm animate-fade-in">
                            {message}
                        </div>
                    )}

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>
                </form>

                {/* Toggle */}
                <p className="mt-6 text-center text-muted">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="ml-2 text-primary font-medium hover:underline"
                    >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                </p>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
