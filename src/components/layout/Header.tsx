'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import Button from '@/components/ui/Button';

export default function Header() {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="sticky top-0 z-40 glass border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                            DressAI
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`font-medium transition-colors ${pathname === '/dashboard' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
                                >
                                    My Closet
                                </Link>
                                <Link
                                    href="/outfits"
                                    className={`font-medium transition-colors ${pathname === '/outfits' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
                                >
                                    Outfits
                                </Link>
                                <Link
                                    href="/settings"
                                    className={`font-medium transition-colors ${pathname === '/settings' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
                                >
                                    Settings
                                </Link>
                            </>
                        ) : null}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <span className="hidden sm:block text-sm text-muted">
                                    {user.email}
                                </span>
                                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/login?signup=true">
                                    <Button size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
