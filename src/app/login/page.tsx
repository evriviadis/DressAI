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
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [identifier, setIdentifier] = useState(''); // Email or username
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        setIsSignUp(searchParams.get('signup') === 'true');
    }, [searchParams]);

    // Username validation
    const validateUsername = (value: string): string | null => {
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be at most 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return null;
    };

    // Check if identifier is an email
    const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    // Resolve username to email for login
    const resolveIdentifier = async (identifier: string): Promise<string> => {
        if (isEmail(identifier)) {
            return identifier;
        }

        // It's a username, resolve it
        const response = await fetch('/api/auth/resolve-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Username not found');
        }

        const data = await response.json();
        return data.email;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        try {
            if (isSignUp) {
                // Validate username
                const usernameError = validateUsername(username);
                if (usernameError) {
                    setError(usernameError);
                    setIsLoading(false);
                    return;
                }

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
                        data: {
                            username: username.toLowerCase(),
                        },
                    },
                });

                if (signUpError) throw signUpError;
                setMessage('Check your email for a confirmation link!');
            } else {
                // Login - resolve identifier first
                const resolvedEmail = await resolveIdentifier(identifier);

                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: resolvedEmail,
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

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        try {
            // Resolve identifier to email if it's a username
            let emailToReset = identifier;
            if (!isEmail(identifier)) {
                emailToReset = await resolveIdentifier(identifier);
            }

            const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setMessage('Check your email for a password reset link!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    // Forgot Password View
    if (showForgotPassword) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md" padding="lg">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto gradient-hero rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
                        <p className="text-muted mt-2">Enter your email or username to reset</p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-foreground mb-2">
                                Email or Username
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl input-dark"
                                placeholder="you@example.com or username"
                            />
                        </div>

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
                            Send Reset Link
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-muted">
                        Remember your password?
                        <button
                            onClick={() => {
                                setShowForgotPassword(false);
                                setError(null);
                                setMessage(null);
                            }}
                            className="ml-2 text-primary font-medium hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </Card>
            </div>
        );
    }

    // Main Login/Signup View
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md" padding="lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto gradient-hero rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 mb-4 animate-glow-pulse">
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
                    {isSignUp ? (
                        <>
                            {/* Signup: Email field */}
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
                                    className="w-full px-4 py-3 rounded-xl input-dark"
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Signup: Username field */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        required
                                        maxLength={20}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl input-dark"
                                        placeholder="yourname"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-muted">3-20 characters, letters, numbers, underscores only</p>
                            </div>
                        </>
                    ) : (
                        /* Login: Email or Username field */
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-foreground mb-2">
                                Email or Username
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl input-dark"
                                placeholder="you@example.com or username"
                            />
                        </div>
                    )}

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
                            className="w-full px-4 py-3 rounded-xl input-dark"
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
                                className="w-full px-4 py-3 rounded-xl input-dark"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {/* Forgot Password Link (Login only) */}
                    {!isSignUp && (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm text-primary hover:underline"
                            >
                                Forgot password?
                            </button>
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
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                            setMessage(null);
                        }}
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
