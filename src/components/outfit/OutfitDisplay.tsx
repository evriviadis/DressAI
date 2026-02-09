'use client';

import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ClothingItem } from '@/lib/supabase/types';

interface OutfitDisplayProps {
    situation: string;
    items: ClothingItem[];
    stylingReason?: string;
    stylingTips?: string;
    onReset: () => void;
    onSave: () => void;
}

export default function OutfitDisplay({
    situation,
    items,
    stylingReason,
    stylingTips,
    onReset,
    onSave
}: OutfitDisplayProps) {
    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-3">
                    <span className="text-sm font-medium text-primary capitalize">{situation}</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Your Perfect Outfit</h2>
            </div>

            {/* Outfit Items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                    const imageUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];
                    return (
                        <Card key={item.id} padding="none" className="overflow-hidden group">
                            <div className="relative aspect-square bg-border-light">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={item.ai_description?.type || 'Outfit item'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                    <p className="text-white text-sm font-medium truncate">
                                        {item.name || item.ai_description?.type || item.category}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Styling Reason */}
            {stylingReason && (
                <Card className="bg-gradient-to-br from-primary/5 to-primary-light/5 border-primary/20">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground mb-1">Why this works</h3>
                            <p className="text-muted text-sm">{stylingReason}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Styling Tips */}
            {stylingTips && (
                <Card>
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground mb-1">Styling tips</h3>
                            <p className="text-muted text-sm">{stylingTips}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onReset}>
                    Try Another Situation
                </Button>
                <Button className="flex-1" onClick={onSave}>
                    Save Outfit
                </Button>
            </div>
        </div>
    );
}
