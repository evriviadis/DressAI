'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import StarRating from '@/components/outfit/StarRating';
import { ClothingItem } from '@/lib/supabase/types';
import { motion } from 'framer-motion';

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
        >

            {/* Header */}
            <div className="text-center pt-8 pb-4">
                <p className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase mb-4">AI Stylist Curated</p>
                <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">
                    Your Look
                </h2>
                <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-neutral-300 capitalize tracking-wide">
                    {situation.replace('_', ' ')}
                </span>
            </div>

            {/* Outfit Items — Premium Asymmetric Editorial Grid */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]"
            >
                {items.map((item, i) => {
                    const imageUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];
                    // The first item (usually main piece) is much larger
                    const isMainPiece = i === 0;

                    return (
                        <motion.div
                            key={item.id}
                            variants={{
                                hidden: { opacity: 0, scale: 0.95, y: 20 },
                                visible: {
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    transition: { type: 'spring', stiffness: 200, damping: 20 }
                                }
                            }}
                            className={`group relative bg-neutral-900 overflow-hidden rounded-2xl border border-white/5 shadow-xl ${isMainPiece ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
                        >
                            {imageUrl ? (
                                <>
                                    <Image
                                        src={imageUrl}
                                        alt={item.ai_description?.type || 'Outfit item'}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Vignette to frame the image nicely */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 mix-blend-multiply opacity-50 transition-opacity duration-300 group-hover:opacity-30" />
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-neutral-800">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}

                            {/* Label overlay using glassmorphism */}
                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <p className="text-white text-sm font-medium truncate drop-shadow">
                                    {item.name || item.ai_description?.type || item.category}
                                </p>
                                <p className="text-neutral-300 text-[10px] uppercase tracking-[0.1em] mt-1 font-semibold">
                                    {item.category}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Styling Context */}
            <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-white/10">
                {stylingReason && (
                    <div className="bg-neutral-900/50 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-white/20" />
                        <p className="text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-3 font-semibold">Why this works</p>
                        <p className="text-sm text-neutral-300 leading-relaxed">{stylingReason}</p>
                    </div>
                )}

                {stylingTips && (
                    <div className="bg-neutral-900/50 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-neutral-600/30" />
                        <p className="text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-3 font-semibold">Styling tips</p>
                        <p className="text-sm text-neutral-400 leading-relaxed font-light">{stylingTips}</p>
                    </div>
                )}
            </div>

            {/* Star Rating Area */}
            {onRate && (
                <div className="flex flex-col items-center pt-8 border-t border-white/10">
                    <p className="text-xs tracking-[0.15em] text-neutral-500 uppercase mb-4">How did we do?</p>
                    <div className="bg-neutral-900/80 backdrop-blur-sm px-8 py-4 rounded-full border border-white/10 shadow-lg">
                        <StarRating onRate={onRate} />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button variant="outline" className="flex-1 rounded-full py-4 text-sm tracking-wide" onClick={onReset}>
                    Discard & Retry
                </Button>
                <Button className="flex-1 rounded-full py-4 text-sm tracking-wide bg-white text-black hover:bg-neutral-200 border-none transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={onSave}>
                    Save to Lookbook
                </Button>
            </div>
        </motion.div>
    );
}
