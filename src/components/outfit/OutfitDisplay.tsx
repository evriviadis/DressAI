'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import StarRating from '@/components/outfit/StarRating';
import { ClothingItem } from '@/lib/supabase/types';

interface OutfitDisplayProps {
    situation: string;
    items: ClothingItem[];
    stylingReason?: string;
    stylingTips?: string;
    onReset: () => void;
    onSave: () => void;
    onRate?: (rating: number) => void;
}

export default function OutfitDisplay({ situation, items, stylingReason, stylingTips, onReset, onSave, onRate }: OutfitDisplayProps) {
    return (
        <div className="space-y-8 animate-slide-up">

            {/* Header */}
            <div>
                <p className="text-xs tracking-[0.25em] text-neutral-600 uppercase mb-3">AI Suggestion</p>
                <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl font-semibold text-white tracking-tight">Your Outfit</h2>
                    <span className="text-sm text-neutral-500 capitalize">— {situation.replace('_', ' ')}</span>
                </div>
            </div>

            {/* Outfit Items — asymmetric grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item, i) => {
                    const imageUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];
                    const isHero = i === 0;
                    return (
                        <div
                            key={item.id}
                            className={`group relative bg-neutral-950 overflow-hidden ${isHero ? 'col-span-2 row-span-2' : ''}`}
                            style={{ aspectRatio: isHero ? '1 / 1' : '1 / 1' }}
                        >
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt={item.ai_description?.type || 'Outfit item'}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-neutral-800">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            {/* Label overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-white text-xs font-medium truncate">
                                    {item.name || item.ai_description?.type || item.category}
                                </p>
                                <p className="text-neutral-400 text-[10px] uppercase tracking-[0.06em] mt-0.5">{item.category}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Styling Reason */}
            {stylingReason && (
                <div className="border-l-2 border-white/20 pl-5 py-1">
                    <p className="text-xs tracking-[0.2em] text-neutral-600 uppercase mb-2">Why this works</p>
                    <p className="text-sm text-neutral-300 leading-relaxed">{stylingReason}</p>
                </div>
            )}

            {/* Styling Tips */}
            {stylingTips && (
                <div className="border-l-2 border-white/10 pl-5 py-1">
                    <p className="text-xs tracking-[0.2em] text-neutral-600 uppercase mb-2">Styling tips</p>
                    <p className="text-sm text-neutral-500 leading-relaxed">{stylingTips}</p>
                </div>
            )}

            {/* Star Rating */}
            {onRate && (
                <div className="pt-2 border-t border-white/8">
                    <p className="text-xs tracking-[0.2em] text-neutral-700 uppercase mb-3">Rate this outfit</p>
                    <StarRating onRate={onRate} />
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={onReset}>
                    Try another
                </Button>
                <Button className="flex-1" onClick={onSave}>
                    Save to lookbook
                </Button>
            </div>
        </div>
    );
}
