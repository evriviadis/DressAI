'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ClothingItem, Outfit } from '@/lib/supabase/types';
import Button from '@/components/ui/Button';
import MobileNav from '@/components/layout/MobileNav';
import Image from 'next/image';

interface OutfitWithItems extends Outfit {
    items?: ClothingItem[];
}

const CATEGORY_ORDER: Record<string, number> = {
    outerwear: 0, top: 1, dress: 1, bottom: 2, shoes: 3, accessory: 4,
};

function sortByCategory(items: ClothingItem[]): ClothingItem[] {
    return [...items].sort((a, b) => {
        const orderA = CATEGORY_ORDER[a.category?.toLowerCase()] ?? 5;
        const orderB = CATEGORY_ORDER[b.category?.toLowerCase()] ?? 5;
        return orderA - orderB;
    });
}

// ─── Item Detail Sheet ──────────────────────────────────────────────────────

function ItemDetailSheet({ item, onClose }: { item: ClothingItem; onClose: () => void }) {
    const ai = item.ai_description;
    const imageUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const Tag = ({ children }: { children: React.ReactNode }) => (
        <span className="inline-block text-[10px] tracking-[0.08em] uppercase border border-white/10 text-neutral-400 px-2 py-0.5">
            {children}
        </span>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 animate-fade-in"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full sm:max-w-lg max-h-[92vh] bg-[#0d0d0d] border border-white/8 overflow-hidden animate-slide-up rounded-t-xl sm:rounded-none flex flex-col">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="overflow-y-auto">
                    {/* Image */}
                    <div className="relative w-full aspect-[4/3] bg-neutral-950 flex-shrink-0">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={item.name || 'Item'}
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-neutral-800">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 space-y-6">

                        {/* Name + category */}
                        <div>
                            <p className="text-xs tracking-[0.2em] text-neutral-600 uppercase mb-1">{item.category}</p>
                            <h2 className="text-xl font-semibold text-white tracking-tight leading-snug">
                                {item.name || ai?.suggested_name || ai?.type || item.category}
                            </h2>
                            {ai?.type && item.name && ai.type !== item.name && (
                                <p className="text-sm text-neutral-500 mt-0.5">{ai.type}</p>
                            )}
                        </div>

                        {/* Colors */}
                        {ai?.colors && (
                            <div>
                                <p className="text-[10px] tracking-[0.2em] text-neutral-700 uppercase mb-2">Colors</p>
                                <div className="flex items-center gap-3">
                                    {[ai.colors.primary, ai.colors.secondary, ai.colors.accent].filter(Boolean).map((color, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <div
                                                className="w-3 h-3 rounded-full border border-white/10"
                                                style={{
                                                    background: CSS_COLORS[color!.toLowerCase()] || color,
                                                }}
                                            />
                                            <span className="text-xs text-neutral-400 capitalize">{color}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {ai?.material && (
                                <div>
                                    <p className="text-[10px] tracking-[0.2em] text-neutral-700 uppercase mb-1">Material</p>
                                    <p className="text-sm text-neutral-300 capitalize">{ai.material}</p>
                                </div>
                            )}
                            {ai?.fit && (
                                <div>
                                    <p className="text-[10px] tracking-[0.2em] text-neutral-700 uppercase mb-1">Fit</p>
                                    <p className="text-sm text-neutral-300 capitalize">{ai.fit}</p>
                                </div>
                            )}
                            {ai?.pattern && (
                                <div>
                                    <p className="text-[10px] tracking-[0.2em] text-neutral-700 uppercase mb-1">Pattern</p>
                                    <p className="text-sm text-neutral-300 capitalize">{ai.pattern}</p>
                                </div>
                            )}
                            {ai?.season && ai.season.length > 0 && (
                                <div>
                                    <p className="text-[10px] tracking-[0.2em] text-neutral-700 uppercase mb-1">Season</p>
                                    <p className="text-sm text-neutral-300 capitalize">{ai.season.join(', ')}</p>
                                </div>
                            )}
                        </div>

                        {/* Style vibes */}
                        {ai?.style_vibes && ai.style_vibes.length > 0 && (
                            <div>
                                <p className="text-[10px] tracking-[0.2em] text-neutral-700 uppercase mb-2">Style</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {ai.style_vibes.map((vibe) => <Tag key={vibe}>{vibe}</Tag>)}
                                </div>
                            </div>
                        )}

                        {/* Occasions */}
                        {ai?.occasions && ai.occasions.length > 0 && (
                            <div>
                                <p className="text-[10px] tracking-[0.2em] text-neutral-700 uppercase mb-2">Occasions</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {ai.occasions.map((occ) => <Tag key={occ}>{occ}</Tag>)}
                                </div>
                            </div>
                        )}

                        {/* Details */}
                        {ai?.details && ai.details.length > 0 && (
                            <div>
                                <p className="text-[10px] tracking-[0.2em] text-neutral-700 uppercase mb-2">Details</p>
                                <ul className="space-y-1">
                                    {ai.details.map((d, i) => (
                                        <li key={i} className="text-xs text-neutral-500 flex items-start gap-2">
                                            <span className="text-neutral-800 mt-0.5">—</span>
                                            <span className="capitalize">{d}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Care instructions */}
                        {ai?.care_instructions && (
                            <div className="border-t border-white/6 pt-5">
                                <p className="text-[10px] tracking-[0.2em] text-neutral-700 uppercase mb-1">Care</p>
                                <p className="text-xs text-neutral-600">{ai.care_instructions}</p>
                            </div>
                        )}

                        <div className="pb-2" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Common color name → hex mapping for color swatches
const CSS_COLORS: Record<string, string> = {
    white: '#f5f5f5', black: '#111111', grey: '#888888', gray: '#888888',
    red: '#e05252', blue: '#527ae0', navy: '#1a2a6c', green: '#52a052',
    yellow: '#e0c052', orange: '#e07a52', pink: '#e052a0', purple: '#8052e0',
    brown: '#7a5230', beige: '#c9b99a', cream: '#f0ead6', tan: '#c7a876',
    khaki: '#c3b091', olive: '#8a8a3a', teal: '#52a0a0', indigo: '#3a52a0',
    lavender: '#9a88c8', maroon: '#7a2020', mint: '#88c8a0', coral: '#e07860',
    gold: '#c8a840', silver: '#a8a8a8', charcoal: '#3a3a3a', ivory: '#f0ead8',
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function OutfitsPage() {
    const router = useRouter();
    const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
    const [isDeletingOutfit, setIsDeletingOutfit] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        const { data: outfitsData } = await supabase.from('outfits').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        const { data: itemsData } = await supabase.from('items').select('*').eq('user_id', user.id);

        if (outfitsData && itemsData) {
            const outfitsWithItems = outfitsData.map((outfit) => ({
                ...outfit,
                items: outfit.item_ids.map((id: string) => itemsData.find((item) => item.id === id)).filter(Boolean) as ClothingItem[],
            }));
            setOutfits(outfitsWithItems as OutfitWithItems[]);
        }
        setIsLoading(false);
    }, [supabase, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDeleteOutfit = async (outfitId: string) => {
        setIsDeletingOutfit(true);
        const { error } = await supabase.from('outfits').delete().eq('id', outfitId);
        if (!error) setOutfits(outfits.filter(o => o.id !== outfitId));
        setIsDeletingOutfit(false);
        setConfirmingDeleteId(null);
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-4xl mx-auto px-5 sm:px-8">

                {/* Header */}
                <div className="flex items-end justify-between py-8 border-b border-white/6 mb-6">
                    <div>
                        <p className="text-xs tracking-[0.2em] text-neutral-700 uppercase mb-1">Saved</p>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">Lookbook</h1>
                    </div>
                    <div className="pb-0.5 flex items-center gap-3">
                        <span className="text-xs text-neutral-700">{outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'}</span>
                        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>+ New outfit</Button>
                    </div>
                </div>

                {/* Content */}
                <div className="pb-24">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-48 skeleton" />)}
                        </div>
                    ) : outfits.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-xs tracking-[0.2em] text-neutral-800 uppercase mb-4">Empty lookbook</p>
                            <p className="text-sm text-neutral-600 mb-8">Get outfit suggestions from your closet and save your favorites.</p>
                            <Button variant="outline" onClick={() => router.push('/dashboard')}>Get your first outfit</Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/6">
                            {outfits.map((outfit) => {
                                const sortedItems = sortByCategory(outfit.items || []);
                                return (
                                    <div key={outfit.id} className="py-8 animate-fade-in">
                                        {/* Meta row */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-baseline gap-4">
                                                <span className="text-xs tracking-[0.15em] text-neutral-500 uppercase font-medium">
                                                    {outfit.situation?.replace('_', ' ')}
                                                </span>
                                                <span className="text-[11px] text-neutral-800">
                                                    {new Date(outfit.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            {confirmingDeleteId === outfit.id ? (
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => setConfirmingDeleteId(null)} disabled={isDeletingOutfit} className="text-xs text-neutral-600 hover:text-white transition-colors cursor-pointer">Cancel</button>
                                                    <button onClick={() => handleDeleteOutfit(outfit.id)} disabled={isDeletingOutfit} className="text-xs text-red-500 hover:text-red-300 transition-colors disabled:opacity-40 cursor-pointer">
                                                        {isDeletingOutfit ? 'Deleting…' : 'Confirm delete'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setConfirmingDeleteId(outfit.id)} className="text-neutral-800 hover:text-neutral-500 transition-colors cursor-pointer">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Items grid — clickable */}
                                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                            {sortedItems.map((item, i) => {
                                                const imgUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];
                                                const isHero = i === 0;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => setSelectedItem(item)}
                                                        className={`group relative bg-neutral-950 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${isHero ? 'col-span-2 row-span-2' : ''}`}
                                                        style={{ aspectRatio: '1 / 1' }}
                                                        title={item.name || item.category}
                                                    >
                                                        {imgUrl ? (
                                                            <Image
                                                                src={imgUrl}
                                                                alt={item.name || item.category}
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center text-neutral-800">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}

                                                        {/* Hover overlay — tap hint */}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex flex-col items-start justify-end">
                                                            <div className="w-full p-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                                                <p className="text-[10px] text-white uppercase tracking-[0.06em] leading-tight truncate">
                                                                    {item.name || item.ai_description?.type || item.category}
                                                                </p>
                                                                {item.ai_description?.colors?.primary && (
                                                                    <p className="text-[9px] text-neutral-400 capitalize mt-0.5">
                                                                        {item.ai_description.colors.primary}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Expand icon — top right, shows on hover */}
                                                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <div className="w-5 h-5 bg-black/60 flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Styling reason */}
                                        {outfit.styling_reason && (
                                            <div className="mt-4 border-l-2 border-white/12 pl-4">
                                                <p className="text-xs text-neutral-600 leading-relaxed">{outfit.styling_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <MobileNav />

            {/* Item detail sheet */}
            {selectedItem && (
                <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </div>
    );
}
