'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ClothingItem, Outfit } from '@/lib/supabase/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MobileNav from '@/components/layout/MobileNav';
import Image from 'next/image';

interface OutfitWithItems extends Outfit {
    items?: ClothingItem[];
}

// Sort items by category for visual hierarchy
const CATEGORY_ORDER: Record<string, number> = {
    outerwear: 0,
    top: 1,
    dress: 1,
    bottom: 2,
    shoes: 3,
    accessory: 4,
};

function sortByCategory(items: ClothingItem[]): ClothingItem[] {
    return [...items].sort((a, b) => {
        const orderA = CATEGORY_ORDER[a.category?.toLowerCase()] ?? 5;
        const orderB = CATEGORY_ORDER[b.category?.toLowerCase()] ?? 5;
        return orderA - orderB;
    });
}

export default function OutfitsPage() {
    const router = useRouter();
    const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
    const [isDeletingOutfit, setIsDeletingOutfit] = useState(false);

    const supabase = createClient();

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        // Fetch outfits
        const { data: outfitsData } = await supabase
            .from('outfits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        // Fetch all items
        const { data: itemsData } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', user.id);

        if (outfitsData && itemsData) {
            // Map items to outfits
            const outfitsWithItems = outfitsData.map((outfit) => ({
                ...outfit,
                items: outfit.item_ids.map((id: string) =>
                    itemsData.find((item) => item.id === id)
                ).filter(Boolean) as ClothingItem[],
            }));

            setOutfits(outfitsWithItems as OutfitWithItems[]);
        }
        setIsLoading(false);
    }, [supabase, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteOutfit = async (outfitId: string) => {
        setIsDeletingOutfit(true);
        const { error } = await supabase
            .from('outfits')
            .delete()
            .eq('id', outfitId);

        if (!error) {
            setOutfits(outfits.filter(o => o.id !== outfitId));
        }
        setIsDeletingOutfit(false);
        setConfirmingDeleteId(null);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            👗 My Lookbook
                        </h1>
                        <p className="text-muted mt-1">
                            {outfits.length} saved {outfits.length === 1 ? 'outfit' : 'outfits'}
                        </p>
                    </div>
                    <Button onClick={() => router.push('/dashboard')}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Get New Outfit
                    </Button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-64 rounded-2xl skeleton" />
                        ))}
                    </div>
                ) : outfits.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(130, 140, 200, 0.08)' }}>
                            <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">No saved outfits yet</h3>
                        <p className="text-muted mb-6">Get outfit suggestions from your closet and save your favorites.</p>
                        <Button onClick={() => router.push('/dashboard')}>
                            Get Your First Outfit
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {outfits.map((outfit) => {
                            const sortedItems = sortByCategory(outfit.items || []);

                            return (
                                <Card key={outfit.id} className="overflow-hidden animate-fade-in">
                                    {/* Outfit Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-block px-3 py-1.5 bg-primary/15 text-primary text-sm font-semibold rounded-full capitalize neon-border">
                                                {outfit.situation}
                                            </span>
                                            <span className="text-muted-light text-xs">
                                                {new Date(outfit.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        {confirmingDeleteId === outfit.id ? (
                                            <div className="flex items-center gap-2 animate-fade-in">
                                                <span className="text-sm text-muted">Delete?</span>
                                                <button
                                                    onClick={() => setConfirmingDeleteId(null)}
                                                    disabled={isDeletingOutfit}
                                                    className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-muted rounded-lg transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOutfit(outfit.id)}
                                                    disabled={isDeletingOutfit}
                                                    className="px-3 py-1.5 text-xs font-medium bg-error hover:bg-error/80 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    {isDeletingOutfit ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmingDeleteId(outfit.id)}
                                                className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-xl transition-all cursor-pointer"
                                                title="Delete outfit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Item Images — Side by Side */}
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
                                        {sortedItems.map((item) => {
                                            const imgUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="relative flex-shrink-0 w-36 sm:w-auto aspect-square rounded-xl overflow-hidden group"
                                                    style={{ background: 'rgba(130, 140, 200, 0.08)' }}
                                                >
                                                    {imgUrl ? (
                                                        <Image
                                                            src={imgUrl}
                                                            alt={item.name || item.ai_description?.type || 'Outfit item'}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-muted">
                                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    {/* Category label overlay */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                        <p className="text-white text-xs font-medium truncate">
                                                            {item.name || item.ai_description?.type || item.category}
                                                        </p>
                                                        <p className="text-white/60 text-[10px] capitalize">
                                                            {item.category}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Styling Reason */}
                                    {outfit.styling_reason && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <div className="flex gap-2 items-start">
                                                <div className="flex-shrink-0 w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center mt-0.5">
                                                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                </div>
                                                <p className="text-muted text-sm line-clamp-2">{outfit.styling_reason}</p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <MobileNav />
        </div>
    );
}
