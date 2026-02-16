'use client';

import Image from 'next/image';
import Card from '@/components/ui/Card';
import { ClothingItem } from '@/lib/supabase/types';

interface ItemCardProps {
    item: ClothingItem;
    onClick?: () => void;
    onDelete?: (id: string) => void;
    onEdit?: (item: ClothingItem) => void;
    selected?: boolean;
}

export default function ItemCard({ item, onClick, onEdit, selected = false }: ItemCardProps) {
    const imageUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];
    const description = item.ai_description;

    const handleCardClick = () => {
        // If onClick is provided (e.g. outfit selection mode), use it
        if (onClick) {
            onClick();
            return;
        }
        // Otherwise, open the edit modal
        if (onEdit) {
            onEdit(item);
        }
    };

    return (
        <Card
            hover
            padding="none"
            className={`overflow-hidden group cursor-pointer ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            onClick={handleCardClick}
        >
            {/* Image */}
            <div className="relative aspect-square bg-border-light overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={description?.type || 'Clothing item'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-lg backdrop-blur-sm capitalize">
                        {item.category}
                    </span>
                </div>

                {/* Selected Checkmark */}
                {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="p-3">
                <h3 className="font-medium text-foreground truncate">
                    {item.name || description?.type || 'Unknown Item'}
                </h3>

                {/* Color Dots */}
                {description?.colors && (
                    <div className="flex items-center gap-1.5 mt-2">
                        {description.colors.primary && (
                            <div
                                className="w-4 h-4 rounded-full border border-border shadow-sm"
                                style={{ backgroundColor: description.colors.primary }}
                                title={description.colors.primary}
                            />
                        )}
                        {description.colors.secondary && (
                            <div
                                className="w-4 h-4 rounded-full border border-border shadow-sm"
                                style={{ backgroundColor: description.colors.secondary }}
                                title={description.colors.secondary}
                            />
                        )}
                        {description.colors.accent && (
                            <div
                                className="w-4 h-4 rounded-full border border-border shadow-sm"
                                style={{ backgroundColor: description.colors.accent }}
                                title={description.colors.accent}
                            />
                        )}
                    </div>
                )}

                {/* Style Tags */}
                {description?.style_vibes && description.style_vibes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {description.style_vibes.slice(0, 2).map((vibe, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 text-xs text-muted bg-border-light rounded-md capitalize"
                            >
                                {vibe}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
