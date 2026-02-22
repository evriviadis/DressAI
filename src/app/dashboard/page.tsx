'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ClothingItem } from '@/lib/supabase/types';
import ItemGrid from '@/components/closet/ItemGrid';
import EditItemModal from '@/components/closet/EditItemModal';
import ScanModal from '@/components/scan/ScanModal';
import BatchScanModal from '@/components/scan/BatchScanModal';
import SituationSelector from '@/components/outfit/SituationSelector';
import OutfitDisplay from '@/components/outfit/OutfitDisplay';
import FunnyLoader from '@/components/ui/FunnyLoader';
import Button from '@/components/ui/Button';
import MobileNav from '@/components/layout/MobileNav';

interface OutfitSuggestion {
    situation: string;
    items: ClothingItem[];
    styling_reason?: string;
    styling_tips?: string;
}

const CATEGORIES = [
    { value: 'all', label: 'All', icon: 'M3 7h18M3 12h18M3 17h18' },
    { value: 'top', label: 'Tops', icon: 'M16 4c0 1.5-1.5 3-4 3S8 5.5 8 4M4 8l4-4h8l4 4v5l-4 2v5H8v-5L4 13V8z' },
    { value: 'bottom', label: 'Bottoms', icon: 'M6 3h12l1 9H5L6 3zM5 12l2 9h4l1-5 1 5h4l2-9' },
    { value: 'outerwear', label: 'Outerwear', icon: 'M16 4c0 1.5-1.5 3-4 3S8 5.5 8 4L3 7v4h2v9h14v-9h2V7l-5-3z' },
    { value: 'dress', label: 'Dresses', icon: 'M12 3c-1.5 0-3 .8-3 2l-4 5h3l-2 11h12l-2-11h3l-4-5c0-1.2-1.5-2-3-2z' },
    { value: 'shoes', label: 'Shoes', icon: 'M2 17h14c.5 0 6-2 6-5 0-1-1-2-3-2h-2l-3-5H8L5 9H3c-1 0-1 1-1 2v6z' },
    { value: 'accessory', label: 'Accessories', icon: 'M12 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.5V21H10V9.5A4 4 0 0112 2zM8 21v-6H6v-2a3 3 0 013-3' },
];

const EMPTY_MESSAGES: Record<string, string> = {
    all: 'Your closet is empty. Add your first item!',
    top: 'No tops yet.',
    bottom: 'No bottoms yet.',
    outerwear: 'No outerwear yet.',
    dress: 'No dresses yet.',
    shoes: 'No shoes yet.',
    accessory: 'No accessories yet.',
};

