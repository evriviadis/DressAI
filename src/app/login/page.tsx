'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [identifier, setIdentifier] = useState('');
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

    const validateUsername = (value: string): string | null => {
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be at most 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Letters, numbers, and underscores only';
        return null;
    };

    const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const resolveIdentifier = async (id: string): Promise<string> => {
        if (isEmail(id)) return id;
        const res = await fetch('/api/auth/resolve-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: id }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Username not found'); }
        return (await res.json()).email;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setMessage(null); setIsLoading(true);
        try {
            if (isSignUp) {
                const err = validateUsername(username);
                if (err) { setError(err); return; }
                if (password !== confirmPassword) { setError('Passwords do not match'); return; }
                const { error: signUpError } = await supabase.auth.signUp({
                    email, password,
                    options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { username: username.toLowerCase() } },
                });
                if (signUpError) throw signUpError;
                setMessage('Check your email for a confirmation link!');
            } else {
                const resolvedEmail = await resolveIdentifier(identifier);
                const { error: signInError } = await supabase.auth.signInWithPassword({ email: resolvedEmail, password });
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
        setError(null); setMessage(null); setIsLoading(true);
        try {
            const emailToReset = isEmail(identifier) ? identifier : await resolveIdentifier(identifier);
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

    const inputClass = 'w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-neutral-600 focus:border-white/40 focus:outline-none transition-colors text-sm';
    const labelClass = 'block text-xs font-medium text-neutral-400 mb-1.5 tracking-wide uppercase';

    const AlertBox = ({ msg, type }: { msg: string; type: 'error' | 'success' }) => (
        <div className={`p-3 border text-xs animate-fade-in ${type === 'error' ? 'border-red-500/30 text-red-400' : 'border-green-500/30 text-green-400'}`}>
            {msg}
        </div>
    );

    if (showForgotPassword) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-5 py-12">
                <div className="w-full max-w-sm">
                    <h1 className="text-2xl font-semibold text-white mb-1">Reset password</h1>
                    <p className="text-sm text-neutral-500 mb-8">Enter your email or username</p>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className={labelClass}>Email or Username</label>
                            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required className={inputClass} placeholder="you@example.com or username" />
                        </div>
                        {error && <AlertBox msg={error} type="error" />}
                        {message && <AlertBox msg={message} type="success" />}
                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Send Reset Link</Button>
                    </form>
                    <button onClick={() => { setShowForgotPassword(false); setError(null); setMessage(null); }} className="mt-6 text-sm text-neutral-500 hover:text-white transition-colors cursor-pointer">
                        ← Back to sign in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-5 py-12">
            <div className="w-full max-w-sm">
                <h1 className="text-2xl font-semibold text-white mb-1">
                    {isSignUp ? 'Create account' : 'Welcome back'}
                </h1>
                <p className="text-sm text-neutral-500 mb-8">
                    {isSignUp ? 'Start your AI styling journey' : 'Sign in to your wardrobe'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp ? (
                        <>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className={labelClass}>Username</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 text-sm">@</span>
                                    <input type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/@/g, '').replace(/[^a-z0-9_]/g, ''))} required maxLength={20} className={`${inputClass} pl-8`} placeholder="yourname" />
                                </div>
                                <p className="mt-1 text-xs text-neutral-600">3–20 chars, letters, numbers, underscores</p>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className={labelClass}>Email or Username</label>
                            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required className={inputClass} placeholder="you@example.com or username" />
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Password</label>
                        <input type="password" autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="••••••••" />
                    </div>

                    {isSignUp && (
                        <div>
                            <label className={labelClass}>Confirm Password</label>
                            <input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="••••••••" />
                        </div>
                    )}

                    {!isSignUp && (
                        <div className="text-right">
                            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-neutral-500 hover:text-white transition-colors cursor-pointer">
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {error && <AlertBox msg={error} type="error" />}
                    {message && <AlertBox msg={message} type="success" />}

                    <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>
                </form>

                <p className="mt-6 text-sm text-neutral-600">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                        className="text-white hover:underline cursor-pointer"
                    >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-neutral-600">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
