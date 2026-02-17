'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MobileNav from '@/components/layout/MobileNav';

export default function SettingsPage() {
    const router = useRouter();
    const { profile, isLoading: profileLoading, updateProfile, checkUsernameAvailable } = useProfile();

    // Profile form state
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Delete account state
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const supabase = createClient();

    // Initialize form with profile data
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setDisplayName(profile.display_name || '');
        }
    }, [profile]);

    // Debounced username availability check
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

        const usernameError = validateUsername(username);
        if (usernameError) {
            setProfileMessage({ type: 'error', text: usernameError });
            return;
        }

        if (usernameAvailable === false) {
            setProfileMessage({ type: 'error', text: 'Username is already taken' });
            return;
        }

        setIsUpdatingProfile(true);

        const result = await updateProfile({
            username: username.toLowerCase(),
            display_name: displayName.trim() || undefined,
        });

        if (result.success) {
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } else {
            setProfileMessage({ type: 'error', text: result.error || 'Failed to update profile' });
        }

        setIsUpdatingProfile(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleDeleteAccount = async () => {
        if (confirmText !== 'DELETE') {
            alert('Please type DELETE to confirm');
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch('/api/account', {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete account');
            }
        } catch {
            alert('Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted mt-1">Manage your account and preferences</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <Card>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>

                        {profileLoading ? (
                            <div className="space-y-4">
                                <div className="h-12 rounded-xl skeleton" />
                                <div className="h-12 rounded-xl skeleton" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Username */}
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
                                            maxLength={20}
                                            className="w-full pl-8 pr-10 py-3 rounded-xl input-dark"
                                        />
                                        {/* Availability indicator */}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {isCheckingUsername ? (
                                                <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
                                            ) : usernameAvailable === true ? (
                                                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : usernameAvailable === false ? (
                                                <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            ) : null}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted mt-1">
                                        3-20 characters, letters, numbers, and underscores only
                                    </p>
                                </div>

                                {/* Display Name */}
                                <div>
                                    <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-2">
                                        Display Name <span className="text-muted font-normal">(optional)</span>
                                    </label>
                                    <input
                                        id="displayName"
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        maxLength={50}
                                        placeholder="Your display name"
                                        className="w-full px-4 py-3 rounded-xl input-dark"
                                    />
                                </div>

                                {/* Messages */}
                                {profileMessage && (
                                    <div className={`p-3 rounded-xl text-sm animate-fade-in ${profileMessage.type === 'success'
                                        ? 'bg-success/10 border border-success/20 text-success'
                                        : 'bg-error/10 border border-error/20 text-error'
                                        }`}>
                                        {profileMessage.text}
                                    </div>
                                )}

                                {/* Save Button */}
                                <Button
                                    onClick={handleUpdateProfile}
                                    isLoading={isUpdatingProfile}
                                    disabled={usernameAvailable === false || isCheckingUsername}
                                    className="w-full sm:w-auto"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Account Section */}
                    <Card>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>
                        <div className="space-y-4">
                            <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </Button>
                        </div>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-error/20">
                        <h2 className="text-lg font-semibold text-error mb-2">Danger Zone</h2>
                        <p className="text-muted text-sm mb-4">
                            Once you delete your account, there is no going back. All your items, outfits, and images will be permanently deleted.
                        </p>

                        {!showDeleteConfirm ? (
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="border-error/40 text-error hover:bg-error/10 hover:border-error"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Account
                            </Button>
                        ) : (
                            <div className="p-4 bg-error/5 rounded-xl border border-error/20 space-y-4 animate-fade-in">
                                <p className="text-sm text-foreground">
                                    To confirm, type <strong>DELETE</strong> below:
                                </p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="Type DELETE to confirm"
                                    className="w-full px-4 py-3 rounded-xl input-dark !border-error/30 focus:!border-error focus:!shadow-[0_0_0_3px_rgba(255,82,82,0.15)]"
                                />
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setConfirmText('');
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDeleteAccount}
                                        isLoading={isDeleting}
                                        disabled={confirmText !== 'DELETE'}
                                        className="flex-1 !bg-error hover:!bg-error/90 !from-error !via-error !to-error"
                                    >
                                        Delete My Account
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Mobile Nav */}
            <MobileNav />
        </div>
    );
}
