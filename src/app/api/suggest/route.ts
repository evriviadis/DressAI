import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { ClothingItem } from '@/lib/supabase/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

const SUGGEST_SYSTEM_PROMPT = `You are a professional fashion stylist. Given a JSON list of clothing items from a user's wardrobe, select exactly ONE complete outfit for the specified situation.

Rules:
1. Select items that work well together in terms of color, style, and occasion
2. A complete outfit should typically include: top + bottom (or dress), and optionally outerwear and accessories
3. Consider the weather/season appropriateness for the situation
4. Prioritize items whose "occasions" or "style_vibes" match the situation

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "item_ids": ["array of selected item UUIDs"],
  "styling_reason": "brief explanation of why these items work together for this situation",
  "styling_tips": "optional tips for how to wear/accessorize the outfit"
}`;

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

        const { situation } = await request.json();

        if (!situation || typeof situation !== 'string') {
            return NextResponse.json(
                { error: 'Situation is required' },
                { status: 400 }
            );
        }

        // Fetch all user's items with their AI descriptions
        const { data: items, error: fetchError } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', user.id);

        if (fetchError) {
            return NextResponse.json(
                { error: 'Failed to fetch wardrobe items' },
                { status: 500 }
            );
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'No items in wardrobe. Please add some clothes first.' },
                { status: 400 }
            );
        }

        // Prepare minimal item data for AI (to save tokens)
        const itemsForAI = items.map((item: ClothingItem) => ({
            id: item.id,
            ...item.ai_description,
            category: item.category, // Override with database category
        }));

        // Call Gemini API with text-only prompt
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const prompt = `${SUGGEST_SYSTEM_PROMPT}

Situation: ${situation}

Available Wardrobe Items:
${JSON.stringify(itemsForAI, null, 2)}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the JSON response
        let suggestion;
        try {
            const cleanedResponse = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            suggestion = JSON.parse(cleanedResponse);
        } catch {
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: responseText },
                { status: 500 }
            );
        }

        // Validate that suggested item IDs exist
        const validItemIds = suggestion.item_ids.filter((id: string) =>
            items.some((item: ClothingItem) => item.id === id)
        );

        if (validItemIds.length === 0) {
            return NextResponse.json(
                { error: 'AI suggested invalid items' },
                { status: 500 }
            );
        }

        // Get the full item details for the response
        const selectedItems = items.filter((item: ClothingItem) =>
            validItemIds.includes(item.id)
        );

        return NextResponse.json({
            success: true,
            outfit: {
                situation,
                items: selectedItems,
                styling_reason: suggestion.styling_reason,
                styling_tips: suggestion.styling_tips,
            },
        });
    } catch (error) {
        console.error('Suggest error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch saved outfits
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { data: outfits, error: fetchError } = await supabase
            .from('outfits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (fetchError) {
            return NextResponse.json(
                { error: 'Failed to fetch outfits' },
                { status: 500 }
            );
        }

        return NextResponse.json({ outfits });
    } catch (error) {
        console.error('Fetch outfits error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
