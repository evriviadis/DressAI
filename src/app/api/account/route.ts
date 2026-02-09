import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE endpoint to delete user account and all associated data
export async function DELETE() {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all user's items to delete their images
        const { data: items } = await supabase
            .from('items')
            .select('image_urls')
            .eq('user_id', user.id);

        // Delete all images from storage
        if (items && items.length > 0) {
            const allImagePaths: string[] = [];
            for (const item of items) {
                if (item.image_urls) {
                    const imageUrls = Object.values(item.image_urls) as string[];
                    for (const url of imageUrls) {
                        const match = url.match(/garments\/(.+)$/);
                        if (match) {
                            allImagePaths.push(match[1]);
                        }
                    }
                }
            }

            if (allImagePaths.length > 0) {
                await supabase.storage
                    .from('garments')
                    .remove(allImagePaths);
            }
        }

        // Delete all user's outfits (cascade should handle this, but let's be explicit)
        await supabase
            .from('outfits')
            .delete()
            .eq('user_id', user.id);

        // Delete all user's items (cascade should handle this, but let's be explicit)
        await supabase
            .from('items')
            .delete()
            .eq('user_id', user.id);

        // Note: To fully delete the user from auth.users, you need to use Supabase Admin API
        // This requires the service_role key which should only be used server-side
        // For now, we'll sign out the user - the auth record will remain but data is deleted
        // For full deletion, implement this in a Supabase Edge Function with admin privileges

        // Sign out the user
        await supabase.auth.signOut();

        return NextResponse.json({
            success: true,
            message: 'Account data deleted successfully. You have been signed out.'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
