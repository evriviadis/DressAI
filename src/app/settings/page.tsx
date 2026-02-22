'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import Button from '@/components/ui/Button';
import MobileNav from '@/components/layout/MobileNav';

export default function SettingsPage() {
    const router = useRouter();
    const { profile, isLoading: profileLoading, updateProfile, checkUsernameAvailable } = useProfile();

    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const supabase = createClient();

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setDisplayName(profile.display_name || '');
        }
    }, [profile]);

    useEffect(() => {
        if (!username || username === profile?.username) {
            setUsernameAvailable(null);
            return;
        }
        const timer = setTimeout(async () => {
            setIsCheckingUsername(true);
            const available = await checkUsernameAvailable(username);
            setUsernameAvailable(available);
            setIsCheckingUsername(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [username, profile?.username, checkUsernameAvailable]);

    const validateUsername = (value: string): string | null => {
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be at most 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores allowed';
        return null;
    };

    const handleUpdateProfile = async () => {
        setProfileMessage(null);
        const err = validateUsername(username);
        if (err) { setProfileMessage({ type: 'error', text: err }); return; }
        if (usernameAvailable === false) { setProfileMessage({ type: 'error', text: 'Username is already taken' }); return; }
        setIsUpdatingProfile(true);
        const result = await updateProfile({ username: username.toLowerCase(), display_name: displayName.trim() || undefined });
        setProfileMessage(result.success ? { type: 'success', text: 'Profile updated!' } : { type: 'error', text: result.error || 'Failed to update' });
        setIsUpdatingProfile(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleDeleteAccount = async () => {
        if (confirmText !== 'DELETE') { alert('Please type DELETE to confirm'); return; }
        setIsDeleting(true);
        try {
            const response = await fetch('/api/account', { method: 'DELETE' });
            if (response.ok) { router.push('/'); }
            else { const data = await response.json(); alert(data.error || 'Failed to delete account'); }
        } catch { alert('Failed to delete account'); }
        finally { setIsDeleting(false); }
    };

    const inputClass = 'w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-neutral-600 focus:border-white/40 focus:outline-none transition-colors text-sm';
    const labelClass = 'block text-xs font-medium text-neutral-500 mb-1.5 tracking-wide uppercase';

    return (
        <div className="min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-xl mx-auto px-5 py-8">
                <h1 className="text-2xl font-semibold text-white mb-8">Settings</h1>

                <div className="space-y-8">
                    {/* Profile */}
                    <section>
                        <h2 className="text-xs font-medium text-neutral-600 tracking-widest uppercase mb-4">Profile</h2>
                        <div className="border border-white/8 p-5 space-y-4">
                            {profileLoading ? (
                                <div className="space-y-3">
                                    <div className="h-10 skeleton" />
                                    <div className="h-10 skeleton" />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className={labelClass}>Username</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 text-sm">@</span>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                maxLength={20}
                                                className={`${inputClass} pl-8 pr-10`}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {isCheckingUsername ? (
                                                    <div className="w-4 h-4 border border-neutral-600 border-t-white rounded-full animate-spin" />
                                                ) : usernameAvailable === true ? (
                                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                ) : usernameAvailable === false ? (
                                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                ) : null}
                                            </div>
                                        </div>
                                        <p className="mt-1 text-xs text-neutral-700">3–20 chars, letters, numbers, underscores</p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Display Name <span className="normal-case font-normal">(optional)</span></label>
                                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={50} placeholder="Your display name" className={inputClass} />
                                    </div>
                                    {profileMessage && (
                                        <p className={`text-xs animate-fade-in ${profileMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {profileMessage.text}
                                        </p>
                                    )}
                                    <Button
                                        onClick={handleUpdateProfile}
                                        isLoading={isUpdatingProfile}
                                        disabled={usernameAvailable === false || isCheckingUsername}
                                    >
                                        Save Changes
                                    </Button>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Account */}
                    <section>
                        <h2 className="text-xs font-medium text-neutral-600 tracking-widest uppercase mb-4">Account</h2>
                        <div className="border border-white/8 p-5">
                            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section>
                        <h2 className="text-xs font-medium text-red-900 tracking-widest uppercase mb-4">Danger Zone</h2>
                        <div className="border border-red-500/15 p-5">
                            <p className="text-xs text-neutral-600 mb-4">Deleting your account is permanent. All items and outfits will be lost.</p>
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-sm text-red-500 hover:text-red-300 transition-colors cursor-pointer border border-red-500/30 px-4 py-2 hover:border-red-400/50"
                                >
                                    Delete Account
                                </button>
                            ) : (
                                <div className="space-y-3 animate-fade-in">
                                    <p className="text-xs text-neutral-500">Type <strong className="text-white">DELETE</strong> to confirm:</p>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={e => setConfirmText(e.target.value)}
                                        placeholder="DELETE"
                                        className={inputClass}
                                    />
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => { setShowDeleteConfirm(false); setConfirmText(''); }}>Cancel</Button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting || confirmText !== 'DELETE'}
                                            className="text-sm text-red-400 border border-red-500/30 px-4 py-2 hover:border-red-400/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                        >
                                            {isDeleting ? 'Deleting…' : 'Delete My Account'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            <MobileNav />
        </div>
    );
}
