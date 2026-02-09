import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE endpoint to delete a specific item
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // First, get the item to verify ownership and get image URLs
        const { data: item, error: fetchError } = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }

        // Delete images from storage
        if (item.image_urls) {
            const imageUrls = Object.values(item.image_urls) as string[];
            for (const url of imageUrls) {
                // Extract file path from URL
                const match = url.match(/garments\/(.+)$/);
                if (match) {
                    await supabase.storage
                        .from('garments')
                        .remove([match[1]]);
                }
            }
        }

        // Delete the item from database
        const { error: deleteError } = await supabase
            .from('items')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (deleteError) {
            return NextResponse.json(
                { error: 'Failed to delete item' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete item error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