export default function DashboardPage() {
    const router = useRouter();
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isBatchScanModalOpen, setIsBatchScanModalOpen] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [outfitSuggestion, setOutfitSuggestion] = useState<OutfitSuggestion | null>(null);
    const [activeTab, setActiveTab] = useState<'closet' | 'suggest'>('closet');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);

    const supabase = createClient();

    const fetchItems = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        const { data, error } = await supabase.from('items').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (!error && data) setItems(data as ClothingItem[]);
        setIsLoading(false);
    }, [supabase, router]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const filteredItems = selectedCategory === 'all' ? items : items.filter(item => item.category?.toLowerCase() === selectedCategory);
    const categoryCounts = CATEGORIES.reduce((acc, cat) => {
        acc[cat.value] = cat.value === 'all' ? items.length : items.filter(item => item.category?.toLowerCase() === cat.value).length;
        return acc;
    }, {} as Record<string, number>);

    const handleSituationSelect = async (situation: string) => {
        setIsSuggesting(true);
        try {
            const response = await fetch('/api/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ situation }) });
            const data = await response.json();
            if (response.ok) {
                setOutfitSuggestion({ situation, items: data.outfit.items, styling_reason: data.outfit.styling_reason, styling_tips: data.outfit.styling_tips });
            } else { alert(data.error || 'Failed to get suggestion'); }
        } catch { alert('Failed to get outfit suggestion'); }
        finally { setIsSuggesting(false); }
    };

    const getCoverImageUrl = (items: ClothingItem[]): string | undefined => {
        for (const category of ['dresses', 'tops']) {
            const item = items.find(i => i.category.toLowerCase() === category);
            if (item) return item.image_urls?.front || Object.values(item.image_urls || {})[0];
        }
        return items[0]?.image_urls?.front || Object.values(items[0]?.image_urls || {})[0];
    };

    const handleSaveOutfit = async () => {
        if (!outfitSuggestion) return;
        try {
            const response = await fetch('/api/outfits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ situation: outfitSuggestion.situation, item_ids: outfitSuggestion.items.map(i => i.id), styling_reason: outfitSuggestion.styling_reason, source_image_url: getCoverImageUrl(outfitSuggestion.items) }),
            });
            const data = await response.json();
            if (!response.ok) { alert(data.error || 'Failed to save outfit'); return; }
            router.push('/outfits');
        } catch { alert('Failed to save outfit'); }
    };

    const handleRateOutfit = async (rating: number) => {
        if (!outfitSuggestion) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const outfitItems = outfitSuggestion.items.map(item => ({
                category: item.category,
                colors: item.ai_description?.colors || { primary: 'unknown' },
                style_vibes: item.ai_description?.style_vibes || [],
            }));
            await supabase.from('outfit_ratings').insert({ user_id: user.id, outfit_items: outfitItems, rating });
        } catch (err) { console.error('Error saving rating:', err); }
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">

                {/* Page header */}
                <div className="flex items-end justify-between py-8 border-b border-white/6 mb-0">
                    <div>
                        <p className="text-xs tracking-[0.2em] text-neutral-700 uppercase mb-1">Wardrobe</p>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">My Closet</h1>
                    </div>
                    <div className="flex items-center gap-2 pb-0.5">
                        <Button variant="ghost" size="sm" onClick={() => setIsBatchScanModalOpen(true)}>
                            Batch upload
                        </Button>
                        <Button size="sm" onClick={() => setIsScanModalOpen(true)}>
                            + Add item
                        </Button>
                    </div>
                </div>

                {/* Tab nav — flush with header border */}
                <div className="flex gap-0 mb-0 -mt-px">
                    {(['closet', 'suggest'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3.5 text-xs tracking-[0.1em] uppercase font-medium transition-colors cursor-pointer border-b-2 ${activeTab === tab
                                ? 'text-white border-white'
                                : 'text-neutral-700 border-transparent hover:text-neutral-400'
                                }`}
                        >
                            {tab === 'closet' ? 'Closet' : 'Get Outfit'}
                        </button>
                    ))}
                </div>

                <div className="h-px bg-white/6 mb-6" />

                {/* Category Filter */}
                {activeTab === 'closet' && !isLoading && items.length > 0 && (
                    <div className="flex gap-0 overflow-x-auto mb-6 -mt-2">
                        {CATEGORIES.map((cat) => {
                            const isActive = selectedCategory === cat.value;
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`flex flex-col items-center gap-1 px-4 py-2.5 text-xs whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px ${isActive
                                            ? 'text-white border-white'
                                            : 'text-neutral-700 border-transparent hover:text-neutral-400'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
                                        <path d={cat.icon} />
                                    </svg>
                                    <span className="text-[10px] tracking-wide">{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Main Content */}
                <div className="pb-24">
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {[...Array(10)].map((_, i) => <div key={i} className="aspect-square skeleton" />)}
                        </div>
                    ) : activeTab === 'closet' ? (
                        filteredItems.length === 0 ? (
                            <div className="py-24 text-center">
                                <p className="text-xs tracking-[0.2em] text-neutral-800 uppercase mb-4">{selectedCategory === 'all' ? 'Empty closet' : `No ${selectedCategory}s`}</p>
                                <p className="text-sm text-neutral-600 mb-8">{EMPTY_MESSAGES[selectedCategory]}</p>
                                {selectedCategory === 'all' && (
                                    <Button variant="outline" onClick={() => setIsScanModalOpen(true)}>Add your first item</Button>
                                )}
                            </div>
                        ) : (
                            <ItemGrid
                                items={filteredItems}
                                emptyMessage={EMPTY_MESSAGES[selectedCategory]}
                                onItemDelete={(itemId) => setItems(items.filter(i => i.id !== itemId))}
                                onItemEdit={(item) => setEditingItem(item)}
                            />
                        )
                    ) : outfitSuggestion ? (
                        <OutfitDisplay
                            situation={outfitSuggestion.situation}
                            items={outfitSuggestion.items}
                            stylingReason={outfitSuggestion.styling_reason}
                            stylingTips={outfitSuggestion.styling_tips}
                            onReset={() => setOutfitSuggestion(null)}
                            onSave={handleSaveOutfit}
                            onRate={handleRateOutfit}
                        />
                    ) : items.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-sm text-neutral-600 mb-8">Add items to your closet first to get outfit suggestions.</p>
                            <Button onClick={() => setIsScanModalOpen(true)}>Add your first item</Button>
                        </div>
                    ) : isSuggesting ? (
                        <FunnyLoader />
                    ) : (
                        <div className="max-w-lg">
                            <SituationSelector onSelect={handleSituationSelect} isLoading={isSuggesting} />
                        </div>
                    )}
                </div>
            </div>

            <ScanModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onSuccess={fetchItems} />
            <BatchScanModal isOpen={isBatchScanModalOpen} onClose={() => setIsBatchScanModalOpen(false)} onSuccess={fetchItems} />
            <MobileNav />

            {editingItem && (
                <EditItemModal
                    isOpen={true}
                    onClose={() => setEditingItem(null)}
                    item={editingItem}
                    onSave={(updatedItem) => { setItems(items.map(i => i.id === updatedItem.id ? updatedItem as ClothingItem : i)); setEditingItem(null); }}
                    onDelete={(itemId) => { setItems(items.filter(i => i.id !== itemId)); setEditingItem(null); }}
                />
            )}
        </div>
    );
}
