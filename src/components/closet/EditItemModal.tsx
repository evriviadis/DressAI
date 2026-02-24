'use client';

import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { ClothingItem, AIDescription } from '@/lib/supabase/types';

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ClothingItem;
    onSave: (updatedItem: ClothingItem) => void;
    onDelete?: (itemId: string) => void;
}

const CATEGORY_OPTIONS = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'outerwear', label: 'Outerwear' },
    { value: 'dress', label: 'Dress' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessory', label: 'Accessory' },
];

const SEASON_OPTIONS = ['spring', 'summer', 'autumn', 'winter'];

export default function EditItemModal({ isOpen, onClose, item, onSave, onDelete }: EditItemModalProps) {
    const [name, setName] = useState(item.name);
    const [category, setCategory] = useState(item.category);
    const [aiDesc, setAiDesc] = useState<AIDescription>({
        ...item.ai_description,
        colors: { ...item.ai_description?.colors },
        details: [...(item.ai_description?.details || [])],
        style_vibes: [...(item.ai_description?.style_vibes || [])],
        occasions: [...(item.ai_description?.occasions || [])],
        season: [...(item.ai_description?.season || [])],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState('');
    const [occasionInput, setOccasionInput] = useState('');
    const [styleVibeInput, setStyleVibeInput] = useState('');

    const imageUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];

    const updateColor = (key: 'primary' | 'secondary' | 'accent', value: string) => {
        setAiDesc(prev => ({
            ...prev,
            colors: { ...prev.colors, [key]: value },
        }));
    };

    const toggleSeason = (season: string) => {
        setAiDesc(prev => ({
            ...prev,
            season: prev.season.includes(season)
                ? prev.season.filter(s => s !== season)
                : [...prev.season, season],
        }));
    };

    const addOccasion = () => {
        const trimmed = occasionInput.trim();
        if (trimmed && !aiDesc.occasions.includes(trimmed)) {
            setAiDesc(prev => ({
                ...prev,
                occasions: [...prev.occasions, trimmed],
            }));
            setOccasionInput('');
        }
    };

    const removeOccasion = (occ: string) => {
        setAiDesc(prev => ({
            ...prev,
            occasions: prev.occasions.filter(o => o !== occ),
        }));
    };

    const addStyleVibe = () => {
        const trimmed = styleVibeInput.trim();
        if (trimmed && !aiDesc.style_vibes.includes(trimmed)) {
            setAiDesc(prev => ({
                ...prev,
                style_vibes: [...prev.style_vibes, trimmed],
            }));
            setStyleVibeInput('');
        }
    };

    const removeStyleVibe = (vibe: string) => {
        setAiDesc(prev => ({
            ...prev,
            style_vibes: prev.style_vibes.filter(v => v !== vibe),
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    category,
                    ai_description: aiDesc,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to save changes');
                return;
            }

            onSave(data.item);
            onClose();
        } catch {
            setError('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {

        setIsDeleting(true);
        setError('');

        try {
            const response = await fetch(`/api/items/${item.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onDelete?.(item.id);
                onClose();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete item');
            }
        } catch {
            setError('Failed to delete item. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const inputClass =
        'w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm';
    const labelClass = 'block text-sm font-medium text-muted mb-1.5';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Item Details" size="xl">
            <div className="p-6">
                {/* Error Message */}
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm mb-5">
                        {error}
                    </div>
                )}

                {/* Two-Column Layout */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Col: Image */}
                    <div className="md:w-2/5 flex-shrink-0">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-border-light">
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt={item.name || 'Clothing item'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted">
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Color Dots under image */}
                        <div className="mt-4">
                            <label className={labelClass}>Colors</label>
                            <div className="flex gap-4 items-center">
                                {(['primary', 'secondary', 'accent'] as const).map(colorKey => (
                                    <div key={colorKey} className="flex flex-col items-center gap-1">
                                        <input
                                            type="color"
                                            value={aiDesc.colors?.[colorKey] || '#000000'}
                                            onChange={e => updateColor(colorKey, e.target.value)}
                                            className="w-10 h-10 rounded-full cursor-pointer border-2 border-border overflow-hidden appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full"
                                        />
                                        <span className="text-xs text-muted capitalize">{colorKey}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Form */}
                    <div className="flex-1 space-y-4">
                        {/* Name */}
                        <div>
                            <label className={labelClass}>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={inputClass}
                                placeholder="Item name"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className={labelClass}>Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className={inputClass}
                            >
                                {CATEGORY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Material & Fit */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Material</label>
                                <input
                                    type="text"
                                    value={aiDesc.material || ''}
                                    onChange={e => setAiDesc(prev => ({ ...prev, material: e.target.value }))}
                                    className={inputClass}
                                    placeholder="e.g. Cotton"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Fit</label>
                                <input
                                    type="text"
                                    value={aiDesc.fit || ''}
                                    onChange={e => setAiDesc(prev => ({ ...prev, fit: e.target.value }))}
                                    className={inputClass}
                                    placeholder="e.g. Slim"
                                />
                            </div>
                        </div>

                        {/* Pattern */}
                        <div>
                            <label className={labelClass}>Pattern</label>
                            <input
                                type="text"
                                value={aiDesc.pattern || ''}
                                onChange={e => setAiDesc(prev => ({ ...prev, pattern: e.target.value }))}
                                className={inputClass}
                                placeholder="e.g. Striped"
                            />
                        </div>

                        {/* Seasons */}
                        <div>
                            <label className={labelClass}>Seasons</label>
                            <div className="flex flex-wrap gap-2">
                                {SEASON_OPTIONS.map(season => (
                                    <button
                                        key={season}
                                        type="button"
                                        onClick={() => toggleSeason(season)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${aiDesc.season.includes(season)
                                            ? 'bg-foreground text-background shadow-md'
                                            : 'bg-border-light text-muted hover:text-foreground hover:border-foreground/30 border border-border'
                                            }`}
                                    >
                                        {season}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Style Tags (new badge input) */}
                        <div>
                            <label className={labelClass}>Style Tags</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {aiDesc.style_vibes.map(vibe => (
                                    <span
                                        key={vibe}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20"
                                    >
                                        {vibe}
                                        <button
                                            type="button"
                                            onClick={() => removeStyleVibe(vibe)}
                                            className="hover:text-error transition-colors ml-0.5"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={styleVibeInput}
                                    onChange={e => setStyleVibeInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addStyleVibe();
                                        }
                                    }}
                                    className={inputClass}
                                    placeholder="Add a style tag and press Enter"
                                />
                                <Button variant="outline" onClick={addStyleVibe} className="shrink-0">
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* Occasions */}
                        <div>
                            <label className={labelClass}>Occasions</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {aiDesc.occasions.map(occ => (
                                    <span
                                        key={occ}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                    >
                                        {occ}
                                        <button
                                            type="button"
                                            onClick={() => removeOccasion(occ)}
                                            className="hover:text-error transition-colors ml-0.5"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={occasionInput}
                                    onChange={e => setOccasionInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addOccasion();
                                        }
                                    }}
                                    className={inputClass}
                                    placeholder="Add an occasion and press Enter"
                                />
                                <Button variant="outline" onClick={addOccasion} className="shrink-0">
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-border">
                    {/* Delete (Left) */}
                    {showDeleteConfirm ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <span className="text-sm text-muted">Delete this item?</span>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-3 py-1.5 text-xs font-medium bg-border-light hover:bg-border text-muted rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-3 py-1.5 text-xs font-medium bg-error hover:bg-error/80 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Item
                        </button>
                    )}

                    {/* Save / Cancel (Right) */}
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} disabled={isSaving || isDeleting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving || isDeleting}>
                            {isSaving ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving…
                                </span>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
