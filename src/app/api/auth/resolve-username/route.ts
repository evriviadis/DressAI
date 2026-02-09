import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/resolve-username
 * Resolves a username to an email address for login
 * If input is already an email, returns it as-is
 */
export async function POST(request: NextRequest) {
    try {
        const { identifier } = await request.json();

        if (!identifier || typeof identifier !== 'string') {
            return NextResponse.json(
                { error: 'Identifier is required' },
                { status: 400 }
            );
        }

        const trimmedIdentifier = identifier.trim();

        // Check if it's already an email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(trimmedIdentifier)) {
            return NextResponse.json({ email: trimmedIdentifier.toLowerCase() });
        }

        // It's a username - look it up in profiles (case-insensitive)
        const supabase = await createClient();

        // Use ilike for case-insensitive matching
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('email')
            .ilike('username', trimmedIdentifier)
            .single();

        if (error) {
            console.error('Profile lookup error:', error);

            // Check if it's a "relation does not exist" error (table not created yet)
            if (error.message?.includes('relation') || error.code === '42P01') {
                return NextResponse.json(
                    { error: 'Username login not yet available. Please run the database migration first, or use your email to login.' },
                    { status: 503 }
                );
            }

            // PGRST116 = no rows returned
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Username not found' },
                    { status: 404 }
                );
            }

            // Other error
            return NextResponse.json(
                { error: 'Username not found' },
                { status: 404 }
            );
        }

        if (!profile?.email) {
            return NextResponse.json(
                { error: 'Username not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ email: profile.email });
    } catch (error) {
        console.error('Resolve username error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
