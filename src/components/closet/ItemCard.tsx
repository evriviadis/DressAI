'use client';

import Image from 'next/image';
import Card from '@/components/ui/Card';
import { ClothingItem } from '@/lib/supabase/types';
import { useState } from 'react';

interface ItemCardProps {
    item: ClothingItem;
    onClick?: () => void;
    onDelete?: (id: string) => void;
    onEdit?: (item: ClothingItem) => void;
    selected?: boolean;
}

export default function ItemCard({ item, onClick, onDelete, onEdit, selected = false }: ItemCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const imageUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];
    const description = item.ai_description;

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowConfirm(true);
    };

    const confirmDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/items/${item.id}`, {
                method: 'DELETE',
            });
            if (response.ok && onDelete) {
                onDelete(item.id);
            } else {
                alert('Failed to delete item');
            }
        } catch {
            alert('Failed to delete item');
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    const cancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowConfirm(false);
    };

    return (
        <Card
            hover={!!onClick}
            padding="none"
            className={`overflow-hidden group ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            onClick={onClick}
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

                {/* Edit Button */}
                {onEdit && !showConfirm && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                        className="absolute top-2 right-12 w-8 h-8 bg-black/50 hover:bg-primary text-white rounded-lg backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit item"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                )}

                {/* Delete Button */}
                {onDelete && !showConfirm && (
                    <button
                        onClick={handleDelete}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-error text-white rounded-lg backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete item"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}

                {/* Confirm Delete Overlay */}
                {showConfirm && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 animate-fade-in">
                        <p className="text-white text-sm text-center mb-3">Delete this item?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={cancelDelete}
                                className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-3 py-1.5 text-sm bg-error hover:bg-error/80 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}

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
