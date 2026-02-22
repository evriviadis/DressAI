import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateFromImages } from '@/lib/llm';

const BATCH_SCAN_SYSTEM_PROMPT = `You are a fashion expert AI that analyzes multiple clothing images in batch. 
Each image provided is a SEPARATE, UNIQUE clothing item.

Analyze ALL provided images and return ONLY a valid JSON ARRAY (no markdown, no code blocks).
Each element in the array corresponds to one image, in the SAME ORDER as the images were provided.

Each object in the array must have this structure:
{
  "image_index": 0,
  "suggested_name": "a short, simple name for this item (e.g., 'Blue Denim Jacket') - max 3-4 words",
  "type": "specific garment type (e.g., 'crew neck t-shirt', 'slim fit jeans')",
  "category": "one of: top, bottom, outerwear, dress, shoes, accessory",
  "material": "primary material (e.g., 'cotton', 'wool')",
  "fit": "fit style (e.g., 'slim', 'regular', 'oversized')",
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode or null",
    "accent": "#hexcode or null"
  },
  "pattern": "pattern type or 'solid'",
  "details": ["array of visual details"],
  "style_vibes": ["array of style descriptors"],
  "occasions": ["array of suitable occasions"],
  "season": ["array of suitable seasons"],
  "care_instructions": "general care suggestion"
}

CRITICAL: Return an array with EXACTLY the same number of objects as images provided.
The image_index must match the order of images (0-indexed).`;

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

        const formData = await request.formData();
        const images = formData.getAll('images') as File[];

        if (!images || images.length === 0) {
            return NextResponse.json(
                { error: 'No images provided' },
                { status: 400 }
            );
        }

        if (images.length > 10) {
            return NextResponse.json(
                { error: 'Maximum 10 images allowed per batch' },
                { status: 400 }
            );
        }

        // Step 1: Upload ALL images to Supabase Storage first
        const uploadedImages: { index: number; publicUrl: string; fileName: string }[] = [];

        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            // Sanitize filename — iOS Safari can send names with spaces/special chars
            // that Supabase Storage rejects ("The string did not match the expected pattern")
            const safeName = image.name
                .replace(/[^a-zA-Z0-9._-]/g, '_')  // replace unsafe chars with underscore
                .replace(/_+/g, '_');                 // collapse multiple underscores
            const fileName = `${user.id}/${Date.now()}_batch_${i}_${safeName}`;

            const { error: uploadError } = await supabase.storage
                .from('garments')
                .upload(fileName, image, {
                    contentType: image.type,
                    upsert: false,
                });

            if (uploadError) {
                console.error('Upload error for image', i, uploadError);
                return NextResponse.json(
                    { error: `Failed to upload image ${i + 1}: ${uploadError.message}` },
                    { status: 400 }
                );
            }

            const { data: urlData } = supabase.storage
                .from('garments')
                .getPublicUrl(fileName);

            uploadedImages.push({
                index: i,
                publicUrl: urlData.publicUrl,
                fileName,
            });
        }

        // Step 2: Convert images to base64
        const imageParts = await Promise.all(
            images.map(async (image) => {
                const bytes = await image.arrayBuffer();
                const base64 = Buffer.from(bytes).toString('base64');
                return { base64, mimeType: image.type };
            })
        );

        // Step 3: Call AI provider (Gemini or Kimi — controlled by LLM_PROVIDER in src/lib/llm.ts)
        let responseText: string;
        try {
            responseText = await generateFromImages(BATCH_SCAN_SYSTEM_PROMPT, imageParts);
        } catch (aiError: unknown) {
            const error = aiError as { status?: number; message?: string };
            console.log(error);
            if (error.status === 429) {
                return NextResponse.json(
                    { error: 'AI service is temporarily busy. Please wait 30 seconds and try again.' },
                    { status: 429 }
                );
            }
            throw aiError;
        }

        // Step 4: Parse the JSON array response
        let aiDescriptions: Array<{
            image_index: number;
            suggested_name: string;
            type: string;
            category: string;
            material: string;
            fit: string;
            colors: { primary: string; secondary?: string; accent?: string };
            pattern?: string;
            details: string[];
            style_vibes: string[];
            occasions: string[];
            season: string[];
            care_instructions?: string;
        }>;

        try {
            const cleanedResponse = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            aiDescriptions = JSON.parse(cleanedResponse);

            if (!Array.isArray(aiDescriptions)) {
                throw new Error('Response is not an array');
            }
        } catch {
            console.error('Failed to parse AI response:', responseText);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: responseText },
                { status: 500 }
            );
        }

        // Step 5: Bulk insert items to database
        const itemsToInsert = aiDescriptions.map((desc) => {
            const uploadedImage = uploadedImages.find(img => img.index === desc.image_index) || uploadedImages[desc.image_index];

            return {
                user_id: user.id,
                name: desc.suggested_name || desc.type || 'Untitled Item',
                image_urls: { front: uploadedImage?.publicUrl },
                category: desc.category || 'unknown',
                ai_description: {
                    suggested_name: desc.suggested_name,
                    type: desc.type,
                    category: desc.category,
                    material: desc.material,
                    fit: desc.fit,
                    colors: desc.colors,
                    pattern: desc.pattern,
                    details: desc.details,
                    style_vibes: desc.style_vibes,
                    occasions: desc.occasions,
                    season: desc.season,
                    care_instructions: desc.care_instructions,
                },
            };
        });

        const { data: insertedItems, error: dbError } = await supabase
            .from('items')
            .insert(itemsToInsert)
            .select();

        if (dbError) {
            console.error('Database insert error:', dbError);
            return NextResponse.json(
                { error: 'Failed to save items', details: dbError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            items: insertedItems,
            count: insertedItems?.length || 0,
        });
    } catch (error) {
        console.error('Batch scan error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
