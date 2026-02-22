'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useProfile } from '@/hooks/useProfile';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const { profile } = useProfile();
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

    const displayName = profile?.username
        ? `@${profile.username}`
        : profile?.display_name || user?.email;

    return (
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/6">
            <div className="max-w-6xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1 group">
                    <span className="text-white font-semibold tracking-[-0.02em] text-base">
                        evry<span className="font-light text-neutral-400 group-hover:text-neutral-300 transition-colors duration-200">Wear</span>
                    </span>
                </Link>

                {/* Nav */}
                <nav className="flex items-center gap-7">
                    {user ? (
                        <>
                            {[{ href: '/dashboard', label: 'Closet' }, { href: '/outfits', label: 'Outfits' }, { href: '/settings', label: 'Settings' }].map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`hidden md:inline text-xs tracking-[0.08em] uppercase transition-colors duration-200 ${pathname === href ? 'text-white' : 'text-neutral-600 hover:text-neutral-300'}`}
                                >
                                    {label}
                                </Link>
                            ))}
                            <span className="hidden sm:block text-xs text-neutral-700">{displayName}</span>
                            <button
                                onClick={handleSignOut}
                                className="text-xs tracking-[0.08em] uppercase text-neutral-600 hover:text-white transition-colors duration-200 cursor-pointer"
                            >
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-xs tracking-[0.08em] uppercase text-neutral-600 hover:text-white transition-colors duration-200">
                                Sign in
                            </Link>
                            <Link
                                href="/login?signup=true"
                                className="text-xs tracking-[0.08em] uppercase border border-white/20 text-white px-5 py-2 hover:border-white/50 hover:bg-white/5 transition-all duration-200"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
