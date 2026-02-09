import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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

        const { situation, item_ids, styling_reason, source_image_url } = await request.json();

        if (!situation || !item_ids || item_ids.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        let coverImageUrl: string | null = null;

        // If we have a source image URL, fetch it, compress it, and upload
        if (source_image_url) {
            try {
                // Fetch the source image
                const imageResponse = await fetch(source_image_url);
                if (imageResponse.ok) {
                    const imageBuffer = await imageResponse.arrayBuffer();
                    const uint8Array = new Uint8Array(imageBuffer);

                    // Determine content type
                    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
                    const extension = contentType.includes('png') ? 'png' : 'jpg';

                    // Upload to Supabase storage as outfit cover
                    const fileName = `${user.id}/outfit_covers/${Date.now()}.${extension}`;

                    const { error: uploadError } = await supabase.storage
                        .from('garments')
                        .upload(fileName, uint8Array, {
                            contentType: contentType,
                            upsert: false,
                        });

                    if (!uploadError) {
                        const { data: urlData } = supabase.storage
                            .from('garments')
                            .getPublicUrl(fileName);
                        coverImageUrl = urlData.publicUrl;
                    } else {
                        console.error('Failed to upload cover image:', uploadError);
                    }
                }
            } catch (imgError) {
                console.error('Failed to process cover image:', imgError);
                // Continue without cover image
            }
        }

        // Save outfit to database
        const { data: outfit, error: dbError } = await supabase
            .from('outfits')
            .insert({
                user_id: user.id,
                situation,
                item_ids,
                styling_reason,
                cover_image_url: coverImageUrl,
            })
            .select()
            .single();

        if (dbError) {
            return NextResponse.json(
                { error: 'Failed to save outfit', details: dbError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            outfit,
        });
    } catch (error) {
        console.error('Save outfit error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
