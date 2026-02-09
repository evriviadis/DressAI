'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface SituationSelectorProps {
    onSelect: (situation: string) => void;
    isLoading?: boolean;
}

const PRESET_SITUATIONS = [
    { value: 'office', label: 'Office', emoji: '💼', description: 'Professional workwear' },
    { value: 'casual', label: 'Casual', emoji: '☕', description: 'Everyday comfort' },
    { value: 'date_night', label: 'Date Night', emoji: '🌹', description: 'Romantic evening' },
    { value: 'wedding', label: 'Wedding', emoji: '💒', description: 'Formal celebration' },
    { value: 'gym', label: 'Gym', emoji: '🏋️', description: 'Active workout' },
    { value: 'beach', label: 'Beach', emoji: '🏖️', description: 'Sunny relaxation' },
    { value: 'party', label: 'Party', emoji: '🎉', description: 'Night out vibes' },
    { value: 'travel', label: 'Travel', emoji: '✈️', description: 'Comfortable journey' },
];

export default function SituationSelector({ onSelect, isLoading = false }: SituationSelectorProps) {
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [customSituation, setCustomSituation] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    const handlePresetSelect = (value: string) => {
        setSelectedPreset(value);
        setShowCustom(false);
        setCustomSituation('');
    };

    const handleSubmit = () => {
        const situation = showCustom ? customSituation : selectedPreset;
        if (situation) {
            onSelect(situation.replace('_', ' '));
        }
    };

    return (
        <Card padding="lg" className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">What&apos;s the occasion?</h2>
                <p className="text-muted text-sm">Select a situation and our AI will suggest the perfect outfit from your closet.</p>
            </div>

            {/* Preset Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_SITUATIONS.map((situation) => (
                    <button
                        key={situation.value}
                        onClick={() => handlePresetSelect(situation.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedPreset === situation.value && !showCustom
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                : 'border-border hover:border-muted hover:bg-card-hover'
                            }`}
                    >
                        <span className="text-3xl">{situation.emoji}</span>
                        <span className="font-medium text-foreground">{situation.label}</span>
                        <span className="text-xs text-muted hidden sm:block">{situation.description}</span>
                    </button>
                ))}
            </div>

            {/* Custom Input Toggle */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <button
                    onClick={() => {
                        setShowCustom(!showCustom);
                        setSelectedPreset(null);
                    }}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                >
                    {showCustom ? 'Use preset' : 'Or describe your own'}
                </button>
                <div className="flex-1 h-px bg-border" />
            </div>

            {/* Custom Input */}
            {showCustom && (
                <div className="animate-fade-in">
                    <input
                        type="text"
                        value={customSituation}
                        onChange={(e) => setCustomSituation(e.target.value)}
                        placeholder="e.g., Outdoor summer brunch with friends"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted"
                    />
                </div>
            )}

            {/* Submit Button */}
            <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={(!selectedPreset && !customSituation) || isLoading}
            >
                {isLoading ? 'Finding your perfect outfit...' : 'Get Outfit Suggestion'}
            </Button>
        </Card>
    );
}
