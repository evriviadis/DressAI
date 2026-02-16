'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { ClothingItem, AIDescription } from '@/lib/supabase/types';

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ClothingItem;
    onSave: (updatedItem: ClothingItem) => void;
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

export default function EditItemModal({ isOpen, onClose, item, onSave }: EditItemModalProps) {
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
    const [error, setError] = useState('');
    const [occasionInput, setOccasionInput] = useState('');

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

    const inputClass =
        'w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm';
    const labelClass = 'block text-sm font-medium text-muted mb-1.5';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Item" size="lg">
            <div className="p-6 space-y-5">
                {/* Error Message */}
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                        {error}
                    </div>
                )}

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

                {/* Divider */}
                <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">AI Description Fields</h3>

                    {/* Two-column grid for shorter fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Material</label>
                            <input
                                type="text"
                                value={aiDesc.material || ''}
                                onChange={e => setAiDesc(prev => ({ ...prev, material: e.target.value }))}
                                className={inputClass}
                                placeholder="e.g. Cotton, Denim"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Fit</label>
                            <input
                                type="text"
                                value={aiDesc.fit || ''}
                                onChange={e => setAiDesc(prev => ({ ...prev, fit: e.target.value }))}
                                className={inputClass}
                                placeholder="e.g. Slim, Relaxed"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Pattern</label>
                            <input
                                type="text"
                                value={aiDesc.pattern || ''}
                                onChange={e => setAiDesc(prev => ({ ...prev, pattern: e.target.value }))}
                                className={inputClass}
                                placeholder="e.g. Solid, Striped"
                            />
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div>
                    <label className={labelClass}>Colors</label>
                    <div className="flex gap-4 items-center">
                        {(['primary', 'secondary', 'accent'] as const).map(colorKey => (
                            <div key={colorKey} className="flex flex-col items-center gap-1">
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={aiDesc.colors?.[colorKey] || '#000000'}
                                        onChange={e => updateColor(colorKey, e.target.value)}
                                        className="w-10 h-10 rounded-full cursor-pointer border-2 border-border overflow-hidden appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full"
                                    />
                                </div>
                                <span className="text-xs text-muted capitalize">{colorKey}</span>
                            </div>
                        ))}
                    </div>
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
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'bg-border-light text-muted hover:text-foreground border border-border'
                                    }`}
                            >
                                {season}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Occasions (tag input) */}
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

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
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
        </Modal>
    );
}
