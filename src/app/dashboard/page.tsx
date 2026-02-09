'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ClothingItem } from '@/lib/supabase/types';
import ItemGrid from '@/components/closet/ItemGrid';
import ScanModal from '@/components/scan/ScanModal';
import SituationSelector from '@/components/outfit/SituationSelector';
import OutfitDisplay from '@/components/outfit/OutfitDisplay';
import Button from '@/components/ui/Button';
import MobileNav from '@/components/layout/MobileNav';

interface OutfitSuggestion {
    situation: string;
    items: ClothingItem[];
    styling_reason?: string;
    styling_tips?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [outfitSuggestion, setOutfitSuggestion] = useState<OutfitSuggestion | null>(null);
    const [activeTab, setActiveTab] = useState<'closet' | 'suggest'>('closet');

    const supabase = createClient();

    const fetchItems = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setItems(data as ClothingItem[]);
        }
        setIsLoading(false);
    }, [supabase, router]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleSituationSelect = async (situation: string) => {
        setIsSuggesting(true);
        try {
            const response = await fetch('/api/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ situation }),
            });

            const data = await response.json();
            if (response.ok) {
                setOutfitSuggestion({
                    situation,
                    items: data.outfit.items,
                    styling_reason: data.outfit.styling_reason,
                    styling_tips: data.outfit.styling_tips,
                });
            } else {
                alert(data.error || 'Failed to get suggestion');
            }
        } catch {
            alert('Failed to get outfit suggestion');
        } finally {
            setIsSuggesting(false);
        }
    };

    const getCoverImageUrl = (items: ClothingItem[]): string | undefined => {
        // Priority order: dresses > tops > first available
        const priorityCategories = ['dresses', 'tops'];

        for (const category of priorityCategories) {
            const item = items.find(i => i.category.toLowerCase() === category);
            if (item) {
                return item.image_urls?.front || Object.values(item.image_urls || {})[0];
            }
        }

        // Fallback to first item's image
        if (items.length > 0) {
            return items[0].image_urls?.front || Object.values(items[0].image_urls || {})[0];
        }

        return undefined;
    };

    const handleSaveOutfit = async () => {
        if (!outfitSuggestion) return;

        try {
            const sourceImageUrl = getCoverImageUrl(outfitSuggestion.items);

            const response = await fetch('/api/outfits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    situation: outfitSuggestion.situation,
                    item_ids: outfitSuggestion.items.map(item => item.id),
                    styling_reason: outfitSuggestion.styling_reason,
                    source_image_url: sourceImageUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Failed to save outfit');
                console.error('Error saving outfit:', data);
                return;
            }

            router.push('/outfits');
        } catch (err) {
            alert('Failed to save outfit');
            console.error('Error saving outfit:', err);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Closet</h1>
                        <p className="text-muted mt-1">
                            {items.length} {items.length === 1 ? 'item' : 'items'} in your wardrobe
                        </p>
                    </div>
                    <Button onClick={() => setIsScanModalOpen(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Add Item
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('closet')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'closet'
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'bg-card text-muted hover:text-foreground border border-border'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            My Closet
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('suggest')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'suggest'
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'bg-card text-muted hover:text-foreground border border-border'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Get Outfit
                        </span>
                    </button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square rounded-2xl skeleton" />
                        ))}
                    </div>
                ) : activeTab === 'closet' ? (
                    <ItemGrid
                        items={items}
                        emptyMessage="Your closet is empty. Add your first item to get started!"
                        onItemDelete={(itemId) => setItems(items.filter(i => i.id !== itemId))}
                    />
                ) : outfitSuggestion ? (
                    <OutfitDisplay
                        situation={outfitSuggestion.situation}
                        items={outfitSuggestion.items}
                        stylingReason={outfitSuggestion.styling_reason}
                        stylingTips={outfitSuggestion.styling_tips}
                        onReset={() => setOutfitSuggestion(null)}
                        onSave={handleSaveOutfit}
                    />
                ) : (
                    <div className="max-w-2xl mx-auto">
                        {items.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto bg-border-light rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">Add items first</h3>
                                <p className="text-muted mb-6">You need to add clothes to your closet before getting outfit suggestions.</p>
                                <Button onClick={() => setIsScanModalOpen(true)}>
                                    Add Your First Item
                                </Button>
                            </div>
                        ) : (
                            <SituationSelector onSelect={handleSituationSelect} isLoading={isSuggesting} />
                        )}
                    </div>
                )}
            </div>

            {/* Scan Modal */}
            <ScanModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onSuccess={fetchItems}
            />

            {/* Mobile Nav */}
            <MobileNav />
        </div>
    );
}
