import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

const SCAN_SYSTEM_PROMPT = `You are a fashion expert AI that analyzes clothing images. Analyze the provided images and return ONLY a valid JSON object (no markdown, no code blocks) describing the garment with the following structure:

{
  "suggested_name": "a short, simple name for this item (e.g., 'Blue Denim Jacket', 'White Cotton Tee', 'Black Sneakers') - max 3-4 words",
  "type": "specific garment type (e.g., 'crew neck t-shirt', 'slim fit jeans', 'blazer')",
  "category": "one of: top, bottom, outerwear, dress, shoes, accessory",
  "material": "primary material (e.g., 'cotton', 'wool', 'polyester blend')",
  "fit": "fit style (e.g., 'slim', 'regular', 'oversized', 'tailored')",
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode or null",
    "accent": "#hexcode or null"
  },
  "pattern": "pattern type or 'solid' (e.g., 'striped', 'plaid', 'floral')",
  "details": ["array of visual details like 'buttons', 'pockets', 'collar type'"],
  "style_vibes": ["array of style descriptors like 'casual', 'formal', 'streetwear'"],
  "occasions": ["array of suitable occasions like 'office', 'weekend', 'date night'"],
  "season": ["array of suitable seasons like 'spring', 'summer', 'fall', 'winter'"],
  "care_instructions": "general care suggestion"
}

Be extremely detailed so the item can be 'visualized' via text alone. Focus on objective details that can be clearly seen in the images.`;

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
        const category = formData.get('category') as string || 'unknown';
        const customName = formData.get('customName') as string || '';

        if (!images || images.length === 0) {
            return NextResponse.json(
                { error: 'No images provided' },
                { status: 400 }
            );
        }

        if (images.length > 4) {
            return NextResponse.json(
                { error: 'Maximum 4 images allowed' },
                { status: 400 }
            );
        }

        // Convert images to base64 for Gemini
        const imageParts = await Promise.all(
            images.map(async (image) => {
                const bytes = await image.arrayBuffer();
                const base64 = Buffer.from(bytes).toString('base64');
                return {
                    inlineData: {
                        data: base64,
                        mimeType: image.type,
                    },
                };
            })
        );

        // Call Gemini API with fallback
        let result;
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
            result = await model.generateContent([
                SCAN_SYSTEM_PROMPT,
                ...imageParts,
            ]);
        } catch (aiError: unknown) {
            const error = aiError as { status?: number; message?: string };
            if (error.status === 429) {
                return NextResponse.json(
                    { error: 'AI service is temporarily busy. Please wait 30 seconds and try again.' },
                    { status: 429 }
                );
            }
            throw aiError;
        }

        const responseText = result.response.text();

        // Parse the JSON response
        let aiDescription;
        try {
            // Clean up potential markdown code blocks
            const cleanedResponse = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            aiDescription = JSON.parse(cleanedResponse);
        } catch {
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: responseText },
                { status: 500 }
            );
        }

        // Upload images to Supabase Storage
        const imageUrls: Record<string, string> = {};
        const imageLabels = ['front', 'back', 'label', 'detail'];

        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const label = imageLabels[i];
            const fileName = `${user.id}/${Date.now()}_${label}_${image.name}`;

            const { error: uploadError } = await supabase.storage
                .from('garments')
                .upload(fileName, image, {
                    contentType: image.type,
                    upsert: false,
                });

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                return NextResponse.json(
                    { error: `Failed to upload image: ${uploadError.message}. Please check storage rules and limits.` },
                    { status: 400 }
                );
            }

            const { data: urlData } = supabase.storage
                .from('garments')
                .getPublicUrl(fileName);
            imageUrls[label] = urlData.publicUrl;
        }

        // Determine item name: use custom name if provided, otherwise use AI suggested name
        const itemName = customName.trim() || aiDescription.suggested_name || aiDescription.type || 'Untitled Item';

        // Save item to database
        const { data: item, error: dbError } = await supabase
            .from('items')
            .insert({
                user_id: user.id,
                name: itemName,
                image_urls: imageUrls,
                category: aiDescription.category || category,
                ai_description: aiDescription,
            })
            .select()
            .single();

        if (dbError) {
            return NextResponse.json(
                { error: 'Failed to save item', details: dbError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            item,
        });
    } catch (error) {
        console.error('Scan error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
