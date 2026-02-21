export interface ImageUrls {
    front?: string;
    back?: string;
    label?: string;
    detail?: string;
    thumbnail?: string; // Small compressed image for lists
}

export interface AIDescription {
    suggested_name: string;
    type: string;
    category: string;
    material: string;
    fit: string;
    colors: {
        primary: string;
        secondary?: string;
        accent?: string;
    };
    pattern?: string;
    details: string[];
    style_vibes: string[];
    occasions: string[];
    season: string[];
    care_instructions?: string;
}

export interface ClothingItem {
    id: string;
    user_id: string;
    name: string; // User-defined name or AI suggested name
    image_urls: ImageUrls;
    category: string;
    ai_description: AIDescription;
    created_at: string;
    updated_at: string;
}

export interface Outfit {
    id: string;
    user_id: string;
    situation: string;
    item_ids: string[];
    styling_reason?: string;
    cover_image_url?: string;
    created_at: string;
}

export interface OutfitRatingItem {
    category: string;
    colors: {
        primary: string;
        secondary?: string;
        accent?: string;
    };
    style_vibes: string[];
}

export interface OutfitRating {
    id: string;
    user_id: string;
    outfit_items: OutfitRatingItem[];
    rating: number;
    created_at: string;
}

export interface Profile {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Database {
    public: {
        Tables: {
            items: {
                Row: ClothingItem;
                Insert: Omit<ClothingItem, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ClothingItem, 'id'>>;
            };
            outfits: {
                Row: Outfit;
                Insert: Omit<Outfit, 'id' | 'created_at'>;
                Update: Partial<Omit<Outfit, 'id'>>;
            };
            outfit_ratings: {
                Row: OutfitRating;
                Insert: Omit<OutfitRating, 'id' | 'created_at'>;
                Update: Partial<Omit<OutfitRating, 'id'>>;
            };
        };
    };
}
