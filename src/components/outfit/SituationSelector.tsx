'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface SituationSelectorProps {
    onSelect: (situation: string) => void;
    isLoading?: boolean;
}

const PRESET_SITUATIONS = [
    { value: 'office', label: 'Office', description: 'Professional workwear', icon: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z' },
    { value: 'casual', label: 'Casual', description: 'Everyday comfort', icon: 'M12 3a4 4 0 014 4c0 1.5-.8 2.8-2 3.5V12h2l2 9H6l2-9h2v-1.5A4 4 0 0112 3z' },
    { value: 'date_night', label: 'Date Night', description: 'Romantic evening', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { value: 'wedding', label: 'Wedding', description: 'Formal celebration', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { value: 'gym', label: 'Gym', description: 'Active workout', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064' },
    { value: 'beach', label: 'Beach', description: 'Sunny relaxation', icon: 'M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02l.707.707M1 12h2m18 0h2M4.22 19.78l.707-.707M18.95 5.05l.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z' },
    { value: 'party', label: 'Party', description: 'Night out vibes', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { value: 'travel', label: 'Travel', description: 'Comfortable journey', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
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
        if (situation) onSelect(situation.replace('_', ' '));
    };

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Header */}
            <div>
                <p className="text-xs tracking-[0.25em] text-neutral-600 uppercase mb-3">AI Stylist</p>
                <h2 className="text-3xl font-semibold text-white leading-tight tracking-tight">
                    What&apos;s the occasion?
                </h2>
                <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                    Select a situation and we&apos;ll build the perfect outfit from your closet.
                </p>
            </div>

            {/* Preset Grid */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                    }
                }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
                {PRESET_SITUATIONS.map((situation) => {
                    const isSelected = selectedPreset === situation.value && !showCustom;
                    return (
                        <motion.button
                            key={situation.value}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePresetSelect(situation.value)}
                            className={`group relative p-5 text-left rounded-2xl border transition-colors cursor-pointer overflow-hidden ${isSelected
                                ? 'bg-white border-white'
                                : 'bg-neutral-900 border-white/5 hover:border-white/20'
                                }`}
                        >
                            {/* Subtle hover glow */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <svg
                                className={`w-6 h-6 mb-4 transition-colors ${isSelected ? 'text-black' : 'text-neutral-500 group-hover:text-white'}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            >
                                <path d={situation.icon} />
                            </svg>
                            <p className={`text-sm font-semibold tracking-wide transition-colors ${isSelected ? 'text-black' : 'text-white'}`}>
                                {situation.label}
                            </p>
                            <p className={`text-[10px] mt-1 uppercase tracking-wider transition-colors ${isSelected ? 'text-neutral-600' : 'text-neutral-500 group-hover:text-neutral-400'}`}>
                                {situation.description}
                            </p>
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Divider + Custom toggle */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/8" />
                <button
                    onClick={() => { setShowCustom(!showCustom); setSelectedPreset(null); }}
                    className="text-xs text-neutral-600 hover:text-white transition-colors cursor-pointer tracking-wide"
                >
                    {showCustom ? '← Back to presets' : 'Describe your own →'}
                </button>
                <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Custom Input */}
            {showCustom && (
                <div className="animate-fade-in">
                    <input
                        type="text"
                        value={customSituation}
                        onChange={(e) => setCustomSituation(e.target.value)}
                        placeholder="e.g. Outdoor summer brunch with friends"
                        className="input-dark w-full px-4 py-3 text-sm"
                        autoFocus
                    />
                </div>
            )}

            {/* Submit */}
            <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={(!selectedPreset && !customSituation) || isLoading}
            >
                {isLoading ? 'Styling your outfit…' : 'Get Outfit Suggestion'}
            </Button>
        </div>
    );
}
