'use client';

import Image from 'next/image';
import { ClothingItem } from '@/lib/supabase/types';
import { motion } from 'framer-motion';

interface ItemCardProps {
    item: ClothingItem;
    onClick?: () => void;
    onDelete?: (id: string) => void;
    onEdit?: (item: ClothingItem) => void;
    selected?: boolean;
    index?: number; // Used for stagger animations
}

export default function ItemCard({ item, onClick, onEdit, selected = false, index = 0 }: ItemCardProps) {
    const imageUrl = item.image_urls?.front || Object.values(item.image_urls || {})[0];

    const handleClick = () => {
        if (onClick) { onClick(); return; }
        if (onEdit) onEdit(item);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{
                duration: 0.5,
                type: 'spring',
                stiffness: 260,
                damping: 20
            }}
            whileHover={{ scale: 1.03, y: -6, zIndex: 10 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClick}
            className={`group cursor-pointer relative ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-black rounded-2xl' : ''}`}
        >
            {/* Soft glow behind the card on hover */}
            <div className="absolute -inset-3 bg-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

            {/* Taller, sleeker card container */}
            <div className="relative aspect-[4/5] bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.08)] group-hover:border-white/20 transition-all duration-500">
                {imageUrl ? (
                    <>
                        <Image
                            src={imageUrl}
                            alt={item.name || 'Clothing item'}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Permanent subtle bottom gradient for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                        {/* Dramatic hover overlay for extra darkening */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Text inside the card */}
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-[10px] text-white/60 uppercase tracking-[0.15em] font-semibold mb-1">
                                {item.category}
                            </p>
                            <p className="text-base text-white font-medium truncate drop-shadow-md">
                                {item.name || item.ai_description?.type}
                            </p>
                            {item.ai_description?.colors?.primary && (
                                <p className="text-xs text-neutral-300 mt-0.5 capitalize opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    {item.ai_description.colors.primary}
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-700 bg-neutral-900 border border-white/5">
                        <svg className="w-10 h-10 group-hover:text-neutral-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Selected check */}
                {selected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
