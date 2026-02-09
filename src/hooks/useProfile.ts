'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/supabase/types';

interface UseProfileResult {
    profile: Profile | null;
    isLoading: boolean;
    error: string | null;
    updateProfile: (updates: Partial<Pick<Profile, 'username' | 'display_name' | 'avatar_url'>>) => Promise<{ success: boolean; error?: string }>;
    checkUsernameAvailable: (username: string) => Promise<boolean>;
    refetch: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchProfile = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setProfile(null);
                setIsLoading(false);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (fetchError) {
                // Profile might not exist yet (new user before migration)
                if (fetchError.code === 'PGRST116') {
                    setProfile(null);
                } else {
                    setError(fetchError.message);
                }
            } else {
                setProfile(data as Profile);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const checkUsernameAvailable = useCallback(async (username: string): Promise<boolean> => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .ilike('username', username)
            .single();

        if (error && error.code === 'PGRST116') {
            // No profile found = username is available
            return true;
        }

        // If found, check if it's the current user's profile
        if (data && user && data.id === user.id) {
            return true; // User's own username
        }

        return !data;
    }, [supabase]);

    const updateProfile = useCallback(async (
        updates: Partial<Pick<Profile, 'username' | 'display_name' | 'avatar_url'>>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, error: 'Not authenticated' };
            }

            // If updating username, check availability first
            if (updates.username) {
                const isAvailable = await checkUsernameAvailable(updates.username);
                if (!isAvailable) {
                    return { success: false, error: 'Username is already taken' };
                }
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (updateError) {
                return { success: false, error: updateError.message };
            }

            // Refetch to get updated data
            await fetchProfile();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
        }
    }, [supabase, fetchProfile, checkUsernameAvailable]);

    return {
        profile,
        isLoading,
        error,
        updateProfile,
        checkUsernameAvailable,
        refetch: fetchProfile,
    };
}
