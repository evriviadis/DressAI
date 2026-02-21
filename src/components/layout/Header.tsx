'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useProfile } from '@/hooks/useProfile';
import Button from '@/components/ui/Button';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const { profile, isLoading: profileLoading } = useProfile();
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
        router.push('/');
    };

    // Display username or fallback to email
    const displayName = profile?.username
        ? `@${profile.username}`
        : profile?.display_name || user?.email;

    return (
        <header className="sticky top-0 z-40 glass border-b border-primary/10" style={{ boxShadow: '0 1px 20px rgba(224, 64, 251, 0.06)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <span className="text-2xl font-semibold gradient-text tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            evry<span className="font-bold">W</span>ear
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-3 sm:gap-6">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`text-sm sm:text-base font-medium transition-colors ${pathname === '/dashboard' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
                                >
                                    Closet
                                </Link>
                                <Link
                                    href="/outfits"
                                    className={`text-sm sm:text-base font-medium transition-colors ${pathname === '/outfits' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
                                >
                                    Outfits
                                </Link>
                                <Link
                                    href="/settings"
                                    className={`hidden md:inline font-medium transition-colors ${pathname === '/settings' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
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
                                    {profileLoading ? (
                                        <span className="inline-block w-20 h-4 rounded animate-pulse" style={{ background: 'rgba(130, 140, 200, 0.15)' }} />
                                    ) : (
                                        <span className="text-primary font-medium">{displayName}</span>
                                    )}
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
