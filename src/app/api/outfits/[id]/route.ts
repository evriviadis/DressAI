import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE endpoint to delete a specific outfit
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

        // Delete the outfit from database
        const { error: deleteError } = await supabase
            .from('outfits')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (deleteError) {
            return NextResponse.json(
                { error: 'Failed to delete outfit' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete outfit error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
