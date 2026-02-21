import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClothingItem } from '@/lib/supabase/types';
import { generateFromText } from '@/lib/llm';
import { getWeatherForUser } from '@/lib/weather';

const SUGGEST_SYSTEM_PROMPT = `You are a professional fashion stylist. Given a JSON list of clothing items from a user's wardrobe, select exactly ONE complete outfit for the specified situation.

Rules:
1. Select items that work well together in terms of color, style, and occasion
2. A complete outfit should typically include: top + bottom (or dress), and optionally outerwear and accessories
3. If current weather data is provided, the temperature represents the OUTSIDE weather. The user will be going outdoors AND likely transitioning to indoor environments (offices, restaurants, shops, etc.). Choose an outfit that works for BOTH:
   - Outdoors: appropriate warmth/coverage for the outside temperature, wind, and conditions
   - Indoors: the outfit should still be comfortable and stylish when outer layers are removed. Suggest layering (e.g., a jacket over a nice top) so the user looks great both outside and inside.
4. Prioritize items whose "occasions" or "style_vibes" match the situation
5. If user style preferences are provided (from past outfit ratings), strongly favor items and color palettes similar to their favorites (rated 4-5 stars), and actively avoid styles, colors, and combinations similar to their dislikes (rated 1-2 stars).

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "item_ids": ["array of selected item UUIDs"],
  "styling_reason": "brief explanation of why these items work together for this situation, mentioning how the outfit handles outdoor weather AND indoor comfort",
  "styling_tips": "optional tips for how to wear/accessorize the outfit, including advice on layering for indoor/outdoor transitions"
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

        // Fetch current weather (best-effort, does not block on failure)
        const weather = await getWeatherForUser();

        // Fetch user's past outfit ratings for personalisation
        let preferencesBlock = '';
        try {
            const { data: ratings } = await supabase
                .from('outfit_ratings')
                .select('outfit_items, rating')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (ratings && ratings.length > 0) {
                const favorites = ratings
                    .filter((r: { rating: number }) => r.rating >= 4)
                    .slice(0, 3)
                    .map((r: { outfit_items: unknown }) => r.outfit_items);

                const dislikes = ratings
                    .filter((r: { rating: number }) => r.rating <= 2)
                    .slice(0, 3)
                    .map((r: { outfit_items: unknown }) => r.outfit_items);

                if (favorites.length > 0 || dislikes.length > 0) {
                    preferencesBlock = '\nUser Style Preferences (from past ratings):';
                    if (favorites.length > 0) {
                        preferencesBlock += `\nFavorites (rated 4-5 ⭐): ${JSON.stringify(favorites)}`;
                    }
                    if (dislikes.length > 0) {
                        preferencesBlock += `\nDislikes (rated 1-2 ⭐): ${JSON.stringify(dislikes)}`;
                    }
                    preferencesBlock += '\nUse these to tailor your outfit selection toward styles the user loves, and avoid styles they disliked.\n';
                }
            }
        } catch (prefError) {
            // Non-critical: continue without preferences
            console.warn('Failed to fetch user preferences:', prefError);
        }

        // Prepare minimal item data for AI (to save tokens)
        const itemsForAI = items.map((item: ClothingItem) => ({
            id: item.id,
            ...item.ai_description,
            category: item.category, // Override with database category
        }));

        // Build the weather context block (if available)
        const weatherBlock = weather
            ? `\nCurrent Weather (${weather.city}, ${weather.country}):\n- Temperature: ${weather.temp_celsius}°C (feels like ${weather.feels_like}°C)\n- Conditions: ${weather.description}\n- Humidity: ${weather.humidity}%\n- Wind: ${weather.wind_speed} m/s\n`
            : '';

        // Call AI provider (Gemini or Kimi — controlled by LLM_PROVIDER in src/lib/llm.ts)
        const prompt = `${SUGGEST_SYSTEM_PROMPT}

Situation: ${situation}${weatherBlock}${preferencesBlock}

Available Wardrobe Items:
${JSON.stringify(itemsForAI, null, 2)}`;

        const responseText = await generateFromText(prompt);

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
