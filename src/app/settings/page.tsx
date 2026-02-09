'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MobileNav from '@/components/layout/MobileNav';

export default function SettingsPage() {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const supabase = createClient();

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
                    <Card className="border-error/30">
                        <h2 className="text-lg font-semibold text-error mb-2">Danger Zone</h2>
                        <p className="text-muted text-sm mb-4">
                            Once you delete your account, there is no going back. All your items, outfits, and images will be permanently deleted.
                        </p>

                        {!showDeleteConfirm ? (
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="border-error text-error hover:bg-error/10"
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
                                    className="w-full px-4 py-3 rounded-xl border border-error/30 bg-background focus:border-error focus:ring-2 focus:ring-error/20 outline-none transition-all text-foreground"
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
                                        className="flex-1 bg-error hover:bg-error/90"
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
