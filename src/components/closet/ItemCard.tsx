'use client';

import Image from 'next/image';
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

    const handleClick = () => {
        if (onClick) { onClick(); return; }
        if (onEdit) onEdit(item);
    };

    return (
        <div
            onClick={handleClick}
            className={`group cursor-pointer transition-opacity duration-200 ${selected ? 'ring-1 ring-white ring-offset-1 ring-offset-black' : ''}`}
        >
            {/* Square image */}
            <div className="relative aspect-square bg-neutral-950 overflow-hidden">
                {imageUrl ? (
                    <>
                        <Image
                            src={imageUrl}
                            alt={item.name || 'Clothing item'}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        {/* Subtle hover overlay with item name */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                            <div className="w-full p-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                <p className="text-[10px] text-white font-medium truncate leading-tight">
                                    {item.name || item.ai_description?.type}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-800">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Selected check */}
                {selected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-white flex items-center justify-center">
                        <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Label below image */}
            <div className="pt-1.5">
                <p className="text-[10px] text-neutral-700 uppercase tracking-[0.08em]">{item.category}</p>
            </div>
        </div>
    );
}
