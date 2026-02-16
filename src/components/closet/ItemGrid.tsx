'use client';

import { ClothingItem } from '@/lib/supabase/types';
import ItemCard from './ItemCard';

interface ItemGridProps {
    items: ClothingItem[];
    onItemClick?: (item: ClothingItem) => void;
    onItemDelete?: (itemId: string) => void;
    onItemEdit?: (item: ClothingItem) => void;
    selectedIds?: string[];
    emptyMessage?: string;
}

export default function ItemGrid({ items, onItemClick, onItemDelete, onItemEdit, selectedIds = [], emptyMessage }: ItemGridProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-border-light flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <p className="text-muted text-lg">
                    {emptyMessage || 'Your closet is empty'}
                </p>
                <p className="text-muted-light text-sm mt-1">
                    Add your first item to get started
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
                <ItemCard
                    key={item.id}
                    item={item}
                    onClick={onItemClick ? () => onItemClick(item) : undefined}
                    onDelete={onItemDelete}
                    onEdit={onItemEdit}
                    selected={selectedIds.includes(item.id)}
                />
            ))}
        </div>
    );
}
